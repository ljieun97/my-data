import assert from "node:assert/strict";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../lib/movie-export.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const movieExport = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

const makeMovie = (id, popularity = id) => ({
  id, rank: 0, runtime: 40, title: `Movie ${id}`, original_title: `Movie ${id}`,
  release_date: "2025-01-01", genre_ids: [], original_language: "en",
  vote_average: 5, vote_count: 1, popularity, overview: "Overview", poster_path: null,
  genres: "", countries: "", companies: "", directors: "", actors: "",
});

test("연도와 날짜 범위를 엄격하게 검증한다", () => {
  assert.equal(movieExport.validateYear("2025", 2026), 2025);
  assert.equal(movieExport.validateYear("2025.5", 2026), null);
  assert.equal(movieExport.isWindowInYear({ from: "2025-02-01", to: "2025-02-28" }, 2025), true);
  assert.equal(movieExport.isWindowInYear({ from: "2025-02-30", to: "2025-03-01" }, 2025), false);
  assert.equal(movieExport.isWindowInYear({ from: "2024-12-31", to: "2025-01-01" }, 2025), false);
});

test("500페이지 이하는 월별 분리 없이 연도 전체를 한 번에 계획한다", async () => {
  const requested = [];
  const plan = await movieExport.planExportWindows(2025, async (window) => {
    requested.push(window);
    return { ...window, totalPages: 398, totalResults: 7944 };
  });
  assert.deepEqual(requested, [{ from: "2025-01-01", to: "2025-12-31" }]);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].totalResults, 7944);
});

test("500페이지가 넘을 때만 날짜 구간을 겹치지 않게 나눈다", async () => {
  const plan = await movieExport.planExportWindows(2025, async (window) => {
    const isWholeYear = window.from === "2025-01-01" && window.to === "2025-12-31";
    return {
      ...window,
      totalPages: isWholeYear ? 501 : 251,
      totalResults: isWholeYear ? 10002 : 5001,
    };
  });
  assert.equal(plan.length, 2);
  assert.deepEqual(plan.map((item) => [item.from, item.to]), [
    ["2025-01-01", "2025-07-02"],
    ["2025-07-03", "2025-12-31"],
  ]);
});

test("TOP 제한 없이 모든 페이지를 모으고 마지막에 인기도순으로 정렬한다", async () => {
  const plan = [{ from: "2025-01-01", to: "2025-01-31", totalPages: 2, totalResults: 3 }];
  const movies = await movieExport.collectExportMovies(plan, async (window, page) => ({
    ...window, page, totalPages: 2, totalResults: 3,
    scannedIds: page === 1 ? [1, 2] : [3],
    excludedIds: [],
    movies: page === 1 ? [makeMovie(1, 1), makeMovie(2, 3)] : [makeMovie(3, 2)],
  }));
  assert.deepEqual(movies.map((movie) => movie.id), [2, 3, 1]);
  assert.deepEqual(movies.map((movie) => movie.rank), [1, 2, 3]);
});

test("샘플 페이지 제한은 구간 수와 관계없이 누적 페이지에 적용한다", async () => {
  const plan = [
    { from: "2025-01-01", to: "2025-01-31", totalPages: 2, totalResults: 3 },
    { from: "2025-02-01", to: "2025-02-28", totalPages: 2, totalResults: 3 },
  ];
  const requested = [];
  const progress = [];
  const movies = await movieExport.collectExportMovies(plan, async (window, page) => {
    requested.push([window.from, page]);
    const id = requested.length;
    return {
      ...window, page, totalPages: 2, totalResults: 3,
      scannedIds: [id], excludedIds: [], movies: [makeMovie(id)],
    };
  }, (value) => progress.push(value), { maxPages: 3 });

  assert.deepEqual(requested, [["2025-01-01", 1], ["2025-01-01", 2], ["2025-02-01", 1]]);
  assert.deepEqual(movies.map((movie) => movie.id), [3, 2, 1]);
  assert.equal(progress.at(-1).completedPages, 3);
  assert.equal(progress.at(-1).totalPages, 3);
});

test("중복이나 누락이 있으면 부분 엑셀을 만들지 않는다", async () => {
  const plan = [{ from: "2025-01-01", to: "2025-01-31", totalPages: 2, totalResults: 2 }];
  await assert.rejects(
    movieExport.collectExportMovies(plan, async (window, page) => ({
      ...window, page, totalPages: 2, totalResults: 2, scannedIds: [1], excludedIds: [], movies: [makeMovie(1)],
    })),
    /중복되거나/,
  );
});

test("목록 필터와 상세 상영시간이 다른 항목은 검증 후 제외한다", async () => {
  const plan = [{ from: "2025-01-01", to: "2025-01-31", totalPages: 1, totalResults: 2 }];
  const movies = await movieExport.collectExportMovies(plan, async (window, page) => ({
    ...window, page, totalPages: 1, totalResults: 2,
    scannedIds: [1, 2], excludedIds: [2], movies: [makeMovie(1)],
  }));
  assert.deepEqual(movies.map((movie) => movie.id), [1]);
});

test("한국어 줄거리가 없는 영화가 포함되면 내보내기를 중단한다", async () => {
  const plan = [{ from: "2025-01-01", to: "2025-01-31", totalPages: 1, totalResults: 1 }];
  await assert.rejects(
    movieExport.collectExportMovies(plan, async (window, page) => ({
      ...window, page, totalPages: 1, totalResults: 1,
      scannedIds: [1], excludedIds: [], movies: [{ ...makeMovie(1), overview: "" }],
    })),
    /조건에 맞지 않는/,
  );
});

test("엑셀에 선택 목록과 TMDB ID 기반 감상기록을 만든다", async () => {
  const builderPath = new URL("../lib/movie-export-workbook.ts", import.meta.url);
  const builderSource = await readFile(builderPath, "utf8");
  const builderJs = ts.transpileModule(builderSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const compiledPath = new URL("./.movie-export-workbook.cjs", import.meta.url);
  await writeFile(compiledPath, builderJs);
  try {
    const require = createRequire(import.meta.url);
    const compiledFile = fileURLToPath(compiledPath);
    delete require.cache[require.resolve(compiledFile)];
    const { createWorkbook } = require(compiledFile);
    const ExcelJS = require("exceljs");
    const buffer = await createWorkbook(2025, [makeMovie(1), makeMovie(2)]);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet("영화목록");
    const table = sheet.getTable("TmdbMovieExport");
    assert.equal(sheet.rowCount, 6);
    assert.equal(sheet.columnCount, 14);
    assert.match(sheet.getCell("A1").value, /2025년 TMDB 영화 2편/);
    assert.equal(sheet.getCell("A4").value, "선택");
    assert.equal(sheet.getCell("A5").value, "미선택");
    assert.equal(sheet.getCell("M5").value, 40);
    assert.deepEqual(sheet.getRow(4).values.slice(1, 14), [
      "선택", "TMDB ID", "한국어 제목", "원제", "개봉일", "장르", "제작 국가", "제작사", "감독",
      "배우 전체", "원어", "한국어 줄거리", "상영시간(분)",
    ]);
    assert.equal(sheet.getCell("N4").value, "_선택번호");
    assert.equal(sheet.getColumn(14).hidden, true);
    assert.match(sheet.getCell("N5").value.formula, /COUNTIF\(\$A\$5:A5,"선택"\)/);
    assert.equal(table.table.columns.every((column) => column.filterButton !== false), true);
    assert.equal(table.table.style.theme, "TableStyleLight1");
    assert.equal(table.table.style.showRowStripes, false);
    assert.equal(sheet.getCell("B5").border.bottom.style, "thin");
    assert.equal(sheet.getCell("B5").border.right.color.argb, "FFD9D9D9");
    assert.equal(sheet.getCell("A5").dataValidation.formulae[0], "SelectionOptions");

    const reviews = workbook.getWorksheet("감상기록");
    const reviewTable = reviews.getTable("MovieReviews");
    assert.equal(reviewTable.table.style.theme, "TableStyleLight1");
    assert.equal(reviewTable.table.style.showRowStripes, false);
    assert.equal(reviews.getCell("B5").border.right.style, "thin");
    assert.deepEqual(reviewTable.table.columns.map((column) => column.name), [
      "TMDB ID", "한국어 제목", "원제", "개봉일", "장르", "제작 국가", "제작사", "감독",
      "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "내 별점", "감상평",
    ]);
    assert.match(reviews.getCell("A5").value.formula, /^IFERROR\(INDEX\('영화목록'!\$B\$5:\$B\$6,MATCH/);
    assert.match(reviews.getCell("A6").value.formula, /ROWS\(\$A\$5:A6\)/);
    assert.match(reviews.getCell("B5").value.formula, /INDEX\('영화목록'!\$C\$5:\$C\$6,MATCH\(A5/);
    assert.match(reviews.getCell("H5").value.formula, /INDEX\('영화목록'!\$I\$5:\$I\$6,MATCH\(A5/);
    assert.match(reviews.getCell("L5").value.formula, /INDEX\('영화목록'!\$M\$5:\$M\$6,MATCH\(A5/);
    assert.equal(reviews.getCell("M5").dataValidation.formulae[0], "RatingOptions");
    assert.equal(reviews.getCell("O5").value, null);
    const listValues = workbook.getWorksheet("_목록값");
    assert.deepEqual(listValues.getColumn(2).values.slice(1, 11), [
      "☆", "★", "★☆", "★★", "★★☆", "★★★", "★★★☆", "★★★★", "★★★★☆", "★★★★★",
    ]);
    assert.deepEqual(listValues.getColumn(3).values.slice(1, 11), [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]);
    assert.equal(workbook.worksheets[2].name, "통계");
    const statistics = workbook.getWorksheet("통계");
    assert.equal(statistics.getCell("A1").fill.fgColor.argb, "FF4B5563");
    assert.equal(statistics.getCell("A2").fill.fgColor.argb, "FFF3F4F6");
    assert.equal(statistics.getCell("N4").fill.fgColor.argb, "FF6B7280");
    const yearValues = statistics.getColumn(1).values.filter((value) => typeof value === "number");
    assert.deepEqual(yearValues, [...yearValues].sort((left, right) => left - right));
    const yearRow = statistics.getColumn(1).values.findIndex((value) => value === 2025);
    assert.ok(yearRow >= 5);
    assert.equal(statistics.getCell(yearRow, 2).value.formula,
      `COUNTIFS(MovieReviews[개봉일],">="&DATE(A${yearRow},1,1),MovieReviews[개봉일],"<"&DATE(A${yearRow}+1,1,1),MovieReviews[TMDB ID],">0")`);
    assert.match(statistics.getCell(yearRow, 4).value.formula, /RatingOptions\),RatingScores\)\/C/);
    const ratings = listValues.getColumn(2).values.slice(1, 11);
    assert.deepEqual(statistics.getRow(4).values.slice(5, 15), ratings);
    ratings.forEach((_, index) => {
      const column = String.fromCharCode(69 + index);
      assert.equal(statistics.getCell(yearRow, index + 5).value.formula,
        `COUNTIFS(MovieReviews[개봉일],">="&DATE(A${yearRow},1,1),MovieReviews[개봉일],"<"&DATE(A${yearRow}+1,1,1),MovieReviews[내 별점],${column}$4)`);
    });
    const summaryRow = statistics.getColumn(1).values.findIndex((value) => value === "별점");
    assert.ok(summaryRow > yearRow);
    assert.equal(statistics.getCell(summaryRow, 1).fill.fgColor.argb, "FF6B7280");
    assert.equal(statistics.getCell(summaryRow, 4).fill.fgColor.argb, "FFE5E7EB");
    assert.equal(statistics.getCell(summaryRow, 5).value.formula, 'COUNTIF(MovieReviews[TMDB ID],">0")');
    assert.equal(statistics.getCell(summaryRow + 2, 5).value.formula,
      `IF(E${summaryRow + 1}=0,"",SUMPRODUCT(COUNTIF(MovieReviews[내 별점],RatingOptions),RatingScores)/E${summaryRow + 1})`);
    assert.equal(statistics.getTable("MovieViewingStatistics").table.style.showRowStripes, false);
    assert.equal(statistics.getTable("MovieRatingDistribution").table.style.showRowStripes, false);
    assert.equal(statistics.getCell(summaryRow + 1, 1).value, "☆");
    assert.equal(statistics.getCell(summaryRow + 1, 2).value.formula, `COUNTIF(MovieReviews[내 별점],A${summaryRow + 1})`);
    assert.equal(statistics.getCell(yearRow, 14).border.bottom.style, "thin");
    assert.equal(statistics.getCell(yearRow, 2).border.bottom.style, "thin");
  } finally {
    await unlink(compiledPath).catch(() => undefined);
  }
});

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
  vote_average: 5, vote_count: 11, popularity, overview: "Overview", poster_path: null,
  genres: "", countries: "", companies: "", directors: "Director", actors: "",
});

test("선택한 영화는 엑셀 감상기록 15열에 맞는 행으로 복사한다", () => {
  const text = movieExport.createSelectedReviewsClipboardText([
    { ...makeMovie(1), title: "Movie\tOne", overview: "Line 1\nLine 2" },
    { ...makeMovie(2), title: "=Formula" },
  ]);
  const rows = text.split("\r\n").map((row) => row.split("\t"));
  assert.equal(rows.length, 2);
  assert.equal(rows[0].length, 15);
  assert.equal(rows[0][0], "1");
  assert.equal(rows[0][1], "Movie One");
  assert.equal(rows[0][2], "");
  assert.equal(rows[0][3], "");
  assert.equal(rows[0][12], "Line 1 Line 2");
  assert.equal(rows[1][1], "'=Formula");
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

test("TOP 제한 없이 모든 페이지를 모으고 조회 순서를 유지한다", async () => {
  const plan = [{ from: "2025-01-01", to: "2025-01-31", totalPages: 2, totalResults: 3, query: "global" }];
  const movies = await movieExport.collectExportMovies(plan, async (window, page) => ({
    ...window, page, totalPages: 2, totalResults: 3,
    scannedIds: page === 1 ? [1, 2] : [3],
    excludedIds: [],
    movies: page === 1 ? [makeMovie(1, 1), makeMovie(2, 3)] : [makeMovie(3, 2)],
  }));
  assert.deepEqual(movies.map((movie) => movie.id), [1, 2, 3]);
  assert.deepEqual(movies.map((movie) => movie.rank), [1, 2, 3]);
});

test("전체 11표 이상과 한국 1~10표 조회 결과를 하나로 합친다", async () => {
  const plan = [
    { from: "2025-01-01", to: "2025-12-31", totalPages: 1, totalResults: 1, query: "global" },
    { from: "2025-01-01", to: "2025-12-31", totalPages: 1, totalResults: 1, query: "korean-low-vote" },
  ];
  const movies = await movieExport.collectExportMovies(plan, async (window, page) => ({
    ...window, page, totalPages: 1, totalResults: 1,
    scannedIds: [window.query === "global" ? 1 : 2], excludedIds: [],
    movies: [{ ...makeMovie(window.query === "global" ? 1 : 2), vote_count: window.query === "global" ? 11 : 1 }],
  }));
  assert.deepEqual(movies.map((movie) => movie.id), [1, 2]);
  assert.deepEqual(movies.map((movie) => movie.rank), [1, 2]);
});

test("여러 날짜 구간의 모든 페이지를 빠짐없이 수집한다", async () => {
  const plan = [
    { from: "2025-01-01", to: "2025-01-31", totalPages: 2, totalResults: 2, query: "global" },
    { from: "2025-02-01", to: "2025-02-28", totalPages: 2, totalResults: 2, query: "global" },
  ];
  const requested = [];
  const progress = [];
  const movies = await movieExport.collectExportMovies(plan, async (window, page) => {
    requested.push([window.from, page]);
    const id = requested.length;
    return {
      ...window, page, totalPages: 2, totalResults: 2,
      scannedIds: [id], excludedIds: [], movies: [makeMovie(id)],
    };
  }, (value) => progress.push(value));

  assert.deepEqual(requested, [["2025-01-01", 1], ["2025-01-01", 2], ["2025-02-01", 1], ["2025-02-01", 2]]);
  assert.deepEqual(movies.map((movie) => movie.id), [1, 2, 3, 4]);
  assert.equal(progress.at(-1).completedPages, 4);
  assert.equal(progress.at(-1).totalPages, 4);
});

test("조회 중 TMDB 전체 편수가 바뀌면 새 페이지 수에 맞춰 계속 수집한다", async () => {
  const plan = [{ from: "2025-01-01", to: "2025-12-31", totalPages: 2, totalResults: 2, query: "global" }];
  const requested = [];
  const movies = await movieExport.collectExportMovies(plan, async (window, page) => {
    requested.push(page);
    return {
      ...window, page, totalPages: 3, totalResults: 3,
      scannedIds: [page], excludedIds: [], movies: [makeMovie(page)],
    };
  });
  assert.deepEqual(requested, [1, 2, 3]);
  assert.deepEqual(movies.map((movie) => movie.id), [1, 2, 3]);
});

test("중복이나 누락이 있으면 부분 엑셀을 만들지 않는다", async () => {
  const plan = [{ from: "2025-01-01", to: "2025-01-31", totalPages: 2, totalResults: 2, query: "global" }];
  await assert.rejects(
    movieExport.collectExportMovies(plan, async (window, page) => ({
      ...window, page, totalPages: 2, totalResults: 2, scannedIds: [1], excludedIds: [], movies: [makeMovie(1)],
    })),
    /예상 2편 중 1편만 검증/,
  );
});

test("목록 필터와 상세 상영시간이 다른 항목은 검증 후 제외한다", async () => {
  const plan = [{ from: "2025-01-01", to: "2025-01-31", totalPages: 1, totalResults: 2, query: "global" }];
  const movies = await movieExport.collectExportMovies(plan, async (window, page) => ({
    ...window, page, totalPages: 1, totalResults: 2,
    scannedIds: [1, 2], excludedIds: [2], movies: [makeMovie(1)],
  }));
  assert.deepEqual(movies.map((movie) => movie.id), [1]);
});

test("한국어 줄거리가 없는 영화가 포함되면 내보내기를 중단한다", async () => {
  const plan = [{ from: "2025-01-01", to: "2025-01-31", totalPages: 1, totalResults: 1, query: "global" }];
  await assert.rejects(
    movieExport.collectExportMovies(plan, async (window, page) => ({
      ...window, page, totalPages: 1, totalResults: 1,
      scannedIds: [1], excludedIds: [], movies: [{ ...makeMovie(1), overview: "" }],
    })),
    /조건에 맞지 않는/,
  );
});

test("감독이 없는 영화가 포함되면 내보내기를 중단한다", async () => {
  const plan = [{ from: "2025-01-01", to: "2025-01-31", totalPages: 1, totalResults: 1, query: "global" }];
  await assert.rejects(
    movieExport.collectExportMovies(plan, async (window, page) => ({
      ...window, page, totalPages: 1, totalResults: 1,
      scannedIds: [1], excludedIds: [], movies: [{ ...makeMovie(1), directors: "" }],
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
    const { createCopyWorkbook, createSelectedReviewsWorkbook, createWorkbook } = require(compiledFile);
    const ExcelJS = require("exceljs");
    const buffer = await createWorkbook(2025, [makeMovie(1), makeMovie(2)]);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet("영화목록");
    const table = sheet.getTable("TmdbMovieExport");
    assert.equal(sheet.rowCount, 6);
    assert.equal(sheet.columnCount, 15);
    assert.match(sheet.getCell("A1").value, /2025년 TMDB 영화 2편/);
    assert.match(sheet.getCell("A2").value, /전체 영화 투표 수 11개 이상 · 한국 영화 1개 이상/);
    assert.equal(sheet.getCell("A4").value, "감상여부");
    assert.equal(sheet.getCell("A5").value, "미감상");
    assert.equal(sheet.getCell("M5").value, 40);
    assert.equal(sheet.getCell("N5").value, 11);
    assert.deepEqual(sheet.getRow(4).values.slice(1, 15), [
      "감상여부", "TMDB ID", "한국어 제목", "원제", "개봉일", "장르", "대표 제작국가", "대표 제작사", "감독",
      "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "투표수",
    ]);
    assert.equal(sheet.getCell("O4").value, "_감상번호");
    assert.equal(sheet.getColumn(15).hidden, true);
    assert.match(sheet.getCell("O5").value.formula, /COUNTIF\(\$A\$5:A5,"감상"\)/);
    assert.equal(table.table.columns.every((column) => column.filterButton !== false), true);
    assert.equal(table.table.style.theme, "TableStyleLight1");
    assert.equal(table.table.style.showRowStripes, false);
    assert.equal(sheet.getCell("B5").border.bottom.style, "thin");
    assert.equal(sheet.getCell("B5").border.right.color.argb, "FFD9D9D9");
    assert.equal(sheet.getCell("A5").dataValidation.formulae[0], "SelectionOptions");
    assert.equal(sheet.getCell("D5").dataValidation, undefined);

    const reviews = workbook.getWorksheet("감상기록");
    const reviewTable = reviews.getTable("MovieReviews");
    assert.equal(reviews.views[0].xSplit, 4);
    assert.equal(reviews.views[0].ySplit, 4);
    assert.equal(reviews.views[0].activeCell, "E5");
    assert.equal(reviewTable.table.style.theme, "TableStyleLight1");
    assert.equal(reviewTable.table.style.showRowStripes, false);
    assert.equal(reviews.getCell("B5").border.right.style, "thin");
    assert.deepEqual(reviewTable.table.columns.map((column) => column.name), [
      "TMDB ID", "한국어 제목", "내 별점", "감상날짜", "원제", "개봉일", "장르", "대표 제작국가",
      "대표 제작사", "감독", "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "투표수",
    ]);
    assert.match(reviews.getCell("A5").value.formula, /TmdbMovieExport\[TMDB ID\].*TmdbMovieExport\[_감상번호\]/);
    assert.match(reviews.getCell("A6").value.formula, /ROWS\(\$A\$5:A6\)/);
    assert.match(reviews.getCell("B5").value.formula, /INDEX\(TmdbMovieExport\[한국어 제목\],MATCH\(A5,TmdbMovieExport\[TMDB ID\]/);
    assert.equal(reviews.getCell("C5").value, null);
    assert.match(reviews.getCell("D5").value.formula, /INDEX\(TmdbMovieExport\[개봉일\],MATCH\(A5/);
    assert.match(reviews.getCell("I5").value.formula, /INDEX\(TmdbMovieExport\[대표 제작사\],MATCH\(A5/);
    assert.match(reviews.getCell("N5").value.formula, /INDEX\(TmdbMovieExport\[상영시간\(분\)\],MATCH\(A5/);
    assert.match(reviews.getCell("O5").value.formula, /INDEX\(TmdbMovieExport\[투표수\],MATCH\(A5/);
    assert.equal(reviews.getCell("C5").dataValidation.formulae[0], "RatingOptions");
    assert.equal(reviews.getColumn(3).width, 16);
    assert.equal(reviews.getCell("P5").value, null);
    assert.match(workbook.getWorksheet("조회정보").getCell("B7").value, /전체 영화 11개 이상 · 한국 영화 1개 이상/);
    const listValues = workbook.getWorksheet("_목록값");
    assert.deepEqual(listValues.getColumn(1).values.slice(1, 3), ["미감상", "감상"]);
    assert.deepEqual(listValues.getColumn(2).values.slice(1, 11), [
      "☆", "★", "★☆", "★★", "★★☆", "★★★", "★★★☆", "★★★★", "★★★★☆", "★★★★★",
    ]);
    assert.deepEqual(listValues.getColumn(3).values.slice(1, 11), [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]);
    assert.equal(workbook.worksheets[2].name, "통계");
    const statistics = workbook.getWorksheet("통계");
    assert.equal(statistics.getCell("A1").fill.fgColor.argb, "FF4B5563");
    assert.equal(statistics.getCell("A2").fill.fgColor.argb, "FFF3F4F6");
    assert.equal(statistics.getCell("O4").fill.fgColor.argb, "FF6B7280");
    assert.deepEqual(statistics.getRow(4).values.slice(1, 6), ["연도", "개봉연도 감상 수", "감상연도 감상 수", "별점 입력 수", "평균 별점"]);
    assert.equal(statistics.getColumn(2).width, statistics.getColumn(3).width);
    const yearValues = statistics.getColumn(1).values.filter((value) => typeof value === "number");
    assert.deepEqual(yearValues, [...yearValues].sort((left, right) => right - left));
    assert.equal(statistics.getCell("A5").value, "전체");
    assert.equal(statistics.getCell("B5").value.formula, 'COUNTIF(MovieReviews[TMDB ID],">0")');
    assert.equal(statistics.getCell("C5").value.formula, 'COUNTIFS(MovieReviews[감상날짜],"<>",MovieReviews[TMDB ID],">0")');
    assert.equal(statistics.getCell("D5").value.formula, 'COUNTIF(MovieReviews[내 별점],"<>")');
    assert.equal(statistics.getColumn(2).numFmt, "0");
    assert.equal(statistics.getColumn(6).numFmt, "0");
    const yearRow = statistics.getColumn(1).values.findIndex((value) => value === 2025);
    assert.ok(yearRow >= 6);
    assert.equal(statistics.getCell(yearRow, 2).value.formula,
      `COUNTIFS(MovieReviews[개봉일],">="&DATE(A${yearRow},1,1),MovieReviews[개봉일],"<"&DATE(A${yearRow}+1,1,1),MovieReviews[TMDB ID],">0")`);
    assert.equal(statistics.getCell(yearRow, 3).value.formula,
      `COUNTIFS(MovieReviews[감상날짜],">="&DATE(A${yearRow},1,1),MovieReviews[감상날짜],"<"&DATE(A${yearRow}+1,1,1),MovieReviews[TMDB ID],">0")`);
    assert.match(statistics.getCell(yearRow, 5).value.formula, /RatingOptions\),RatingScores\)\/D/);
    const ratings = listValues.getColumn(2).values.slice(1, 11).reverse();
    assert.deepEqual(statistics.getRow(4).values.slice(6, 16), ratings);
    ratings.forEach((_, index) => {
      const column = String.fromCharCode(70 + index);
      assert.equal(statistics.getCell(yearRow, index + 6).value.formula,
        `COUNTIFS(MovieReviews[개봉일],">="&DATE(A${yearRow},1,1),MovieReviews[개봉일],"<"&DATE(A${yearRow}+1,1,1),MovieReviews[내 별점],${column}$4)`);
    });
    assert.equal(statistics.getTable("MovieViewingStatistics").table.style.showRowStripes, false);
    assert.equal(statistics.getTable("MovieRatingDistribution"), undefined);
    assert.equal(statistics.getCell(yearRow, 15).border.bottom.style, "thin");
    assert.equal(statistics.getCell(yearRow, 2).border.bottom.style, "thin");

    const copyBuffer = await createCopyWorkbook(2025, [makeMovie(1), makeMovie(2)]);
    const copyWorkbook = new ExcelJS.Workbook();
    await copyWorkbook.xlsx.load(copyBuffer);
    assert.equal(copyWorkbook.worksheets.length, 1);
    const copySheet = copyWorkbook.getWorksheet("영화목록 복사용");
    assert.equal(copySheet.rowCount, 2);
    assert.equal(copySheet.columnCount, 14);
    assert.equal(copySheet.getCell("A1").value, "미감상");
    assert.equal(copySheet.getCell("B1").value, 1);
    assert.equal(copySheet.getCell("C1").value, "Movie 1");
    assert.equal(copySheet.getCell("A2").value, "미감상");
    assert.equal(copySheet.getCell("B2").value, 2);
    assert.equal(copySheet.getCell("E1").numFmt, "yyyy-mm-dd");
    assert.equal(copySheet.getTables().length, 0);

    const selectedWithHeaderBuffer = await createSelectedReviewsWorkbook(2025, [makeMovie(1), makeMovie(2)], true);
    const selectedWithHeaderWorkbook = new ExcelJS.Workbook();
    await selectedWithHeaderWorkbook.xlsx.load(selectedWithHeaderBuffer);
    const selectedWithHeader = selectedWithHeaderWorkbook.getWorksheet("감상기록");
    assert.equal(selectedWithHeader.rowCount, 3);
    assert.equal(selectedWithHeader.columnCount, 15);
    assert.deepEqual(selectedWithHeader.getRow(1).values.slice(1, 6), ["TMDB ID", "한국어 제목", "내 별점", "감상날짜", "원제"]);
    assert.equal(selectedWithHeader.getCell("A2").value, 1);
    assert.equal(selectedWithHeader.getCell("B2").value, "Movie 1");
    assert.equal(selectedWithHeader.getCell("C2").value, "");
    assert.equal(selectedWithHeader.getCell("D2").value, "");
    assert.equal(selectedWithHeader.getCell("F2").numFmt, "yyyy-mm-dd");
    assert.equal(selectedWithHeader.getTable("MovieReviews").table.style.theme, "TableStyleLight1");
    assert.equal(selectedWithHeaderWorkbook.worksheets.length, 3);
    const selectedStatistics = selectedWithHeaderWorkbook.getWorksheet("통계");
    assert.equal(selectedStatistics.getCell("B5").value.formula, 'COUNTIF(MovieReviews[TMDB ID],">0")');
    assert.equal(selectedStatistics.getCell("C5").value.formula, 'COUNTIFS(MovieReviews[감상날짜],"<>",MovieReviews[TMDB ID],">0")');
    assert.equal(selectedStatistics.getCell("A146").value, 1888);
    assert.equal(selectedWithHeaderWorkbook.getWorksheet("_목록값").state, "veryHidden");

    const selectedWithoutHeaderBuffer = await createSelectedReviewsWorkbook(2025, [makeMovie(1), makeMovie(2)], false);
    const selectedWithoutHeaderWorkbook = new ExcelJS.Workbook();
    await selectedWithoutHeaderWorkbook.xlsx.load(selectedWithoutHeaderBuffer);
    const selectedWithoutHeader = selectedWithoutHeaderWorkbook.getWorksheet("감상기록 복사용");
    assert.equal(selectedWithoutHeader.rowCount, 2);
    assert.equal(selectedWithoutHeader.columnCount, 15);
    assert.equal(selectedWithoutHeader.getCell("A1").value, 1);
    assert.equal(selectedWithoutHeader.getCell("B1").value, "Movie 1");
    assert.equal(selectedWithoutHeader.getCell("C1").value, "");
    assert.equal(selectedWithoutHeader.getCell("D1").value, "");
    assert.equal(selectedWithoutHeader.getCell("E1").value, "Movie 1");
    assert.equal(selectedWithoutHeader.getCell("F1").numFmt, "yyyy-mm-dd");
    assert.equal(selectedWithoutHeader.getTables().length, 0);
  } finally {
    await unlink(compiledPath).catch(() => undefined);
  }
});

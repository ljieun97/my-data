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

test("엑셀에 요청한 영화 열과 필터 버튼을 만든다", async () => {
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
    assert.equal(sheet.rowCount, 3);
    assert.equal(sheet.columnCount, 13);
    assert.equal(sheet.getCell("A1").value, "순위");
    assert.equal(sheet.getCell("M2").value, 40);
    assert.deepEqual(sheet.getRow(1).values.slice(1), [
      "순위", "TMDB ID", "한국어 제목", "원제", "개봉일", "장르", "제작 국가", "제작사", "감독",
      "배우 전체", "원어", "한국어 줄거리", "상영시간(분)",
    ]);
    assert.equal(table.table.columns.every((column) => column.filterButton !== false), true);
  } finally {
    await unlink(compiledPath).catch(() => undefined);
  }
});

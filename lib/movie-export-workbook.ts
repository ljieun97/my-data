import ExcelJS from "exceljs";
import type { ExportMovie } from "./movie-export";

const DATA_ROW_HEIGHT = 36;
const MAX_TEXT_FIT_WIDTH = 45;
const OVERVIEW_COLUMN_WIDTH = 50;

function safeText(value: unknown) {
  const text = String(value ?? "");
  if (text.length > 32766) throw new Error("엑셀 셀 글자 수 한도를 초과한 영화 정보가 있습니다. 데이터를 자르지 않고 내보내기를 중단했습니다.");
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function getTextLength(value: unknown) {
  if (value instanceof Date) return 10;
  if (value && typeof value === "object" && "formula" in value) return 0;
  return Array.from(String(value ?? "")).length;
}

function fitColumnWidths(
  sheet: ExcelJS.Worksheet,
  headers: string[],
  rows: unknown[][],
  fixedWidths: Record<number, number> = {},
) {
  headers.forEach((header, index) => {
    const columnNumber = index + 1;
    const fixedWidth = fixedWidths[columnNumber];
    if (fixedWidth) {
      sheet.getColumn(columnNumber).width = fixedWidth;
      return;
    }
    const maxLength = Math.max(getTextLength(header), ...rows.map((row) => getTextLength(row[index])));
    sheet.getColumn(columnNumber).width = Math.min(MAX_TEXT_FIT_WIDTH, Math.max(8, maxLength + 2));
  });
}

function addGrid(sheet: ExcelJS.Worksheet, firstRow: number, lastRow: number, lastColumn: number, firstColumn = 1) {
  const line: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FFD9D9D9" } };
  for (let row = firstRow; row <= lastRow; row++) {
    for (let column = firstColumn; column <= lastColumn; column++) {
      sheet.getCell(row, column).border = { top: line, bottom: line, left: line, right: line };
    }
  }
}

export async function createWorkbook(year: number, movies: ExportMovie[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TOVIE";
  workbook.created = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;

  const sheet = workbook.addWorksheet("영화목록", {
    views: [{ state: "frozen", xSplit: 3, ySplit: 4, activeCell: "D5", showGridLines: false }],
    properties: { defaultRowHeight: 20 },
  });
  sheet.mergeCells("A1:N1");
  sheet.getCell("A1").value = `${year}년 TMDB 영화 ${movies.length}편`;
  sheet.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 15 };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
  sheet.getCell("A1").alignment = { vertical: "middle" };
  sheet.getRow(1).height = 30;
  sheet.mergeCells("A2:N2");
  sheet.getCell("A2").value = "투표 수 11개 이상 · 상영시간 40분 이상 · 한국어 줄거리 있음 · 감독 있음 · 성인물 제외";
  sheet.getCell("A2").font = { color: { argb: "FF4B5563" } };
  sheet.getCell("A2").alignment = { vertical: "middle" };

  const columns = [
    "감상여부", "TMDB ID", "한국어 제목", "원제", "개봉일", "장르", "제작 국가", "제작사", "감독",
    "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "투표수", "_감상번호",
  ];
  const rows = movies.map((movie, index) => [
    "미감상",
    movie.id,
    safeText(movie.title),
    safeText(movie.original_title),
    movie.release_date ? new Date(`${movie.release_date}T00:00:00Z`) : null,
    safeText(movie.genres),
    safeText(movie.countries),
    safeText(movie.companies),
    safeText(movie.directors),
    safeText(movie.actors),
    safeText(movie.original_language),
    safeText(movie.overview),
    movie.runtime,
    movie.vote_count ?? 0,
    { formula: `IF(A${index + 5}=\"감상\",COUNTIF($A$5:A${index + 5},\"감상\"),\"\")`, result: "" },
  ]);

  sheet.addTable({
    name: "TmdbMovieExport",
    ref: "A4",
    headerRow: true,
    totalsRow: false,
    style: { theme: "TableStyleLight1", showRowStripes: false },
    columns: columns.map((name) => ({ name, filterButton: true })),
    rows,
  });

  fitColumnWidths(sheet, columns, rows, { 12: OVERVIEW_COLUMN_WIDTH, 15: 10 });

  if (movies.length > 0) {
    for (let rowNumber = 5; rowNumber <= movies.length + 4; rowNumber++) {
      sheet.getCell(rowNumber, 1).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["SelectionOptions"],
        showErrorMessage: true,
        errorTitle: "감상여부 확인",
        error: "목록에서 '미감상' 또는 '감상'을 골라 주세요.",
      };
    }
    sheet.addConditionalFormatting({
      ref: `A5:N${movies.length + 4}`,
      rules: [{
        type: "expression",
        priority: 1,
        formulae: ['$A5="감상"'],
        style: {
          fill: {
            type: "pattern", pattern: "solid",
            fgColor: { argb: "FFE5E7EB" }, bgColor: { argb: "FFE5E7EB" },
          },
        },
      }],
    });
  }

  sheet.getRow(4).height = 28;
  sheet.getRow(4).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getColumn(5).numFmt = "yyyy-mm-dd";
  sheet.getColumn(15).hidden = true;

  movies.forEach((movie, index) => {
    const rowNumber = index + 5;
    const row = sheet.getRow(rowNumber);
    row.alignment = { vertical: "top", wrapText: true };
    row.height = DATA_ROW_HEIGHT;
  });

  addGrid(sheet, 4, movies.length + 4, 14);

  const reviews = workbook.addWorksheet("감상기록", {
    views: [{ state: "frozen", xSplit: 4, ySplit: 4, activeCell: "E5", showGridLines: false }],
    properties: { defaultRowHeight: 20 },
  });
  reviews.mergeCells("A1:O1");
  reviews.getCell("A1").value = "감상기록";
  reviews.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 15 };
  reviews.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
  reviews.getRow(1).height = 30;
  reviews.mergeCells("A2:O2");
  reviews.getCell("A2").value = "영화목록에서 '감상'하면 TMDB ID와 영화 정보가 자동으로 표시됩니다. 내 별점과 감상날짜를 입력하세요.";
  reviews.getCell("A2").alignment = { wrapText: true, vertical: "middle" };
  reviews.getCell("A2").font = { color: { argb: "FF4B5563" } };
  reviews.getRow(2).height = 34;

  const lastMovieRow = Math.max(5, movies.length + 4);
  const reviewRows = Array.from({ length: Math.max(1, movies.length) }, (_, index) => {
    const rowNumber = index + 5;
    const idFormula = `IFERROR(INDEX('영화목록'!$B$5:$B$${lastMovieRow},MATCH(ROWS($A$5:A${rowNumber}),'영화목록'!$O$5:$O$${lastMovieRow},0)),\"\")`;
    const lookupFormula = (column: string) => `IF(A${rowNumber}=\"\",\"\",IFERROR(INDEX('영화목록'!$${column}$5:$${column}$${lastMovieRow},MATCH(A${rowNumber},'영화목록'!$B$5:$B$${lastMovieRow},0)),\"\"))`;
    return [
      { formula: idFormula, result: "" },
      { formula: lookupFormula("C"), result: "" },
      null,
      null,
      { formula: lookupFormula("D"), result: "" },
      { formula: lookupFormula("E"), result: "" },
      { formula: lookupFormula("F"), result: "" },
      { formula: lookupFormula("G"), result: "" },
      { formula: lookupFormula("H"), result: "" },
      { formula: lookupFormula("I"), result: "" },
      { formula: lookupFormula("J"), result: "" },
      { formula: lookupFormula("K"), result: "" },
      { formula: lookupFormula("L"), result: "" },
      { formula: lookupFormula("M"), result: "" },
      { formula: lookupFormula("N"), result: "" },
    ];
  });
  reviews.addTable({
    name: "MovieReviews",
    ref: "A4",
    headerRow: true,
    totalsRow: false,
    style: { theme: "TableStyleLight1", showRowStripes: false },
    columns: [
      "TMDB ID", "한국어 제목", "내 별점", "감상날짜", "원제", "개봉일", "장르", "제작 국가",
      "제작사", "감독", "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "투표수",
    ].map((name) => ({ name, filterButton: true })),
    rows: reviewRows,
  });
  for (let rowNumber = 5; rowNumber < reviewRows.length + 5; rowNumber++) {
    reviews.getCell(rowNumber, 3).dataValidation = {
      type: "list", allowBlank: true, formulae: ["RatingOptions"],
      showErrorMessage: true, errorTitle: "별점 확인", error: "목록에서 별점을 선택해 주세요.",
    };
  }
  const reviewColumns = [
    "TMDB ID", "한국어 제목", "내 별점", "감상날짜", "원제", "개봉일", "장르", "제작 국가",
    "제작사", "감독", "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "투표수",
  ];
  const reviewWidthRows = movies.map((movie) => [
    movie.id,
    movie.title,
    "★★★★★",
    new Date(),
    movie.original_title,
    movie.release_date ? new Date(`${movie.release_date}T00:00:00Z`) : null,
    movie.genres,
    movie.countries,
    movie.companies,
    movie.directors,
    movie.actors,
    movie.original_language,
    movie.overview,
    movie.runtime,
    movie.vote_count ?? 0,
  ]);
  fitColumnWidths(reviews, reviewColumns, reviewWidthRows, { 3: 16, 13: OVERVIEW_COLUMN_WIDTH });
  reviews.getColumn(4).numFmt = "yyyy-mm-dd";
  reviews.getColumn(6).numFmt = "yyyy-mm-dd";
  reviews.getColumn(13).alignment = { vertical: "top", wrapText: true };
  reviews.getRow(4).height = 28;
  for (let rowNumber = 5; rowNumber < reviewRows.length + 5; rowNumber++) {
    reviews.getRow(rowNumber).height = DATA_ROW_HEIGHT;
  }

  addGrid(reviews, 4, reviewRows.length + 4, 15);

  const statistics = workbook.addWorksheet("통계", {
    views: [{ state: "frozen", ySplit: 4, activeCell: "A5", showGridLines: true }],
    properties: { defaultRowHeight: 22 },
  });
  statistics.mergeCells("A1:Q1");
  statistics.getCell("A1").value = "감상기록 통계";
  statistics.getCell("A1").font = { bold: true, size: 15, color: { argb: "FFFFFFFF" } };
  statistics.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
  statistics.getCell("A1").alignment = { vertical: "middle" };
  statistics.getRow(1).height = 30;
  statistics.mergeCells("A2:Q2");
  statistics.getCell("A2").value = "감상기록 시트를 기준으로 개봉연도별 감상 편수, 별점, 감상날짜를 집계합니다. 별점이 없는 영화도 감상 편수에는 포함됩니다.";
  statistics.getCell("A2").alignment = { wrapText: true, vertical: "middle" };
  statistics.getCell("A2").font = { color: { argb: "FF4B5563" } };
  statistics.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
  statistics.getRow(2).height = 36;
  const ratingLabels = ["☆", "★", "★☆", "★★", "★★☆", "★★★", "★★★☆", "★★★★", "★★★★☆", "★★★★★"];
  const statisticRatingLabels = [...ratingLabels].reverse();
  const latestYear = Math.max(year, new Date().getFullYear() + 2);
  const earliestYear = Math.min(year, 2020);
  const yearRows = Array.from({ length: latestYear - earliestYear + 1 }, (_, index) => {
    const rowNumber = index + 6;
    const rowYear = latestYear - index;
    const dateCriteria = `MovieReviews[개봉일],">="&DATE(A${rowNumber},1,1),MovieReviews[개봉일],"<"&DATE(A${rowNumber}+1,1,1)`;
    const watchedDateCriteria = `${dateCriteria},MovieReviews[감상날짜],"<>",MovieReviews[TMDB ID],">0"`;
    return [
      rowYear,
      { formula: `COUNTIFS(${dateCriteria},MovieReviews[TMDB ID],">0")`, result: 0 },
      { formula: `COUNTIFS(${dateCriteria},MovieReviews[내 별점],"<>")`, result: 0 },
      {
        formula: `IF(C${rowNumber}=0,"",SUMPRODUCT(COUNTIFS(${dateCriteria},MovieReviews[내 별점],RatingOptions),RatingScores)/C${rowNumber})`,
        result: "",
      },
      { formula: `COUNTIFS(${watchedDateCriteria})`, result: 0 },
      { formula: `IF(E${rowNumber}=0,"",MINIFS(MovieReviews[감상날짜],${watchedDateCriteria}))`, result: "" },
      { formula: `IF(E${rowNumber}=0,"",MAXIFS(MovieReviews[감상날짜],${watchedDateCriteria}))`, result: "" },
      ...statisticRatingLabels.map((_, ratingIndex) => ({
        formula: `COUNTIFS(${dateCriteria},MovieReviews[내 별점],${String.fromCharCode(72 + ratingIndex)}$4)`,
        result: 0,
      })),
    ];
  });
  const totalRow = [
    "전체",
    { formula: 'COUNTIF(MovieReviews[TMDB ID],">0")', result: 0 },
    { formula: 'COUNTIF(MovieReviews[내 별점],"<>")', result: 0 },
    { formula: 'IF(C5=0,"",SUMPRODUCT(COUNTIF(MovieReviews[내 별점],RatingOptions),RatingScores)/C5)', result: "" },
    { formula: 'COUNTIFS(MovieReviews[감상날짜],"<>",MovieReviews[TMDB ID],">0")', result: 0 },
    { formula: 'IF(E5=0,"",MINIFS(MovieReviews[감상날짜],MovieReviews[감상날짜],"<>",MovieReviews[TMDB ID],">0"))', result: "" },
    { formula: 'IF(E5=0,"",MAXIFS(MovieReviews[감상날짜],MovieReviews[감상날짜],"<>",MovieReviews[TMDB ID],">0"))', result: "" },
    ...statisticRatingLabels.map((rating) => ({
      formula: `COUNTIF(MovieReviews[내 별점],"${rating}")`,
      result: 0,
    })),
  ];
  statistics.addTable({
    name: "MovieViewingStatistics", ref: "A4", headerRow: true, totalsRow: false,
    style: { theme: "TableStyleLight1", showRowStripes: false },
    columns: ["개봉연도", "감상 영화 수", "별점 입력 수", "평균 별점", "감상날짜 입력 수", "첫 감상날짜", "최근 감상날짜", ...statisticRatingLabels].map((name) => ({ name, filterButton: true })),
    rows: [totalRow, ...yearRows],
  });

  for (let column = 1; column <= 17; column++) {
    const cell = statistics.getCell(4, column);
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B7280" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  }
  for (let column = 1; column <= 17; column++) {
    const cell = statistics.getCell(5, column);
    cell.font = { bold: true, color: { argb: "FF374151" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
  }

  [15, 17, 17, 20, 18, 15, 15, ...statisticRatingLabels.map(() => 13)].forEach((width, index) => { statistics.getColumn(index + 1).width = width; });
  yearRows.forEach((_, index) => { statistics.getCell(index + 6, 1).numFmt = '0"년"'; });
  statistics.getColumn(2).numFmt = '0"편"';
  statistics.getColumn(3).numFmt = '0"편"';
  statistics.getColumn(4).numFmt = '0.0';
  statistics.getColumn(5).numFmt = '0"편"';
  statistics.getColumn(6).numFmt = "yyyy-mm-dd";
  statistics.getColumn(7).numFmt = "yyyy-mm-dd";
  statisticRatingLabels.forEach((_, index) => { statistics.getColumn(index + 8).numFmt = '0"편"'; });
  statistics.getRow(4).height = 28;
  addGrid(statistics, 4, yearRows.length + 5, 17);

  const info = workbook.addWorksheet("조회정보");
  info.views = [{ showGridLines: false }];
  info.addRows([
    ["조회 정보", ""],
    [],
    ["항목", "값"],
    ["출처", "TMDB API"],
    ["대상 연도", year],
    ["정렬", "TMDB 기본 순서"],
    ["투표 수 조건", "11개 이상"],
    ["영화 수", movies.length],
    ["언어", "한국어 (ko-KR)"],
    ["상영시간 조건", "40분 이상 (미등록 제외)"],
    ["줄거리 조건", "한국어(ko-KR) 줄거리가 있는 영화만 포함"],
    ["감독 조건", "감독이 있는 영화만 포함"],
    ["조회 시각", new Date()],
  ]);
  info.mergeCells("A1:B1");
  info.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 15 };
  info.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
  info.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  info.getRow(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B7280" } };
  info.getColumn(1).width = 20;
  info.getColumn(2).width = 44;
  info.getCell("B13").numFmt = "yyyy-mm-dd hh:mm";
  addGrid(info, 3, 13, 2);

  const listValues = workbook.addWorksheet("_목록값");
  listValues.state = "veryHidden";
  listValues.getCell("A1").value = "미감상";
  listValues.getCell("A2").value = "감상";
  ratingLabels.forEach((rating, index) => {
    listValues.getCell(index + 1, 2).value = rating;
    listValues.getCell(index + 1, 3).value = (index + 1) / 2;
  });
  workbook.definedNames.add("'_목록값'!$A$1:$A$2", "SelectionOptions");
  workbook.definedNames.add("'_목록값'!$B$1:$B$10", "RatingOptions");
  workbook.definedNames.add("'_목록값'!$C$1:$C$10", "RatingScores");

  return workbook.xlsx.writeBuffer();
}

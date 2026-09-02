import ExcelJS from "exceljs";
import type { ExportMovie } from "./movie-export";

const MAX_TEXT_FIT_WIDTH = 45;
const OVERVIEW_COLUMN_WIDTH = 50;
const REVIEW_ROW_HEIGHT = 48;

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

export async function createCopyWorkbook(year: number, movies: ExportMovie[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TOVIE";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("영화목록 복사용", {
    properties: { defaultRowHeight: 20 },
  });
  const columns = [
    "감상여부", "한국어 제목", "개봉일", "장르", "대표 제작국가", "대표 제작사", "감독",
    "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "투표수",
  ];
  const rows = movies.map((movie) => [
    "미감상",
    safeText(movie.title),
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
  ]);

  sheet.addRows(rows);
  fitColumnWidths(sheet, columns, rows, {
    1: 10, 2: 20, 3: 13, 4: 16, 5: 16, 6: 18,
    7: 18, 8: 30, 9: 10, 10: OVERVIEW_COLUMN_WIDTH, 11: 16, 12: 12,
  });
  sheet.getColumn(3).numFmt = "yyyy-mm-dd";
  return workbook.xlsx.writeBuffer();
}

export async function createSelectedReviewsWorkbook(year: number, movies: ExportMovie[], includeHeader: boolean) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TOVIE";
  workbook.created = new Date();
  workbook.calcProperties.fullCalcOnLoad = includeHeader;

  const sheet = workbook.addWorksheet(includeHeader ? "감상기록" : "감상기록 복사용", {
    views: includeHeader ? [{ state: "frozen", xSplit: 3, ySplit: 1, activeCell: "D2", showGridLines: false }] : undefined,
    properties: { defaultRowHeight: REVIEW_ROW_HEIGHT },
  });
  const columns = [
    "한국어 제목", "내 별점", "감상날짜", "개봉일", "장르", "대표 제작국가",
    "대표 제작사", "감독", "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "투표수",
  ];
  const rows = movies.map((movie) => [
    safeText(movie.title),
    "",
    movie.release_date ? new Date(`${movie.release_date}T00:00:00Z`) : null,
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
  ]);

  if (includeHeader) {
    sheet.addTable({
      name: "MovieReviews",
      ref: "A1",
      headerRow: true,
      totalsRow: false,
      style: { theme: "TableStyleMedium2", showRowStripes: false },
      columns: columns.map((name) => ({ name, filterButton: true })),
      rows,
    });
    sheet.getRow(1).height = 28;
    sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    for (let rowNumber = 2; rowNumber <= rows.length + 1; rowNumber++) {
      sheet.getCell(rowNumber, 2).dataValidation = {
        type: "list", allowBlank: true, formulae: ["RatingOptions"],
        showErrorMessage: true, errorTitle: "별점 확인", error: "목록에서 별점을 선택해 주세요.",
      };
    }
  } else {
    sheet.addRows(rows);
  }
  fitColumnWidths(sheet, columns, rows, {
    1: 20, 2: 16, 3: 13, 4: 13, 5: 16, 6: 16,
    7: 18, 8: 18, 9: 30, 10: 10, 11: OVERVIEW_COLUMN_WIDTH, 12: 16, 13: 12,
  });
  sheet.getColumn(3).numFmt = "yyyy-mm-dd";
  sheet.getColumn(4).numFmt = "yyyy-mm-dd";
  if (includeHeader) {
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  }
  rows.forEach((_, index) => {
    sheet.getRow(index + (includeHeader ? 2 : 1)).height = REVIEW_ROW_HEIGHT;
  });

  if (includeHeader) {
    const ratingLabels = ["☆", "★", "★☆", "★★", "★★☆", "★★★", "★★★☆", "★★★★", "★★★★☆", "★★★★★"];
    const statisticRatingLabels = [...ratingLabels].reverse();
    const statistics = workbook.addWorksheet("통계", {
      views: [{ state: "frozen", ySplit: 4, activeCell: "A5", showGridLines: true }],
      properties: { defaultRowHeight: 22 },
    });
    statistics.mergeCells("A1:O1");
    statistics.getCell("A1").value = "감상기록 통계";
    statistics.getCell("A1").font = { bold: true, size: 15, color: { argb: "FFFFFFFF" } };
    statistics.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
    statistics.getCell("A1").alignment = { vertical: "middle" };
    statistics.getRow(1).height = 30;
    statistics.mergeCells("A2:O2");
    statistics.getCell("A2").value = "감상기록 표에 붙여넣은 행을 기준으로 개봉연도·감상연도·별점을 자동 집계합니다.";
    statistics.getCell("A2").alignment = { wrapText: true, vertical: "middle" };
    statistics.getCell("A2").font = { color: { argb: "FF4B5563" } };
    statistics.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
    statistics.getRow(2).height = 36;

    const latestYear = Math.max(year, new Date().getFullYear() + 2);
    const earliestYear = 1970;
    const yearRows = Array.from({ length: latestYear - earliestYear + 1 }, (_, index) => {
      const rowNumber = index + 6;
      const rowYear = latestYear - index;
      const releaseYearCriteria = `MovieReviews[개봉일],">="&DATE(A${rowNumber},1,1),MovieReviews[개봉일],"<"&DATE(A${rowNumber}+1,1,1)`;
      const watchedYearCriteria = `MovieReviews[감상날짜],">="&DATE(A${rowNumber},1,1),MovieReviews[감상날짜],"<"&DATE(A${rowNumber}+1,1,1),MovieReviews[한국어 제목],"<>"`;
      return [
        rowYear,
        { formula: `COUNTIFS(${releaseYearCriteria},MovieReviews[한국어 제목],"<>")`, result: 0 },
        { formula: `COUNTIFS(${watchedYearCriteria})`, result: 0 },
        { formula: `COUNTIFS(${releaseYearCriteria},MovieReviews[내 별점],"<>")`, result: 0 },
        { formula: `IF(D${rowNumber}=0,"",SUMPRODUCT(COUNTIFS(${releaseYearCriteria},MovieReviews[내 별점],RatingOptions),RatingScores)/D${rowNumber})`, result: "" },
        ...statisticRatingLabels.map((_, ratingIndex) => ({
          formula: `COUNTIFS(${releaseYearCriteria},MovieReviews[내 별점],${String.fromCharCode(70 + ratingIndex)}$4)`,
          result: 0,
        })),
      ];
    });
    const totalRow = [
      "전체",
      { formula: 'COUNTIF(MovieReviews[한국어 제목],"<>")', result: 0 },
      { formula: 'COUNTIFS(MovieReviews[감상날짜],"<>",MovieReviews[한국어 제목],"<>")', result: 0 },
      { formula: 'COUNTIF(MovieReviews[내 별점],"<>")', result: 0 },
      { formula: 'IF(D5=0,"",SUMPRODUCT(COUNTIF(MovieReviews[내 별점],RatingOptions),RatingScores)/D5)', result: "" },
      ...statisticRatingLabels.map((rating) => ({ formula: `COUNTIF(MovieReviews[내 별점],"${rating}")`, result: 0 })),
    ];
    statistics.addTable({
      name: "MovieViewingStatistics", ref: "A4", headerRow: true, totalsRow: false,
      style: { theme: "TableStyleLight1", showRowStripes: false },
      columns: ["연도", "개봉연도 감상 수", "감상연도 감상 수", "별점 입력 수", "평균 별점", ...statisticRatingLabels]
        .map((name) => ({ name, filterButton: true })),
      rows: [totalRow, ...yearRows],
    });
    for (let column = 1; column <= 15; column++) {
      const headerCell = statistics.getCell(4, column);
      headerCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B7280" } };
      headerCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      const totalCell = statistics.getCell(5, column);
      totalCell.font = { bold: true, color: { argb: "FF374151" } };
      totalCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
    }
    [12, 19, 19, 17, 20, ...statisticRatingLabels.map(() => 13)]
      .forEach((width, index) => { statistics.getColumn(index + 1).width = width; });
    yearRows.forEach((_, index) => { statistics.getCell(index + 6, 1).numFmt = '0"년"'; });
    statistics.getColumn(2).numFmt = "0";
    statistics.getColumn(3).numFmt = "0";
    statistics.getColumn(4).numFmt = "0";
    statistics.getColumn(5).numFmt = "0.0";
    statisticRatingLabels.forEach((_, index) => { statistics.getColumn(index + 6).numFmt = "0"; });
    statistics.getRow(4).height = 28;
    addGrid(statistics, 4, yearRows.length + 5, 15);

    const listValues = workbook.addWorksheet("_목록값");
    listValues.state = "veryHidden";
    ratingLabels.forEach((rating, index) => {
      listValues.getCell(index + 1, 1).value = rating;
      listValues.getCell(index + 1, 2).value = (index + 1) / 2;
    });
    workbook.definedNames.add("'_목록값'!$A$1:$A$10", "RatingOptions");
    workbook.definedNames.add("'_목록값'!$B$1:$B$10", "RatingScores");
  }

  return workbook.xlsx.writeBuffer();
}

export async function createWorkbook(year: number, movies: ExportMovie[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TOVIE";
  workbook.created = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;

  const sheet = workbook.addWorksheet("영화목록", {
    views: [{ state: "frozen", xSplit: 2, ySplit: 4, activeCell: "C5", showGridLines: false }],
    properties: { defaultRowHeight: 20 },
  });
  sheet.mergeCells("A1:L1");
  sheet.getCell("A1").value = `${year}년 영화 ${movies.length}편`;
  sheet.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 15 };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
  sheet.getCell("A1").alignment = { vertical: "middle" };
  sheet.getRow(1).height = 30;
  sheet.mergeCells("A2:L2");
  sheet.getCell("A2").value = "전체 영화 투표 수 11개 이상 · 한국 영화 1개 이상 · 상영시간 40분 이상 · 한국어 줄거리 있음 · 감독 있음 · 성인물 제외";
  sheet.getCell("A2").font = { color: { argb: "FF4B5563" } };
  sheet.getCell("A2").alignment = { vertical: "middle" };

  const columns = [
    "감상여부", "한국어 제목", "개봉일", "장르", "대표 제작국가", "대표 제작사", "감독",
    "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "투표수", "_식별자", "_감상번호",
  ];
  const rows = movies.map((movie, index) => [
    "미감상",
    safeText(movie.title),
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
    movie.id,
    { formula: `IF(A${index + 5}=\"감상\",COUNTIF($A$5:A${index + 5},\"감상\"),\"\")`, result: "" },
  ]);

  sheet.addTable({
    name: "TmdbMovieExport",
    ref: "A4",
    headerRow: true,
    totalsRow: false,
    style: { theme: "TableStyleMedium2", showRowStripes: false },
    columns: columns.map((name) => ({ name, filterButton: true })),
    rows,
  });

  fitColumnWidths(sheet, columns, rows, { 10: OVERVIEW_COLUMN_WIDTH, 13: 10, 14: 10 });

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
  }

  sheet.getRow(4).height = 28;
  sheet.getRow(4).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getColumn(3).numFmt = "yyyy-mm-dd";
  sheet.getColumn(13).hidden = true;
  sheet.getColumn(14).hidden = true;

  const reviews = workbook.addWorksheet("감상기록", {
    views: [{ state: "frozen", xSplit: 3, ySplit: 4, activeCell: "D5", showGridLines: false }],
    properties: { defaultRowHeight: REVIEW_ROW_HEIGHT },
  });
  reviews.mergeCells("A1:N1");
  reviews.getCell("A1").value = "감상기록";
  reviews.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 15 };
  reviews.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
  reviews.getRow(1).height = 30;
  reviews.mergeCells("A2:N2");
  reviews.getCell("A2").value = "영화목록에서 '감상'하면 영화 정보가 자동으로 표시됩니다. 내 별점과 감상날짜를 입력하세요.";
  reviews.getCell("A2").alignment = { wrapText: true, vertical: "middle" };
  reviews.getCell("A2").font = { color: { argb: "FF4B5563" } };
  reviews.getRow(2).height = 34;

  const reviewRows = Array.from({ length: Math.max(1, movies.length) }, (_, index) => {
    const rowNumber = index + 5;
    const idFormula = `IFERROR(INDEX(TmdbMovieExport[_식별자],MATCH(ROWS($A$5:A${rowNumber}),TmdbMovieExport[_감상번호],0)),\"\")`;
    const lookupFormula = (column: string) => `IF($N${rowNumber}=\"\",\"\",IFERROR(INDEX(TmdbMovieExport[${column}],MATCH($N${rowNumber},TmdbMovieExport[_식별자],0)),\"\"))`;
    return [
      { formula: lookupFormula("한국어 제목"), result: "" },
      null,
      null,
      { formula: lookupFormula("개봉일"), result: "" },
      { formula: lookupFormula("장르"), result: "" },
      { formula: lookupFormula("대표 제작국가"), result: "" },
      { formula: lookupFormula("대표 제작사"), result: "" },
      { formula: lookupFormula("감독"), result: "" },
      { formula: lookupFormula("배우 전체"), result: "" },
      { formula: lookupFormula("원어"), result: "" },
      { formula: lookupFormula("한국어 줄거리"), result: "" },
      { formula: lookupFormula("상영시간(분)"), result: "" },
      { formula: lookupFormula("투표수"), result: "" },
      { formula: idFormula, result: "" },
    ];
  });
  reviews.addTable({
    name: "MovieReviews",
    ref: "A4",
    headerRow: true,
    totalsRow: false,
    style: { theme: "TableStyleMedium2", showRowStripes: false },
    columns: [
      "한국어 제목", "내 별점", "감상날짜", "개봉일", "장르", "대표 제작국가",
      "대표 제작사", "감독", "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "투표수", "_식별자",
    ].map((name) => ({ name, filterButton: true })),
    rows: reviewRows,
  });
  for (let rowNumber = 5; rowNumber < reviewRows.length + 5; rowNumber++) {
    reviews.getCell(rowNumber, 2).dataValidation = {
      type: "list", allowBlank: true, formulae: ["RatingOptions"],
      showErrorMessage: true, errorTitle: "별점 확인", error: "목록에서 별점을 선택해 주세요.",
    };
  }
  const reviewColumns = [
    "한국어 제목", "내 별점", "감상날짜", "개봉일", "장르", "대표 제작국가",
    "대표 제작사", "감독", "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "투표수", "_식별자",
  ];
  const reviewWidthRows = movies.map((movie) => [
    movie.title,
    "★★★★★",
    new Date(),
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
    movie.id,
  ]);
  fitColumnWidths(reviews, reviewColumns, reviewWidthRows, { 2: 16, 11: OVERVIEW_COLUMN_WIDTH, 14: 10 });
  reviews.getColumn(3).numFmt = "yyyy-mm-dd";
  reviews.getColumn(4).numFmt = "yyyy-mm-dd";
  reviews.getColumn(11).alignment = { vertical: "top", wrapText: true };
  reviews.getColumn(14).hidden = true;
  for (let rowNumber = 5; rowNumber < reviewRows.length + 5; rowNumber++) {
    reviews.getRow(rowNumber).height = REVIEW_ROW_HEIGHT;
  }
  reviews.getRow(4).height = 28;
  const statistics = workbook.addWorksheet("통계", {
    views: [{ state: "frozen", ySplit: 4, activeCell: "A5", showGridLines: true }],
    properties: { defaultRowHeight: 22 },
  });
  statistics.mergeCells("A1:O1");
  statistics.getCell("A1").value = "감상기록 통계";
  statistics.getCell("A1").font = { bold: true, size: 15, color: { argb: "FFFFFFFF" } };
  statistics.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
  statistics.getCell("A1").alignment = { vertical: "middle" };
  statistics.getRow(1).height = 30;
  statistics.mergeCells("A2:O2");
  statistics.getCell("A2").value = "감상기록 시트를 기준으로 연도별 개봉작 감상 수, 해당 연도 감상 수, 별점을 집계합니다.";
  statistics.getCell("A2").alignment = { wrapText: true, vertical: "middle" };
  statistics.getCell("A2").font = { color: { argb: "FF4B5563" } };
  statistics.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
  statistics.getRow(2).height = 36;
  const ratingLabels = ["☆", "★", "★☆", "★★", "★★☆", "★★★", "★★★☆", "★★★★", "★★★★☆", "★★★★★"];
  const statisticRatingLabels = [...ratingLabels].reverse();
  const latestYear = Math.max(year, new Date().getFullYear() + 2);
  const earliestYear = 1970;
  const yearRows = Array.from({ length: latestYear - earliestYear + 1 }, (_, index) => {
    const rowNumber = index + 6;
    const rowYear = latestYear - index;
    const releaseYearCriteria = `MovieReviews[개봉일],">="&DATE(A${rowNumber},1,1),MovieReviews[개봉일],"<"&DATE(A${rowNumber}+1,1,1)`;
    const watchedYearCriteria = `MovieReviews[감상날짜],">="&DATE(A${rowNumber},1,1),MovieReviews[감상날짜],"<"&DATE(A${rowNumber}+1,1,1),MovieReviews[한국어 제목],"<>"`;
    return [
      rowYear,
      { formula: `COUNTIFS(${releaseYearCriteria},MovieReviews[한국어 제목],"<>")`, result: 0 },
      { formula: `COUNTIFS(${watchedYearCriteria})`, result: 0 },
      { formula: `COUNTIFS(${releaseYearCriteria},MovieReviews[내 별점],"<>")`, result: 0 },
      {
        formula: `IF(D${rowNumber}=0,"",SUMPRODUCT(COUNTIFS(${releaseYearCriteria},MovieReviews[내 별점],RatingOptions),RatingScores)/D${rowNumber})`,
        result: "",
      },
      ...statisticRatingLabels.map((_, ratingIndex) => ({
        formula: `COUNTIFS(${releaseYearCriteria},MovieReviews[내 별점],${String.fromCharCode(70 + ratingIndex)}$4)`,
        result: 0,
      })),
    ];
  });
  const totalRow = [
    "전체",
    { formula: 'COUNTIF(MovieReviews[한국어 제목],"<>")', result: 0 },
    { formula: 'COUNTIFS(MovieReviews[감상날짜],"<>",MovieReviews[한국어 제목],"<>")', result: 0 },
    { formula: 'COUNTIF(MovieReviews[내 별점],"<>")', result: 0 },
    { formula: 'IF(D5=0,"",SUMPRODUCT(COUNTIF(MovieReviews[내 별점],RatingOptions),RatingScores)/D5)', result: "" },
    ...statisticRatingLabels.map((rating) => ({
      formula: `COUNTIF(MovieReviews[내 별점],"${rating}")`,
      result: 0,
    })),
  ];
  statistics.addTable({
    name: "MovieViewingStatistics", ref: "A4", headerRow: true, totalsRow: false,
    style: { theme: "TableStyleMedium2", showRowStripes: false },
    columns: ["연도", "개봉연도 감상 수", "감상연도 감상 수", "별점 입력 수", "평균 별점", ...statisticRatingLabels].map((name) => ({ name, filterButton: true })),
    rows: [totalRow, ...yearRows],
  });

  for (let column = 1; column <= 15; column++) {
    const cell = statistics.getCell(4, column);
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B7280" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  }
  for (let column = 1; column <= 15; column++) {
    const cell = statistics.getCell(5, column);
    cell.font = { bold: true, color: { argb: "FF374151" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
  }

  [12, 19, 19, 17, 20, ...statisticRatingLabels.map(() => 13)].forEach((width, index) => { statistics.getColumn(index + 1).width = width; });
  yearRows.forEach((_, index) => { statistics.getCell(index + 6, 1).numFmt = '0"년"'; });
  statistics.getColumn(2).numFmt = "0";
  statistics.getColumn(3).numFmt = "0";
  statistics.getColumn(4).numFmt = "0";
  statistics.getColumn(5).numFmt = '0.0';
  statisticRatingLabels.forEach((_, index) => { statistics.getColumn(index + 6).numFmt = "0"; });
  statistics.getRow(4).height = 28;
  addGrid(statistics, 4, yearRows.length + 5, 15);

  const info = workbook.addWorksheet("조회정보");
  info.views = [{ showGridLines: false }];
  info.addRows([
    ["조회 정보", ""],
    [],
    ["항목", "값"],
    ["출처", "영화 API"],
    ["대상 연도", year],
    ["정렬", "기본 조회 순서"],
    ["투표 수 조건", "전체 영화 11개 이상 · 한국 영화 1개 이상"],
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

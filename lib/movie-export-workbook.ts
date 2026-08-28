import ExcelJS from "exceljs";
import type { ExportMovie } from "./movie-export";

function safeText(value: unknown) {
  const text = String(value ?? "");
  if (text.length > 32766) throw new Error("엑셀 셀 글자 수 한도를 초과한 영화 정보가 있습니다. 데이터를 자르지 않고 내보내기를 중단했습니다.");
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
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
  sheet.mergeCells("A1:M1");
  sheet.getCell("A1").value = `${year}년 TMDB 영화 ${movies.length}편`;
  sheet.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 15 };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
  sheet.getCell("A1").alignment = { vertical: "middle" };
  sheet.getRow(1).height = 30;
  sheet.mergeCells("A2:M2");
  sheet.getCell("A2").value = "투표 수 1개 이상 · 상영시간 40분 이상 · 한국어 줄거리 있음 · 성인물 제외 · 인기도 내림차순";
  sheet.getCell("A2").font = { color: { argb: "FF4B5563" } };
  sheet.getCell("A2").alignment = { vertical: "middle" };

  const columns = [
    "선택", "TMDB ID", "한국어 제목", "원제", "개봉일", "장르", "제작 국가", "제작사", "감독",
    "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "_선택번호",
  ];
  const rows = movies.map((movie, index) => [
    "미선택",
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
    { formula: `IF(A${index + 5}=\"선택\",COUNTIF($A$5:A${index + 5},\"선택\"),\"\")`, result: "" },
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

  const widths = [8, 12, 28, 28, 13, 22, 18, 32, 22, 58, 9, 60, 16, 10];
  widths.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });

  if (movies.length > 0) {
    for (let rowNumber = 5; rowNumber <= movies.length + 4; rowNumber++) {
      sheet.getCell(rowNumber, 1).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["SelectionOptions"],
        showErrorMessage: true,
        errorTitle: "선택 값 확인",
        error: "목록에서 '미선택' 또는 '선택'을 골라 주세요.",
      };
    }
    sheet.addConditionalFormatting({
      ref: `A5:M${movies.length + 4}`,
      rules: [{
        type: "expression",
        priority: 1,
        formulae: ['$A5="선택"'],
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
  sheet.getColumn(14).hidden = true;

  movies.forEach((movie, index) => {
    const rowNumber = index + 5;
    const row = sheet.getRow(rowNumber);
    row.alignment = { vertical: "top", wrapText: true };
    const longestText = Math.max(movie.overview?.length ?? 0, movie.actors.length, movie.companies.length);
    row.height = Math.min(180, Math.max(42, Math.ceil(longestText / 55) * 18));
  });

  addGrid(sheet, 4, movies.length + 4, 13);

  const reviews = workbook.addWorksheet("감상기록", {
    views: [{ state: "frozen", ySplit: 4, activeCell: "A5", showGridLines: false }],
    properties: { defaultRowHeight: 20 },
  });
  reviews.mergeCells("A1:N1");
  reviews.getCell("A1").value = "감상기록";
  reviews.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 15 };
  reviews.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
  reviews.getRow(1).height = 30;
  reviews.mergeCells("A2:N2");
  reviews.getCell("A2").value = "영화목록에서 '선택'하면 TMDB ID와 영화 정보가 자동으로 표시됩니다. 내 별점은 목록에서 선택하고 감상평을 입력하세요.";
  reviews.getCell("A2").alignment = { wrapText: true, vertical: "middle" };
  reviews.getCell("A2").font = { color: { argb: "FF4B5563" } };
  reviews.getRow(2).height = 34;

  const lastMovieRow = Math.max(5, movies.length + 4);
  const reviewRows = Array.from({ length: Math.max(1, movies.length) }, (_, index) => {
    const rowNumber = index + 5;
    const idFormula = `IFERROR(INDEX('영화목록'!$B$5:$B$${lastMovieRow},MATCH(ROWS($A$5:A${rowNumber}),'영화목록'!$N$5:$N$${lastMovieRow},0)),\"\")`;
    const lookupFormula = (column: string) => `IF(A${rowNumber}=\"\",\"\",IFERROR(INDEX('영화목록'!$${column}$5:$${column}$${lastMovieRow},MATCH(A${rowNumber},'영화목록'!$B$5:$B$${lastMovieRow},0)),\"\"))`;
    return [
      { formula: idFormula, result: "" },
      { formula: lookupFormula("C"), result: "" },
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
      null,
      null,
    ];
  });
  reviews.addTable({
    name: "MovieReviews",
    ref: "A4",
    headerRow: true,
    totalsRow: false,
    style: { theme: "TableStyleLight1", showRowStripes: false },
    columns: [
      "TMDB ID", "한국어 제목", "원제", "개봉일", "장르", "제작 국가", "제작사", "감독",
      "배우 전체", "원어", "한국어 줄거리", "상영시간(분)", "내 별점", "감상평",
    ].map((name) => ({ name, filterButton: true })),
    rows: reviewRows,
  });
  for (let rowNumber = 5; rowNumber < reviewRows.length + 5; rowNumber++) {
    reviews.getCell(rowNumber, 13).dataValidation = {
      type: "list", allowBlank: true, formulae: ["RatingOptions"],
      showErrorMessage: true, errorTitle: "별점 확인", error: "목록에서 별점을 선택해 주세요.",
    };
  }
  [14, 28, 28, 13, 22, 18, 32, 22, 58, 9, 60, 16, 11, 70].forEach((width, index) => {
    reviews.getColumn(index + 1).width = width;
  });
  reviews.getColumn(4).numFmt = "yyyy-mm-dd";
  reviews.getColumn(11).alignment = { vertical: "top", wrapText: true };
  reviews.getColumn(14).alignment = { vertical: "top", wrapText: true };
  reviews.getRow(4).height = 28;

  addGrid(reviews, 4, reviewRows.length + 4, 14);

  const statistics = workbook.addWorksheet("통계", {
    views: [{ state: "frozen", ySplit: 4, activeCell: "A5", showGridLines: true }],
    properties: { defaultRowHeight: 22 },
  });
  statistics.mergeCells("A1:N1");
  statistics.getCell("A1").value = "감상기록 통계";
  statistics.getCell("A1").font = { bold: true, size: 15, color: { argb: "FFFFFFFF" } };
  statistics.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
  statistics.getCell("A1").alignment = { vertical: "middle" };
  statistics.getRow(1).height = 30;
  statistics.mergeCells("A2:N2");
  statistics.getCell("A2").value = "감상기록 시트를 기준으로 개봉연도별 감상 편수와 별점을 집계합니다. 별점이 없는 영화도 감상 편수에는 포함됩니다.";
  statistics.getCell("A2").alignment = { wrapText: true, vertical: "middle" };
  statistics.getCell("A2").font = { color: { argb: "FF4B5563" } };
  statistics.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
  statistics.getRow(2).height = 36;
  const ratingLabels = ["☆", "★", "★☆", "★★", "★★☆", "★★★", "★★★☆", "★★★★", "★★★★☆", "★★★★★"];
  const latestYear = Math.max(year, new Date().getFullYear() + 2);
  const earliestYear = Math.min(year, 2020);
  const yearRows = Array.from({ length: latestYear - earliestYear + 1 }, (_, index) => {
    const rowNumber = index + 5;
    const dateCriteria = `MovieReviews[개봉일],">="&DATE(A${rowNumber},1,1),MovieReviews[개봉일],"<"&DATE(A${rowNumber}+1,1,1)`;
    return [
      earliestYear + index,
      { formula: `COUNTIFS(${dateCriteria},MovieReviews[TMDB ID],">0")`, result: 0 },
      { formula: `COUNTIFS(${dateCriteria},MovieReviews[내 별점],"<>")`, result: 0 },
      {
        formula: `IF(C${rowNumber}=0,"",SUMPRODUCT(COUNTIFS(${dateCriteria},MovieReviews[내 별점],RatingOptions),RatingScores)/C${rowNumber})`,
        result: "",
      },
      ...ratingLabels.map((_, ratingIndex) => ({
        formula: `COUNTIFS(${dateCriteria},MovieReviews[내 별점],${String.fromCharCode(69 + ratingIndex)}$4)`,
        result: 0,
      })),
    ];
  });
  statistics.addTable({
    name: "MovieViewingStatistics", ref: "A4", headerRow: true, totalsRow: false,
    style: { theme: "TableStyleLight1", showRowStripes: false },
    columns: ["개봉연도", "감상 영화 수", "별점 입력 수", "평균 별점", ...ratingLabels].map((name) => ({ name, filterButton: true })),
    rows: yearRows,
  });

  const summaryRow = yearRows.length + 7;
  statistics.addTable({
    name: "MovieRatingDistribution", ref: `A${summaryRow}`, headerRow: true, totalsRow: false,
    style: { theme: "TableStyleLight1", showRowStripes: false },
    columns: ["별점", "영화 수"].map((name) => ({ name, filterButton: false })),
    rows: ratingLabels.map((rating, index) => [rating, {
      formula: `COUNTIF(MovieReviews[내 별점],A${summaryRow + index + 1})`, result: 0,
    }]),
  });

  statistics.getCell(summaryRow, 4).value = "전체 감상 영화";
  statistics.getCell(summaryRow, 5).value = { formula: 'COUNTIF(MovieReviews[TMDB ID],">0")', result: 0 };
  statistics.getCell(summaryRow + 1, 4).value = "별점 입력 영화";
  statistics.getCell(summaryRow + 1, 5).value = { formula: 'COUNTIF(MovieReviews[내 별점],"<>")', result: 0 };
  statistics.getCell(summaryRow + 2, 4).value = "전체 평균 별점";
  statistics.getCell(summaryRow + 2, 5).value = {
    formula: `IF(E${summaryRow + 1}=0,"",SUMPRODUCT(COUNTIF(MovieReviews[내 별점],RatingOptions),RatingScores)/E${summaryRow + 1})`, result: "",
  };
  statistics.getCell(summaryRow + 3, 4).value = "개봉일 미등록";
  statistics.getCell(summaryRow + 3, 5).value = {
    formula: 'COUNTIFS(MovieReviews[TMDB ID],">0",MovieReviews[개봉일],"")', result: 0,
  };

  [4, summaryRow].forEach((rowNumber) => {
    const lastColumn = rowNumber === 4 ? 14 : 2;
    for (let column = 1; column <= lastColumn; column++) {
      const cell = statistics.getCell(rowNumber, column);
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B7280" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    }
  });
  for (let rowNumber = summaryRow; rowNumber <= summaryRow + 3; rowNumber++) {
    statistics.getCell(rowNumber, 4).font = { bold: true, color: { argb: "FF374151" } };
    statistics.getCell(rowNumber, 4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
    statistics.getCell(rowNumber, 5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
  }

  [15, 17, 17, 20, ...ratingLabels.map(() => 13)].forEach((width, index) => { statistics.getColumn(index + 1).width = width; });
  yearRows.forEach((_, index) => { statistics.getCell(index + 5, 1).numFmt = '0"년"'; });
  statistics.getColumn(2).numFmt = '0"편"';
  statistics.getColumn(3).numFmt = '0"편"';
  statistics.getColumn(4).numFmt = '0.0';
  ratingLabels.forEach((_, index) => { statistics.getColumn(index + 5).numFmt = '0"편"'; });
  statistics.getCell(summaryRow + 2, 5).numFmt = '0.0';
  statistics.getRow(4).height = 28;
  statistics.getRow(summaryRow).height = 28;
  addGrid(statistics, 4, yearRows.length + 4, 14);
  addGrid(statistics, summaryRow, summaryRow + ratingLabels.length, 2);
  addGrid(statistics, summaryRow, summaryRow + 3, 5, 4);

  const info = workbook.addWorksheet("조회정보");
  info.views = [{ showGridLines: false }];
  info.addRows([
    ["조회 정보", ""],
    [],
    ["항목", "값"],
    ["출처", "TMDB API"],
    ["대상 연도", year],
    ["정렬", "인기도 내림차순"],
    ["투표 수 조건", "1개 이상 (투표 0개 제외)"],
    ["영화 수", movies.length],
    ["언어", "한국어 (ko-KR)"],
    ["상영시간 조건", "40분 이상 (미등록 제외)"],
    ["줄거리 조건", "한국어(ko-KR) 줄거리가 있는 영화만 포함"],
    ["조회 시각", new Date()],
  ]);
  info.mergeCells("A1:B1");
  info.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 15 };
  info.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5563" } };
  info.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  info.getRow(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B7280" } };
  info.getColumn(1).width = 20;
  info.getColumn(2).width = 44;
  info.getCell("B12").numFmt = "yyyy-mm-dd hh:mm";
  addGrid(info, 3, 12, 2);

  const listValues = workbook.addWorksheet("_목록값");
  listValues.state = "veryHidden";
  listValues.getCell("A1").value = "미선택";
  listValues.getCell("A2").value = "선택";
  ratingLabels.forEach((rating, index) => {
    listValues.getCell(index + 1, 2).value = rating;
    listValues.getCell(index + 1, 3).value = (index + 1) / 2;
  });
  workbook.definedNames.add("'_목록값'!$A$1:$A$2", "SelectionOptions");
  workbook.definedNames.add("'_목록값'!$B$1:$B$10", "RatingOptions");
  workbook.definedNames.add("'_목록값'!$C$1:$C$10", "RatingScores");

  return workbook.xlsx.writeBuffer();
}



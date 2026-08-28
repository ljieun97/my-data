import ExcelJS from "exceljs";
import type { ExportMovie } from "./movie-export";

function safeText(value: unknown) {
  const text = String(value ?? "");
  if (text.length > 32766) throw new Error("엑셀 셀 글자 수 한도를 초과한 영화 정보가 있습니다. 데이터를 자르지 않고 내보내기를 중단했습니다.");
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

export async function createWorkbook(year: number, movies: ExportMovie[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TOVIE";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("영화목록", {
    views: [{ state: "frozen", xSplit: 3, ySplit: 1, activeCell: "D2" }],
    properties: { defaultRowHeight: 20 },
  });

  const columns = [
    "순위", "TMDB ID", "한국어 제목", "원제", "개봉일", "장르", "제작 국가", "제작사", "감독",
    "배우 전체", "원어", "한국어 줄거리", "상영시간(분)",
  ];
  const rows = movies.map((movie) => [
    movie.rank,
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
  ]);

  sheet.addTable({
    name: "TmdbMovieExport",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: { theme: "TableStyleMedium2", showRowStripes: true },
    columns: columns.map((name) => ({ name, filterButton: true })),
    rows,
  });

  const widths = [8, 12, 28, 28, 13, 22, 18, 32, 22, 58, 9, 60, 16];
  widths.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });

  sheet.getRow(1).height = 28;
  sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getColumn(5).numFmt = "yyyy-mm-dd";

  movies.forEach((movie, index) => {
    const rowNumber = index + 2;
    const row = sheet.getRow(rowNumber);
    row.alignment = { vertical: "top", wrapText: true };
    const longestText = Math.max(movie.overview?.length ?? 0, movie.actors.length, movie.companies.length);
    row.height = Math.min(180, Math.max(42, Math.ceil(longestText / 55) * 18));
  });

  const info = workbook.addWorksheet("조회정보");
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
  info.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B3954" } };
  info.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  info.getRow(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF087E8B" } };
  info.getColumn(1).width = 20;
  info.getColumn(2).width = 44;
  info.getCell("B11").numFmt = "yyyy-mm-dd hh:mm";

  return workbook.xlsx.writeBuffer();
}



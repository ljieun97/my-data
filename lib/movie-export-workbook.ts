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
    views: [{ state: "frozen", xSplit: 3, ySplit: 4, activeCell: "D5" }],
    properties: { defaultRowHeight: 20 },
  });
  sheet.mergeCells("A1:R1");
  sheet.getCell("A1").value = `${year}년 TMDB 영화 전체 ${movies.length}편`;
  sheet.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 16 };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B3954" } };
  sheet.getCell("A1").alignment = { vertical: "middle" };
  sheet.getRow(1).height = 34;

  sheet.mergeCells("A2:R2");
  sheet.getCell("A2").value = "TMDB 인기도 내림차순 · 투표 수 1개 이상 · 상영시간 40분 이상 · 한국어(ko-KR) 메타데이터 · 성인물 제외";
  sheet.getCell("A2").font = { italic: true, color: { argb: "FF28536B" } };
  sheet.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F3F8" } };

  const columns = [
    "순위", "TMDB ID", "한국어 제목", "원제", "개봉일", "장르", "제작 국가", "제작사", "감독",
    "배우 전체", "원어", "평점", "투표 수", "인기도", "한국어 줄거리", "TMDB 링크", "포스터 링크", "상영시간(분)",
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
    movie.vote_average ?? 0,
    movie.vote_count ?? 0,
    movie.popularity ?? 0,
    safeText(movie.overview),
    `https://www.themoviedb.org/movie/${movie.id}?language=ko-KR`,
    movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "",
    movie.runtime,
  ]);

  sheet.addTable({
    name: "TmdbMovieExport",
    ref: "A4",
    headerRow: true,
    totalsRow: false,
    style: { theme: "TableStyleMedium2", showRowStripes: true },
    columns: columns.map((name) => ({ name, filterButton: true })),
    rows,
  });

  const widths = [8, 12, 28, 28, 13, 22, 18, 32, 22, 58, 9, 9, 12, 11, 60, 44, 54, 16];
  widths.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });

  sheet.getRow(4).height = 28;
  sheet.getRow(4).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getColumn(5).numFmt = "yyyy-mm-dd";
  sheet.getColumn(12).numFmt = "0.0";
  sheet.getColumn(13).numFmt = "#,##0";
  sheet.getColumn(14).numFmt = "0.0";

  movies.forEach((movie, index) => {
    const rowNumber = index + 5;
    const row = sheet.getRow(rowNumber);
    row.alignment = { vertical: "top", wrapText: true };
    const longestText = Math.max(movie.overview?.length ?? 0, movie.actors.length, movie.companies.length);
    row.height = Math.min(180, Math.max(42, Math.ceil(longestText / 55) * 18));
    sheet.getCell(rowNumber, 16).value = {
      text: "TMDB 열기",
      hyperlink: `https://www.themoviedb.org/movie/${movie.id}?language=ko-KR`,
    };
    sheet.getCell(rowNumber, 16).font = { color: { argb: "FF0563C1" }, underline: true };
    if (movie.poster_path) {
      sheet.getCell(rowNumber, 17).value = {
        text: "포스터 열기",
        hyperlink: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      };
      sheet.getCell(rowNumber, 17).font = { color: { argb: "FF0563C1" }, underline: true };
    }
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



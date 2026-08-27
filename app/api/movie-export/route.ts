import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const TMDB_API_BASE = "https://api.themoviedb.org/3";
const SAMPLE_SIZE = 10;

type TmdbMovie = {
  id: number;
  title?: string;
  original_title?: string;
  release_date?: string;
  genre_ids?: number[];
  original_language?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  overview?: string;
  poster_path?: string | null;
};

type ExportMovie = TmdbMovie & {
  rank: number;
  genres: string;
  countries: string;
  companies: string;
  directors: string;
  actors: string;
};

function getApiKey() {
  return process.env.API_KEY_TMDB;
}

async function fetchTmdb<T>(path: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const url = new URL(`${TMDB_API_BASE}${path}`);
  url.search = new URLSearchParams({ ...params, api_key: apiKey }).toString();

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { accept: "application/json" },
    });
    if (response.ok) return response.json() as Promise<T>;

    if (response.status === 429 || response.status >= 500) {
      const retryAfter = Number(response.headers.get("retry-after") || 2 ** attempt);
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      continue;
    }

    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  throw new Error("TMDB request failed after retries");
}

function safeText(value: unknown) {
  const text = String(value ?? "");
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

async function collectMovies(year: number, apiKey: string): Promise<ExportMovie[]> {
  const [discover, genreResponse] = await Promise.all([
    fetchTmdb<{ results: TmdbMovie[] }>(
      "/discover/movie",
      {
        language: "ko-KR",
        include_adult: "false",
        include_video: "false",
        primary_release_year: String(year),
        "vote_count.gte": "1",
        sort_by: "popularity.desc",
        page: "1",
      },
      apiKey,
    ),
    fetchTmdb<{ genres: Array<{ id: number; name: string }> }>(
      "/genre/movie/list",
      { language: "ko-KR" },
      apiKey,
    ),
  ]);

  const genreNames = new Map(genreResponse.genres.map((genre) => [genre.id, genre.name]));
  const regionNames = new Intl.DisplayNames(["ko"], { type: "region" });
  const topMovies = [...discover.results]
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, SAMPLE_SIZE);

  return Promise.all(
    topMovies.map(async (movie, index) => {
      const [details, credits] = await Promise.all([
        fetchTmdb<{
          production_countries?: Array<{ iso_3166_1: string; name: string }>;
          production_companies?: Array<{ name: string }>;
        }>(`/movie/${movie.id}`, { language: "ko-KR" }, apiKey),
        fetchTmdb<{
          cast?: Array<{ name: string; character?: string; order?: number }>;
          crew?: Array<{ name: string; job?: string }>;
        }>(`/movie/${movie.id}/credits`, { language: "ko-KR" }, apiKey),
      ]);

      const actors = [...(credits.cast ?? [])]
        .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
        .map((person) => (person.character ? `${person.name} (${person.character})` : person.name))
        .join(", ");

      return {
        ...movie,
        rank: index + 1,
        genres: (movie.genre_ids ?? []).map((id) => genreNames.get(id) ?? String(id)).join(", "),
        countries: (details.production_countries ?? [])
          .map((country) => regionNames.of(country.iso_3166_1) ?? country.name)
          .join(", "),
        companies: (details.production_companies ?? []).map((company) => company.name).join(", "),
        directors: (credits.crew ?? [])
          .filter((person) => person.job === "Director")
          .map((person) => person.name)
          .join(", "),
        actors,
      };
    }),
  );
}

async function createWorkbook(year: number, movies: ExportMovie[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TOVIE";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("영화목록", {
    views: [{ state: "frozen", xSplit: 3, ySplit: 4, activeCell: "D5" }],
    properties: { defaultRowHeight: 20 },
  });
  sheet.mergeCells("A1:Q1");
  sheet.getCell("A1").value = `${year}년 TMDB 영화 TOP ${SAMPLE_SIZE}`;
  sheet.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 16 };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B3954" } };
  sheet.getCell("A1").alignment = { vertical: "middle" };
  sheet.getRow(1).height = 34;

  sheet.mergeCells("A2:Q2");
  sheet.getCell("A2").value = "TMDB 인기도 내림차순 · 투표 수 1개 이상 · 한국어(ko-KR) 메타데이터 · 성인물 제외";
  sheet.getCell("A2").font = { italic: true, color: { argb: "FF28536B" } };
  sheet.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F3F8" } };

  const columns = [
    "순위", "TMDB ID", "한국어 제목", "원제", "개봉일", "장르", "제작 국가", "제작사", "감독",
    "배우 전체", "원어", "평점", "투표 수", "인기도", "한국어 줄거리", "TMDB 링크", "포스터 링크",
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

  const widths = [8, 12, 28, 28, 13, 22, 18, 32, 22, 58, 9, 9, 12, 11, 60, 44, 54];
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
    ["표본 수", movies.length],
    ["언어", "한국어 (ko-KR)"],
    ["조회 시각", new Date()],
  ]);
  info.mergeCells("A1:B1");
  info.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 15 };
  info.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B3954" } };
  info.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  info.getRow(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF087E8B" } };
  info.getColumn(1).width = 20;
  info.getColumn(2).width = 44;
  info.getCell("B10").numFmt = "yyyy-mm-dd hh:mm";

  return workbook.xlsx.writeBuffer();
}

export async function GET(request: NextRequest) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  const currentYear = new Date().getFullYear();
  const year = Number(request.nextUrl.searchParams.get("year"));
  if (!Number.isInteger(year) || year < 1888 || year > currentYear + 2) {
    return NextResponse.json({ error: "조회 가능한 연도를 입력해 주세요." }, { status: 400 });
  }

  try {
    const movies = await collectMovies(year, apiKey);
    if (movies.length === 0) {
      return NextResponse.json({ error: `${year}년 영화가 없습니다.` }, { status: 404 });
    }

    const buffer = await createWorkbook(year, movies);
    const filename = `tmdb-${year}-movies-ko-top${movies.length}.xlsx`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to export TMDB movies", error);
    return NextResponse.json({ error: "영화 데이터를 엑셀로 만드는 중 오류가 발생했습니다." }, { status: 502 });
  }
}

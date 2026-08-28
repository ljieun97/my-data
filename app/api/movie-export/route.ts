import { NextRequest, NextResponse } from "next/server";
import {
  MIN_RUNTIME_MINUTES, MIN_VOTE_COUNT, TMDB_MAX_PAGE, isWindowInYear, validateYear,
  type DateWindow, type ExportMovie, type TmdbMovie,
} from "@/lib/movie-export";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const TMDB_API_BASE = "https://api.themoviedb.org/3";
const DETAIL_BATCH_SIZE = 5;

type DiscoverResponse = { page: number; results: TmdbMovie[]; total_pages: number; total_results: number };
type DetailResponse = TmdbMovie & {
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  production_companies?: Array<{ name: string }>;
  credits?: {
    cast?: Array<{ name: string; character?: string; order?: number }>;
    crew?: Array<{ name: string; job?: string }>;
  };
};

async function fetchTmdb<T>(path: string, params: Record<string, string>, apiKey: string, signal: AbortSignal): Promise<T> {
  const url = new URL(`${TMDB_API_BASE}${path}`);
  url.search = new URLSearchParams({ ...params, api_key: apiKey }).toString();
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { next: { revalidate: 3600 }, headers: { accept: "application/json" }, signal });
    if (response.ok) return response.json() as Promise<T>;
    if (response.status !== 429 && response.status < 500) throw new Error(`TMDB request failed with status ${response.status}`);
    const retryAfter = Number(response.headers.get("retry-after"));
    const waitMs = Math.min(15000, Math.max(1000 * 2 ** attempt, Number.isFinite(retryAfter) ? retryAfter * 1000 : 0));
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, waitMs);
      signal.addEventListener("abort", () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
    });
  }
  throw new Error("TMDB request failed after retries");
}

function getDiscoverParams(year: number, window: DateWindow, page: number) {
  return {
    language: "ko-KR", include_adult: "false", include_video: "false",
    primary_release_year: String(year), "primary_release_date.gte": window.from,
    "primary_release_date.lte": window.to, "vote_count.gte": String(MIN_VOTE_COUNT),
    "with_runtime.gte": String(MIN_RUNTIME_MINUTES), sort_by: "primary_release_date.asc", page: String(page),
  };
}

function getRequestInput(request: NextRequest) {
  const year = validateYear(request.nextUrl.searchParams.get("year"));
  const window = { from: request.nextUrl.searchParams.get("from") ?? "", to: request.nextUrl.searchParams.get("to") ?? "" };
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const mode = request.nextUrl.searchParams.get("mode") === "summary" ? "summary" : "page";
  if (!year || !isWindowInYear(window, year) || !Number.isInteger(page) || page < 1 || page > TMDB_MAX_PAGE) return null;
  return { year, window, page, mode } as const;
}

function normalizeMovie(movie: TmdbMovie, details: DetailResponse, rank: number): ExportMovie {
  const regionNames = new Intl.DisplayNames(["ko"], { type: "region" });
  const actors = [...(details.credits?.cast ?? [])]
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    .map((person) => (person.character ? `${person.name} (${person.character})` : person.name)).join(", ");
  return {
    ...movie, title: details.title ?? movie.title, original_title: details.original_title ?? movie.original_title,
    overview: details.overview ?? movie.overview, poster_path: details.poster_path ?? movie.poster_path,
    runtime: Number(details.runtime) || 0, rank,
    genres: (details.genres ?? []).map((genre) => genre.name).join(", "),
    countries: (details.production_countries ?? []).map((country) => regionNames.of(country.iso_3166_1) ?? country.name).join(", "),
    companies: (details.production_companies ?? []).map((company) => company.name).join(", "),
    directors: (details.credits?.crew ?? []).filter((person) => person.job === "Director").map((person) => person.name).join(", "),
    actors,
  };
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.API_KEY_TMDB;
  if (!apiKey) return NextResponse.json({ error: "TMDB API 키가 설정되지 않았습니다." }, { status: 500 });
  const input = getRequestInput(request);
  if (!input) return NextResponse.json({ error: "조회 연도, 날짜 범위 또는 페이지가 올바르지 않습니다." }, { status: 400 });
  try {
    const discover = await fetchTmdb<DiscoverResponse>("/discover/movie", getDiscoverParams(input.year, input.window, input.page), apiKey, request.signal);
    const base = { ...input.window, page: input.page, totalPages: discover.total_pages, totalResults: discover.total_results };
    if (input.mode === "summary") return NextResponse.json(base);
    if (input.page > discover.total_pages && discover.total_pages > 0) {
      return NextResponse.json({ error: "조회 페이지가 전체 페이지 수를 초과했습니다." }, { status: 400 });
    }
    const movies: ExportMovie[] = [];
    const excludedIds: number[] = [];
    for (let offset = 0; offset < discover.results.length; offset += DETAIL_BATCH_SIZE) {
      const batch = discover.results.slice(offset, offset + DETAIL_BATCH_SIZE);
      const details = await Promise.all(batch.map((movie) => fetchTmdb<DetailResponse>(
        `/movie/${movie.id}`, { language: "ko-KR", append_to_response: "credits" }, apiKey, request.signal,
      )));
      details.forEach((detail, index) => {
        const movie = normalizeMovie(batch[index], detail, offset + index + 1);
        if (movie.runtime >= MIN_RUNTIME_MINUTES
          && (movie.vote_count ?? 0) >= MIN_VOTE_COUNT
          && movie.overview?.trim()) movies.push(movie);
        else excludedIds.push(movie.id);
      });
    }
    return NextResponse.json({ ...base, scannedIds: discover.results.map((movie) => movie.id), excludedIds, movies });
  } catch (error) {
    if (request.signal.aborted) return new NextResponse(null, { status: 499 });
    console.error("Failed to collect TMDB movie export page", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "TMDB 영화 정보를 조회하는 중 오류가 발생했습니다." }, { status: 502 });
  }
}

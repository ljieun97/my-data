import { NextRequest, NextResponse } from "next/server";
import {
  GLOBAL_MIN_VOTE_COUNT, KOREAN_MAX_VOTE_COUNT, KOREAN_MIN_VOTE_COUNT,
  MIN_RUNTIME_MINUTES, TMDB_MAX_PAGE, isWindowInYear, validateYear,
  type DateWindow, type ExportMovie, type ExportQuery, type TmdbMovie,
} from "@/lib/movie-export";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const TMDB_API_BASE = "https://api.themoviedb.org/3";
const DETAIL_BATCH_SIZE = 5;

type DiscoverResponse = { page: number; results: TmdbMovie[]; total_pages: number; total_results: number };
type SearchResponse = { page: number; results: TmdbMovie[]; total_pages: number; total_results: number };
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
    const response = await fetch(url, { cache: "no-store", headers: { accept: "application/json" }, signal });
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

function getDiscoverParams(year: number, window: DateWindow, page: number, query: ExportQuery) {
  const params: Record<string, string> = {
    language: "ko-KR", include_adult: "false", include_video: "false",
    primary_release_year: String(year), "primary_release_date.gte": window.from,
    "primary_release_date.lte": window.to,
    "with_runtime.gte": String(MIN_RUNTIME_MINUTES), sort_by: "primary_release_date.asc", page: String(page),
  };
  if (query === "global") {
    params["vote_count.gte"] = String(GLOBAL_MIN_VOTE_COUNT);
  } else {
    params["vote_count.gte"] = String(KOREAN_MIN_VOTE_COUNT);
    params["vote_count.lte"] = String(KOREAN_MAX_VOTE_COUNT);
    params.with_origin_country = "KR";
  }
  return params;
}

function getRequestInput(request: NextRequest) {
  const movieId = Number(request.nextUrl.searchParams.get("movieId") ?? "");
  if (Number.isInteger(movieId) && movieId > 0) return { mode: "movie-id", movieId } as const;

  const title = request.nextUrl.searchParams.get("title")?.trim();
  if (title) return { mode: "title-search", title } as const;

  const year = validateYear(request.nextUrl.searchParams.get("year"));
  const window = { from: request.nextUrl.searchParams.get("from") ?? "", to: request.nextUrl.searchParams.get("to") ?? "" };
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const mode = request.nextUrl.searchParams.get("mode") === "summary" ? "summary" : "page";
  const queryParam = request.nextUrl.searchParams.get("query") ?? "global";
  if (queryParam !== "global" && queryParam !== "korean-low-vote") return null;
  if (!year || !isWindowInYear(window, year) || !Number.isInteger(page) || page < 1 || page > TMDB_MAX_PAGE) return null;
  return { year, window, page, mode, query: queryParam satisfies ExportQuery } as const;
}

function normalizeTitle(value: string) {
  return value.toLowerCase().replace(/[\s:!?'".,()-]/g, "");
}

function selectBestSearchMatch(results: TmdbMovie[], title: string) {
  if (!results.length) return null;
  const normalizedTitle = normalizeTitle(title);
  return results.find((movie) => {
    const candidates = [movie.title, movie.original_title].filter(Boolean) as string[];
    return candidates.some((candidate) => normalizeTitle(candidate) === normalizedTitle);
  }) ?? results[0];
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
    countries: details.production_countries?.[0]
      ? regionNames.of(details.production_countries[0].iso_3166_1) ?? details.production_countries[0].name
      : "",
    companies: details.production_companies?.[0]?.name ?? "",
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
    if (input.mode === "movie-id") {
      const detail = await fetchTmdb<DetailResponse>(
        `/movie/${input.movieId}`, { language: "ko-KR", append_to_response: "credits" }, apiKey, request.signal,
      );
      return NextResponse.json({ movie: normalizeMovie(detail, detail, 1) });
    }

    if (input.mode === "title-search") {
      const search = await fetchTmdb<SearchResponse>("/search/movie", {
        query: input.title,
        language: "ko-KR",
        region: "KR",
        include_adult: "false",
        page: "1",
      }, apiKey, request.signal);
      const results = (search.results ?? []).slice(0, 6);
      if (request.nextUrl.searchParams.get("suggest") === "1") {
        return NextResponse.json({ results });
      }
      const matchedMovie = selectBestSearchMatch(results, input.title);
      if (!matchedMovie) {
        return NextResponse.json({ error: "제목과 일치하는 영화를 찾지 못했습니다." }, { status: 404 });
      }
      const detail = await fetchTmdb<DetailResponse>(
        `/movie/${matchedMovie.id}`, { language: "ko-KR", append_to_response: "credits" }, apiKey, request.signal,
      );
      return NextResponse.json({ movie: normalizeMovie(matchedMovie, detail, 1) });
    }

    const discover = await fetchTmdb<DiscoverResponse>("/discover/movie", getDiscoverParams(input.year, input.window, input.page, input.query), apiKey, request.signal);
    const base = { ...input.window, query: input.query, page: input.page, totalPages: discover.total_pages, totalResults: discover.total_results };
    if (input.mode === "summary") return NextResponse.json(base);
    const movies: ExportMovie[] = [];
    const excludedIds: number[] = [];
    for (let offset = 0; offset < discover.results.length; offset += DETAIL_BATCH_SIZE) {
      const batch = discover.results.slice(offset, offset + DETAIL_BATCH_SIZE);
      const details = await Promise.all(batch.map((movie) => fetchTmdb<DetailResponse>(
        `/movie/${movie.id}`, { language: "ko-KR", append_to_response: "credits" }, apiKey, request.signal,
      )));
      details.forEach((detail, index) => {
        const movie = normalizeMovie(batch[index], detail, offset + index + 1);
        const voteCount = movie.vote_count ?? 0;
        const hasValidVoteCount = input.query === "global"
          ? voteCount >= GLOBAL_MIN_VOTE_COUNT
          : voteCount >= KOREAN_MIN_VOTE_COUNT && voteCount <= KOREAN_MAX_VOTE_COUNT;
        if (movie.runtime >= MIN_RUNTIME_MINUTES
          && hasValidVoteCount
          && movie.overview?.trim()
          && movie.directors.trim()) movies.push(movie);
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

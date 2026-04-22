import type { HomeMovieCardItem } from "@/components/home/card-slider";
import { getKobisBoxoffice } from "@/lib/open-api/kobis";
import { getTopRatedMovies, searchMovieMetaByTitleAndDate } from "@/lib/open-api/tmdb-server";
import { unstable_cache } from "next/cache";

const TMDB_API_KEY = process.env.API_KEY_TMDB || process.env.NEXT_PUBLIC_API_KEY_TMDB;
const numberFormatter = new Intl.NumberFormat("ko-KR");

export type HomeMovieCardSeed = HomeMovieCardItem & {
  originalTitle?: string | null;
};

export type HomeSectionsSeed = {
  boxOfficeCards: HomeMovieCardSeed[];
  upcomingCards: HomeMovieCardSeed[];
  topRatedCards: HomeMovieCardSeed[];
};

function formatCompactNumber(value?: string) {
  const parsed = Number(value ?? 0);

  if (parsed >= 10000) {
    const compact = parsed / 10000;
    const formatted = Number.isInteger(compact)
      ? numberFormatter.format(compact)
      : new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(compact);

    return `${formatted}\uB9CC`;
  }

  return numberFormatter.format(parsed);
}

function formatCount(value?: string) {
  return `${formatCompactNumber(value)}\uBA85`;
}

function rankChangeLabel(movie: { rankInten?: string; rankOldAndNew?: string }) {
  const change = Number(movie.rankInten ?? 0);

  if (movie.rankOldAndNew === "NEW") {
    return { label: "NEW", tone: "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-slate-950" };
  }

  if (change > 0) {
    return { label: `\u25B2${change}`, tone: "bg-sky-500 text-white dark:bg-sky-400 dark:text-slate-950" };
  }

  if (change < 0) {
    return { label: `\u25BC${Math.abs(change)}`, tone: "bg-rose-500 text-white dark:bg-rose-400 dark:text-slate-950" };
  }

  return { label: "", tone: "" };
}

async function fetchUpcomingMoviesPage() {
  if (!TMDB_API_KEY) {
    return [];
  }

  const url = new URL("https://api.themoviedb.org/3/movie/upcoming");
  url.searchParams.set("language", "ko");
  url.searchParams.set("region", "KR");
  url.searchParams.set("page", "1");
  url.searchParams.set("api_key", TMDB_API_KEY);

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error(`Failed to fetch upcoming movies: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.results) ? data.results : [];
}

const getCachedBoxOfficeCards = unstable_cache(
  async (targetDate: string) => {
    const boxOfficeResponse = await getKobisBoxoffice(targetDate, "A");
    const dailyBoxOfficeList = boxOfficeResponse?.boxOfficeResult?.dailyBoxOfficeList ?? [];

    return Promise.all(
      dailyBoxOfficeList.map(async (movie: any) => {
        const meta = await searchMovieMetaByTitleAndDate(movie.movieNm, movie.openDt);
        const rankChange = rankChangeLabel(movie);

        return {
          id: `kobis-${movie.rank}-${movie.movieCd ?? movie.movieNm}`,
          title: movie.movieNm,
          year: movie.openDt?.slice(0, 4),
          rank: movie.rank,
          rankChangeLabel: rankChange.label,
          rankChangeTone: rankChange.tone,
          tmdbId: meta.tmdbId,
          posterPath: meta.posterPath,
          backdropPath: meta.backdropPath,
          overview: meta.overview,
          detailLine: `\uC77C\uC77C ${formatCount(movie.audiCnt)} \uB204\uC801 ${formatCount(movie.audiAcc)}`,
        } as HomeMovieCardSeed;
      }),
    );
  },
  ["home-kobis-boxoffice-cards"],
  { revalidate: 86400 },
)

export async function getHomeSectionsSeed(): Promise<HomeSectionsSeed> {
  const targetDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const [boxOfficeCards, upcomingMovies, topRatedMovies] = await Promise.all([
    getCachedBoxOfficeCards(targetDate),
    fetchUpcomingMoviesPage(),
    getTopRatedMovies(),
  ]);

  const upcomingCards: HomeMovieCardSeed[] = upcomingMovies
    .filter((movie: any) => movie.poster_path)
    .map((movie: any, index: number) => ({
      id: `upcoming-${movie.id}`,
      title: movie.title ?? movie.original_title ?? "Untitled",
      year: movie.release_date?.slice(0, 4),
      rank: String(index + 1),
      tmdbId: movie.id,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path ?? null,
      overview: movie.overview ?? null,
      englishTitle: movie.original_title ?? movie.title ?? null,
      originalTitle: movie.original_title ?? null,
    }));

  const topRatedCards: HomeMovieCardSeed[] = (Array.isArray(topRatedMovies) ? topRatedMovies : [])
    .filter((movie: any) => movie.poster_path)
    .map((movie: any, index: number) => ({
      id: `top-rated-${movie.id}`,
      title: movie.title ?? movie.original_title ?? "Untitled",
      year: movie.release_date?.slice(0, 4),
      rank: String(index + 1),
      tmdbId: movie.id,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path ?? null,
      overview: movie.overview ?? null,
      englishTitle: movie.original_title ?? movie.title ?? null,
      originalTitle: movie.original_title ?? null,
    }));

  return {
    boxOfficeCards,
    upcomingCards,
    topRatedCards,
  };
}

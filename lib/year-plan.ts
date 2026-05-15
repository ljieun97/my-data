import { unstable_cache } from "next/cache";
import { connectMongo } from "@/lib/mongo/mongodb";
import { getKobisYearlyMovieList } from "@/lib/open-api/kobis";
import { searchMovieMetaByTitleAndDate } from "@/lib/open-api/tmdb-server";

export type YearPlanEntry = {
  title: string;
  summary?: string | null;
  type?: string | null;
  date: string;
  tmdbId?: number | null;
  tmdbType?: "movie" | "tv" | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type YearPlanPreviewMonth = {
  key: string;
  label: string;
  entries: YearPlanEntry[];
};

export type YearPlanPreview = {
  year: number;
  title: string;
  months: YearPlanPreviewMonth[];
};

export type YearPlanMonthGroup = {
  key: string;
  month: number;
  label: string;
  entries: YearPlanEntry[];
};

export type YearPlanYearGroup = {
  year: number;
  title: string;
  months: YearPlanMonthGroup[];
};

function toDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getYearFromDate(date?: string | null) {
  return toDate(date)?.getFullYear() ?? null;
}

function getMonthFromDate(date?: string | null) {
  const parsed = toDate(date);
  return parsed ? parsed.getMonth() + 1 : null;
}

function getMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getMonthLabel(year: number, month: number) {
  return `${year}.${String(month).padStart(2, "0")}`;
}

function typePriority(type?: string | null) {
  if (type === "사건") {
    return 0;
  }

  return 1;
}

function sortEntries(entries: YearPlanEntry[]) {
  return [...entries].sort((a, b) => {
    const typeCompare = typePriority(a.type) - typePriority(b.type);

    if (typeCompare !== 0) {
      return typeCompare;
    }

    const titleCompare = a.title.localeCompare(b.title, "ko");

    if (titleCompare !== 0) {
      return titleCompare;
    }

    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return 0;
  });
}

const getCachedAllYearPlanEntries = unstable_cache(
  async () => {
    try {
      const { db } = await connectMongo();
      return (await db
        .collection("yearPlans")
        .find({ type: { $ne: "개봉" } })
        .toArray()) as unknown as YearPlanEntry[];
    } catch (error) {
      console.error("Failed to load year plan entries from MongoDB.", error);
      return [] as YearPlanEntry[];
    }
  },
  ["year-plan-entries"],
  { revalidate: 3600 },
);

const getCachedKobisReleaseEntries = unstable_cache(
  async (year: number) => {
    const movies = await getKobisYearlyMovieList(year);

    const normalized = await Promise.all(
      movies
        .filter((movie: any) => typeof movie?.movieNm === "string" && /^\d{8}$/.test(movie?.openDt ?? ""))
        .map(async (movie: any) => {
          const openDate = `${movie.openDt.slice(0, 4)}-${movie.openDt.slice(4, 6)}-${movie.openDt.slice(6, 8)}`;
          const meta = await searchMovieMetaByTitleAndDate(movie.movieNm, openDate);

          return {
            title: movie.movieNm,
            summary: meta.overview ?? null,
            type: "개봉",
            date: openDate,
            tmdbId: meta.tmdbId,
            tmdbType: meta.tmdbId ? ("movie" as const) : null,
          } satisfies YearPlanEntry;
        }),
    );

    const uniqueEntries = new Map<string, YearPlanEntry>();

    for (const entry of normalized) {
      const key = `${entry.date}:${entry.title}`;
      if (!uniqueEntries.has(key)) {
        uniqueEntries.set(key, entry);
      }
    }

    return Array.from(uniqueEntries.values());
  },
  ["year-plan-kobis-releases"],
  { revalidate: 3600 },
);

export async function getLatestYearPlanPreview(referenceDate = new Date()): Promise<YearPlanPreview | null> {
  const year = referenceDate.getFullYear();
  const baseMonth = referenceDate.getMonth() + 1;
  const monthOffsets = [-1, 0, 1];
  const dbEntries = await getCachedAllYearPlanEntries();

  const monthTargets = monthOffsets.map((offset) => {
    const anchor = new Date(year, baseMonth - 1 + offset, 1);
    return {
      year: anchor.getFullYear(),
      month: anchor.getMonth() + 1,
    };
  });

  const kobisEntriesByYear = new Map<number, YearPlanEntry[]>();
  for (const target of monthTargets) {
    if (!kobisEntriesByYear.has(target.year)) {
      kobisEntriesByYear.set(target.year, await getCachedKobisReleaseEntries(target.year));
    }
  }

  const months = monthTargets
    .map(({ year: monthYear, month }) => {
      const dbMonthEntries = dbEntries.filter(
        (entry) => getYearFromDate(entry.date) === monthYear && getMonthFromDate(entry.date) === month,
      );
      const releaseMonthEntries = (kobisEntriesByYear.get(monthYear) ?? []).filter(
        (entry) => getMonthFromDate(entry.date) === month,
      );
      const monthEntries = sortEntries([...dbMonthEntries, ...releaseMonthEntries]);

      return {
        key: getMonthKey(monthYear, month),
        label: getMonthLabel(monthYear, month),
        entries: monthEntries.slice(0, 3),
      };
    })
    .filter((month) => month.entries.length > 0);

  if (!months.length) {
    return null;
  }

  return {
    year,
    title: `${year} Year Plan`,
    months,
  };
}

export async function getYearPlanByYear(year: number): Promise<YearPlanYearGroup | null> {
  const dbEntries = await getCachedAllYearPlanEntries();
  const releaseEntries = await getCachedKobisReleaseEntries(year);
  const entries = [...dbEntries, ...releaseEntries];
  const yearEntries = sortEntries(entries.filter((entry) => getYearFromDate(entry.date) === year));

  if (!yearEntries.length) {
    return null;
  }

  const monthMap = new Map<number, YearPlanEntry[]>();

  for (const entry of yearEntries) {
    const month = getMonthFromDate(entry.date);

    if (!month) {
      continue;
    }

    const current = monthMap.get(month) ?? [];
    current.push(entry);
    monthMap.set(month, current);
  }

  const months = Array.from(monthMap.entries())
    .sort(([leftMonth], [rightMonth]) => leftMonth - rightMonth)
    .map(([month, monthEntries]) => ({
      key: getMonthKey(year, month),
      month,
      label: getMonthLabel(year, month),
      entries: sortEntries(monthEntries),
    }));

  return {
    year,
    title: `${year} Year Plan`,
    months,
  };
}

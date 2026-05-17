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

type MonthTarget = {
  year: number;
  month: number;
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

function buildMonthTargets(referenceDate: Date, monthOffsets: number[]) {
  const year = referenceDate.getFullYear();
  const baseMonth = referenceDate.getMonth() + 1;

  return monthOffsets.map((offset) => {
    const anchor = new Date(year, baseMonth - 1 + offset, 1);
    return {
      year: anchor.getFullYear(),
      month: anchor.getMonth() + 1,
    } satisfies MonthTarget;
  });
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
) {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
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

    const uniqueEntries = new Map<string, YearPlanEntry>();

    for (const movie of movies) {
      if (typeof movie?.movieNm !== "string" || !/^\d{8}$/.test(movie?.openDt ?? "")) {
        continue;
      }

      const openDate = `${movie.openDt.slice(0, 4)}-${movie.openDt.slice(4, 6)}-${movie.openDt.slice(6, 8)}`;
      const entry = {
        title: movie.movieNm,
        summary: null,
        type: "개봉",
        date: openDate,
        tmdbId: null,
        tmdbType: null,
      } satisfies YearPlanEntry;
      const key = `${entry.date}:${entry.title}`;

      if (!uniqueEntries.has(key)) {
        uniqueEntries.set(key, entry);
      }
    }

    return Array.from(uniqueEntries.values());
  },
  ["year-plan-kobis-releases-base"],
  { revalidate: 3600 },
);

async function enrichReleaseEntries(entries: YearPlanEntry[]) {
  return mapWithConcurrency(entries, 6, async (entry) => {
    const meta = await searchMovieMetaByTitleAndDate(entry.title, entry.date);

    return {
      ...entry,
      summary: meta.overview ?? entry.summary ?? null,
      tmdbId: meta.tmdbId,
      tmdbType: meta.tmdbId ? ("movie" as const) : null,
    } satisfies YearPlanEntry;
  });
}

const getCachedKobisReleaseEntriesByMonths = unstable_cache(
  async (year: number) => {
    return enrichReleaseEntries(await getCachedKobisReleaseEntries(year));
  },
  ["year-plan-kobis-releases-enriched"],
  { revalidate: 3600 },
);

export async function getLatestYearPlanPreview(referenceDate = new Date()): Promise<YearPlanPreview | null> {
  const year = referenceDate.getFullYear();
  const dbEntries = await getCachedAllYearPlanEntries();
  const monthTargets = buildMonthTargets(referenceDate, [-1, 0, 1]);

  const kobisEntriesByYear = new Map<number, YearPlanEntry[]>();
  const targetYears = Array.from(new Set(monthTargets.map((target) => target.year)));

  await Promise.all(
    targetYears.map(async (targetYear) => {
      kobisEntriesByYear.set(targetYear, await getCachedKobisReleaseEntries(targetYear));
    }),
  );

  const monthsWithPendingReleases = monthTargets
    .map(({ year: monthYear, month }) => {
      const dbMonthEntries = dbEntries.filter(
        (entry) => getYearFromDate(entry.date) === monthYear && getMonthFromDate(entry.date) === month,
      );
      const releaseMonthEntries = (kobisEntriesByYear.get(monthYear) ?? []).filter(
        (entry) => getMonthFromDate(entry.date) === month,
      );
      const monthEntries = sortEntries([...dbMonthEntries, ...releaseMonthEntries]).slice(0, 3);

      return {
        key: getMonthKey(monthYear, month),
        label: getMonthLabel(monthYear, month),
        entries: monthEntries,
      };
    })
    .filter((month) => month.entries.length > 0);

  if (!monthsWithPendingReleases.length) {
    return null;
  }

  const months = await Promise.all(
    monthsWithPendingReleases.map(async (month) => {
      const releaseEntries = month.entries.filter((entry) => entry.type === "개봉");
      const enrichedReleaseEntries = await enrichReleaseEntries(releaseEntries);
      const enrichedMap = new Map(enrichedReleaseEntries.map((entry) => [`${entry.date}:${entry.title}`, entry] as const));

      return {
        ...month,
        entries: month.entries.map((entry) => enrichedMap.get(`${entry.date}:${entry.title}`) ?? entry),
      };
    }),
  );

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
  const releaseEntries = await getCachedKobisReleaseEntriesByMonths(year);
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

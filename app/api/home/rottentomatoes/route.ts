import { NextResponse } from "next/server";
import { getRottenTomatoesScore } from "@/lib/open-api/rottentomatoes";
import { getMovieEnglishTitleById } from "@/lib/open-api/tmdb-server";
import { getHomeSectionsSeed, type HomeMovieCardSeed } from "@/lib/home/home-sections";

type RottenTomatoesUpdate = {
  id: string;
  englishTitle?: string | null;
  rottenTomatometer?: string | null;
  rottenPopcornmeter?: string | null;
  rottenTomatoesUrl?: string | null;
  rottenLine: string;
};

function formatRottenTomatoesLine(score: Awaited<ReturnType<typeof getRottenTomatoesScore>>) {
  if (!score?.tomatometer && !score?.popcornmeter) {
    return "";
  }

  const tomatometer = score?.tomatometer ?? "-";
  const popcornmeter = score?.popcornmeter ?? "-";

  return `🍅\u00A0${tomatometer} · 🍿\u00A0${popcornmeter}`;
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

async function enrichCard(card: HomeMovieCardSeed): Promise<RottenTomatoesUpdate> {
  const englishTitle = await getMovieEnglishTitleById(card.tmdbId, card.originalTitle, card.title);
  const rottenTomatoes = await getRottenTomatoesScore(englishTitle ?? card.title, card.year);

  return {
    id: card.id,
    englishTitle,
    rottenTomatometer: rottenTomatoes?.tomatometer ?? null,
    rottenPopcornmeter: rottenTomatoes?.popcornmeter ?? null,
    rottenTomatoesUrl: rottenTomatoes?.url ?? null,
    rottenLine: formatRottenTomatoesLine(rottenTomatoes),
  };
}

export async function GET() {
  try {
    const { boxOfficeCards, upcomingCards, topRatedCards } = await getHomeSectionsSeed();

    const [boxOfficeUpdates, upcomingUpdates, topRatedUpdates] = await Promise.all([
      mapWithConcurrency(boxOfficeCards, 4, enrichCard),
      mapWithConcurrency(upcomingCards, 4, enrichCard),
      mapWithConcurrency(topRatedCards, 4, enrichCard),
    ]);

    return NextResponse.json(
      { boxOfficeUpdates, upcomingUpdates, topRatedUpdates },
      { headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600" } },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { boxOfficeUpdates: [], upcomingUpdates: [], topRatedUpdates: [], error: "Failed to load Rotten Tomatoes data" },
      { status: 500 },
    );
  }
}

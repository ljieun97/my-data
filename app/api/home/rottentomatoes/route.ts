import { NextRequest, NextResponse } from "next/server"
import { getRottenTomatoesScore } from "@/lib/open-api/rottentomatoes"
import { getMovieEnglishTitleById } from "@/lib/open-api/tmdb-server"

type RottenTomatoesCardSeed = {
  id: string
  title: string
  year?: string
  tmdbId?: number | null
  englishTitle?: string | null
  originalTitle?: string | null
}

type RottenTomatoesRequest = {
  boxOfficeCards?: RottenTomatoesCardSeed[]
  upcomingCards?: RottenTomatoesCardSeed[]
  topRatedCards?: RottenTomatoesCardSeed[]
}

type RottenTomatoesUpdate = {
  id: string
  englishTitle?: string | null
  rottenTomatometer?: string | null
  rottenPopcornmeter?: string | null
  rottenTomatoesUrl?: string | null
}

function emptyUpdate(card: RottenTomatoesCardSeed): RottenTomatoesUpdate {
  return {
    id: card.id,
    englishTitle: card.englishTitle ?? card.originalTitle ?? card.title ?? null,
    rottenTomatometer: null,
    rottenPopcornmeter: null,
    rottenTomatoesUrl: null,
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
) {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      results[currentIndex] = await mapper(items[currentIndex], currentIndex)
    }
  })

  await Promise.all(workers)
  return results
}

async function enrichCard(card: RottenTomatoesCardSeed): Promise<RottenTomatoesUpdate> {
  try {
    const englishTitle = await getMovieEnglishTitleById(
      card.tmdbId,
      card.originalTitle ?? card.englishTitle,
      card.title,
    )
    const rottenTomatoes = await getRottenTomatoesScore(englishTitle ?? card.title, card.year)

    return {
      id: card.id,
      englishTitle,
      rottenTomatometer: rottenTomatoes?.tomatometer ?? null,
      rottenPopcornmeter: rottenTomatoes?.popcornmeter ?? null,
      rottenTomatoesUrl: rottenTomatoes?.url ?? null,
    }
  } catch (error) {
    console.error("Failed to enrich card with Rotten Tomatoes data", {
      cardId: card.id,
      title: card.title,
      tmdbId: card.tmdbId,
      error,
    })
    return emptyUpdate(card)
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as RottenTomatoesRequest
    const boxOfficeCards = Array.isArray(payload.boxOfficeCards) ? payload.boxOfficeCards : []
    const upcomingCards = Array.isArray(payload.upcomingCards) ? payload.upcomingCards : []
    const topRatedCards = Array.isArray(payload.topRatedCards) ? payload.topRatedCards : []

    const [boxOfficeUpdates, upcomingUpdates, topRatedUpdates] = await Promise.all([
      mapWithConcurrency(boxOfficeCards, 4, enrichCard),
      mapWithConcurrency(upcomingCards, 4, enrichCard),
      mapWithConcurrency(topRatedCards, 4, enrichCard),
    ])

    return NextResponse.json(
      { boxOfficeUpdates, upcomingUpdates, topRatedUpdates },
      { headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600" } },
    )
  } catch (error) {
    console.error("Failed to load Rotten Tomatoes data for home sections", error)
    return NextResponse.json(
      { boxOfficeUpdates: [], upcomingUpdates: [], topRatedUpdates: [], error: "Failed to load Rotten Tomatoes data" },
      { headers: { "Cache-Control": "no-store" } },
    )
  }
}

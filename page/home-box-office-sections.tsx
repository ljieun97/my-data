"use client"

import { useEffect, useState } from "react"
import CardSlider, { type HomeMovieCardItem } from "@/components/card-slider"

type HomeSectionsResponse = {
  boxOfficeCards: HomeMovieCardItem[]
  upcomingCards: HomeMovieCardItem[]
  topRatedCards: HomeMovieCardItem[]
}

type RottenTomatoesUpdate = {
  id: string
  englishTitle?: string | null
  rottenTomatometer?: string | null
  rottenPopcornmeter?: string | null
  rottenTomatoesUrl?: string | null
}

type RottenTomatoesResponse = {
  boxOfficeUpdates: RottenTomatoesUpdate[]
  upcomingUpdates: RottenTomatoesUpdate[]
  topRatedUpdates: RottenTomatoesUpdate[]
}

function applyRottenTomatoesUpdates(cards: HomeMovieCardItem[], updates: RottenTomatoesUpdate[]) {
  const updatesById = new Map(updates.map((item) => [item.id, item]))

  return cards.map((card) => {
    const update = updatesById.get(card.id)

    if (!update) {
      return card
    }

    return {
      ...card,
      englishTitle: update.englishTitle ?? card.englishTitle ?? null,
      rottenTomatometer: update.rottenTomatometer ?? null,
      rottenPopcornmeter: update.rottenPopcornmeter ?? null,
      rottenTomatoesUrl: update.rottenTomatoesUrl ?? null,
    }
  })
}

function buildRtRequestPayload(data: HomeSectionsResponse) {
  return {
    boxOfficeCards: data.boxOfficeCards.map((card) => ({
      id: card.id,
      title: card.title,
      year: card.year,
      tmdbId: card.tmdbId,
      englishTitle: card.englishTitle,
      originalTitle: card.originalTitle,
    })),
    upcomingCards: data.upcomingCards.map((card) => ({
      id: card.id,
      title: card.title,
      year: card.year,
      tmdbId: card.tmdbId,
      englishTitle: card.englishTitle,
      originalTitle: card.originalTitle,
    })),
    topRatedCards: data.topRatedCards.map((card) => ({
      id: card.id,
      title: card.title,
      year: card.year,
      tmdbId: card.tmdbId,
      englishTitle: card.englishTitle,
      originalTitle: card.originalTitle,
    })),
  }
}

export default function HomeBoxOfficeSections({
  initialData,
}: {
  initialData: HomeSectionsResponse
}) {
  const [data, setData] = useState<HomeSectionsResponse>(initialData)
  const [error] = useState(false)
  const [isRtLoading, setIsRtLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadRottenTomatoes = async () => {
      try {
        const response = await fetch("/api/home/rottentomatoes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify(buildRtRequestPayload(initialData)),
        })

        if (!response.ok) {
          throw new Error(`Failed to load Rotten Tomatoes sections: ${response.status}`)
        }

        const payload = (await response.json()) as RottenTomatoesResponse

        if (!cancelled) {
          setData((prev) => ({
            boxOfficeCards: applyRottenTomatoesUpdates(prev.boxOfficeCards, payload.boxOfficeUpdates),
            upcomingCards: applyRottenTomatoesUpdates(prev.upcomingCards, payload.upcomingUpdates),
            topRatedCards: applyRottenTomatoesUpdates(prev.topRatedCards, payload.topRatedUpdates),
          }))
        }
      } catch (loadError) {
        console.error(loadError)
      } finally {
        if (!cancelled) {
          setIsRtLoading(false)
        }
      }
    }

    loadRottenTomatoes()

    return () => {
      cancelled = true
    }
  }, [initialData])

  return (
    <div className="flex flex-col gap-12">
      <CardSlider
        title="박스오피스 순위"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data.boxOfficeCards}
        isScoreLoading={isRtLoading}
      />
      <CardSlider
        title="개봉예정작"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data.upcomingCards}
        isScoreLoading={isRtLoading}
        showRank={false}
        desktopPageSize={7}
        desktopVisibleSlots={7.3}
      />
      <CardSlider
        title="인기 영화"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data.topRatedCards}
        isScoreLoading={isRtLoading}
        showRank={false}
        desktopPageSize={7}
        desktopVisibleSlots={7.3}
      />
    </div>
  )
}

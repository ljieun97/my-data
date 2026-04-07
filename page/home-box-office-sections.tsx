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
  rottenLine: string
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

export default function HomeBoxOfficeSections() {
  const [data, setData] = useState<HomeSectionsResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch("/api/home", { cache: "no-store" })

        if (!response.ok) {
          throw new Error(`Failed to load home sections: ${response.status}`)
        }

        const payload = (await response.json()) as HomeSectionsResponse

        if (!cancelled) {
          setData(payload)
          setError(false)
        }
      } catch (loadError) {
        console.error(loadError)
        if (!cancelled) {
          setError(true)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!data) {
      return
    }

    let cancelled = false

    const loadRottenTomatoes = async () => {
      try {
        const response = await fetch("/api/home/rottentomatoes", { cache: "no-store" })

        if (!response.ok) {
          throw new Error(`Failed to load Rotten Tomatoes sections: ${response.status}`)
        }

        const payload = (await response.json()) as RottenTomatoesResponse

        if (!cancelled) {
          setData((prev) => {
            if (!prev) {
              return prev
            }

            return {
              boxOfficeCards: applyRottenTomatoesUpdates(prev.boxOfficeCards, payload.boxOfficeUpdates),
              upcomingCards: applyRottenTomatoesUpdates(prev.upcomingCards, payload.upcomingUpdates),
              topRatedCards: applyRottenTomatoesUpdates(prev.topRatedCards, payload.topRatedUpdates),
            }
          })
        }
      } catch (loadError) {
        console.error(loadError)
      }
    }

    loadRottenTomatoes()

    return () => {
      cancelled = true
    }
  }, [data?.boxOfficeCards.length, data?.upcomingCards.length, data?.topRatedCards.length])

  return (
    <div className="flex flex-col gap-12">
      <CardSlider
        title="박스오피스 순위"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data?.boxOfficeCards}
        isLoading={!data && !error}
      />
      <CardSlider
        title="개봉예정작"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data?.upcomingCards}
        showRank={false}
        isLoading={!data && !error}
        desktopPageSize={7}
        desktopVisibleSlots={7.3}
      />
      <CardSlider
        title="인기 영화"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data?.topRatedCards}
        showRank={false}
        isLoading={!data && !error}
        desktopPageSize={7}
        desktopVisibleSlots={7.3}
      />
    </div>
  )
}

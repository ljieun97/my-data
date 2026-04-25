"use client"

import { useEffect, useState } from "react"
import MediaSlider, { type MediaSliderItem } from "@/components/media/media-slider"
import { useUser } from "@/context/UserContext"

type HomeSectionsResponse = {
  boxOfficeCards: MediaSliderItem[]
  upcomingCards: MediaSliderItem[]
  topRatedCards: MediaSliderItem[]
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

type UserRatingUpdate = {
  id: number
  rating: number
}

function applyRottenTomatoesUpdates(cards: MediaSliderItem[], updates: RottenTomatoesUpdate[]) {
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

function applyUserRatingUpdates(cards: MediaSliderItem[], ratingsByTmdbId: Map<number, number>) {
  return cards.map((card) => ({
    ...card,
    userRating: card.tmdbId ? ratingsByTmdbId.get(card.tmdbId) ?? null : null,
  }))
}

export default function HomeBoxOfficeSections({
  initialData,
}: {
  initialData: HomeSectionsResponse
}) {
  const { uid } = useUser()
  const [data, setData] = useState<HomeSectionsResponse>(initialData)
  const [error] = useState(false)
  const [isRtLoading, setIsRtLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setData(initialData)
    setIsRtLoading(true)

    const ids = uid
      ? Array.from(
          new Set(
            [initialData.boxOfficeCards, initialData.upcomingCards, initialData.topRatedCards]
              .flat()
              .map((card) => card.tmdbId)
              .filter((tmdbId): tmdbId is number => Number.isFinite(tmdbId)),
          ),
        )
      : []

    const loadUserRatings = async () => {
      if (!uid || !ids.length) {
        return
      }

      try {
        const ratingsResponse = await fetch("/api/mypage/ratings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: uid,
          },
          body: JSON.stringify({ ids }),
        })

        const ratingsPayload = ratingsResponse.ok ? ((await ratingsResponse.json()) as UserRatingUpdate[]) : []
        const ratingsByTmdbId = new Map(
          ratingsPayload
            .filter((item) => Number.isFinite(item.id) && Number.isFinite(item.rating) && item.rating > 0)
            .map((item) => [item.id, item.rating]),
        )

        if (!cancelled) {
          setData((currentData) => ({
            boxOfficeCards: applyUserRatingUpdates(currentData.boxOfficeCards, ratingsByTmdbId),
            upcomingCards: applyUserRatingUpdates(currentData.upcomingCards, ratingsByTmdbId),
            topRatedCards: applyUserRatingUpdates(currentData.topRatedCards, ratingsByTmdbId),
          }))
        }
      } catch (loadError) {
        console.error(loadError)
      }
    }

    const loadRottenTomatoes = async () => {
      try {
        const rtResponse = await fetch("/api/home/rottentomatoes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify(buildRtRequestPayload(initialData)),
        })

        if (!rtResponse.ok) {
          throw new Error(`Failed to load Rotten Tomatoes sections: ${rtResponse.status}`)
        }

        const rtPayload = (await rtResponse.json()) as RottenTomatoesResponse

        if (!cancelled) {
          setData((currentData) => ({
            boxOfficeCards: applyRottenTomatoesUpdates(currentData.boxOfficeCards, rtPayload.boxOfficeUpdates),
            upcomingCards: applyRottenTomatoesUpdates(currentData.upcomingCards, rtPayload.upcomingUpdates),
            topRatedCards: applyRottenTomatoesUpdates(currentData.topRatedCards, rtPayload.topRatedUpdates),
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

    void loadUserRatings()
    void loadRottenTomatoes()

    return () => {
      cancelled = true
    }
  }, [initialData, uid])

  return (
    <div className="flex flex-col gap-14">
      <MediaSlider
        title="박스오피스 순위"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data.boxOfficeCards}
        showYear={false}
        isScoreLoading={isRtLoading}
      />
      <MediaSlider
        title="개봉예정작"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data.upcomingCards}
        isScoreLoading={isRtLoading}
        showRank={false}
        showDetail
        showYear={false}
      />
      <MediaSlider
        title="인기 영화"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data.topRatedCards}
        isScoreLoading={isRtLoading}
        showRank={false}
        showDetail
        showYear={false}
      />
    </div>
  )
}

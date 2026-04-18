"use client"

import { useEffect, useState } from "react"
import CardSlider, { type HomeMovieCardItem } from "@/components/card-slider"
import { useUser } from "@/context/UserContext"

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

type UserRatingUpdate = {
  id: number
  rating: number
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

function applyUserRatingUpdates(cards: HomeMovieCardItem[], ratingsByTmdbId: Map<number, number>) {
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

    const loadHomeCardMeta = async () => {
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

      try {
        const [rtResponse, ratingsResponse] = await Promise.all([
          fetch("/api/home/rottentomatoes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify(buildRtRequestPayload(initialData)),
          }),
          uid && ids.length
            ? fetch("/api/mypage/ratings", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: uid,
                },
                body: JSON.stringify({ ids }),
              })
            : Promise.resolve(null),
        ])

        if (!rtResponse.ok) {
          throw new Error(`Failed to load Rotten Tomatoes sections: ${rtResponse.status}`)
        }

        const rtPayload = (await rtResponse.json()) as RottenTomatoesResponse
        const ratingsPayload = ratingsResponse?.ok ? ((await ratingsResponse.json()) as UserRatingUpdate[]) : []
        const ratingsByTmdbId = new Map(
          ratingsPayload
            .filter((item) => Number.isFinite(item.id) && Number.isFinite(item.rating) && item.rating > 0)
            .map((item) => [item.id, item.rating]),
        )

        if (!cancelled) {
          setData({
            boxOfficeCards: applyUserRatingUpdates(
              applyRottenTomatoesUpdates(initialData.boxOfficeCards, rtPayload.boxOfficeUpdates),
              ratingsByTmdbId,
            ),
            upcomingCards: applyUserRatingUpdates(
              applyRottenTomatoesUpdates(initialData.upcomingCards, rtPayload.upcomingUpdates),
              ratingsByTmdbId,
            ),
            topRatedCards: applyUserRatingUpdates(
              applyRottenTomatoesUpdates(initialData.topRatedCards, rtPayload.topRatedUpdates),
              ratingsByTmdbId,
            ),
          })
        }
      } catch (loadError) {
        console.error(loadError)
      } finally {
        if (!cancelled) {
          setIsRtLoading(false)
        }
      }
    }

    void loadHomeCardMeta()

    return () => {
      cancelled = true
    }
  }, [initialData, uid])

  return (
    <div className="flex flex-col gap-10">
      <CardSlider
        title="박스오피스 순위"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data.boxOfficeCards}
        showYear={false}
        isScoreLoading={isRtLoading}
      />
      <CardSlider
        title="개봉예정작"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data.upcomingCards}
        isScoreLoading={isRtLoading}
        showRank={false}
        showDetail={false}
        imageType="backdrop"
      />
      <CardSlider
        title="인기 영화"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data.topRatedCards}
        isScoreLoading={isRtLoading}
        showRank={false}
        showDetail={false}
        imageType="backdrop"
      />
    </div>
  )
}

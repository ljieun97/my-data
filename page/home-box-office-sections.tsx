"use client"

import { useEffect, useState } from "react"
import { Spacer } from "@heroui/spacer"
import CardSlider, { type HomeMovieCardItem } from "@/components/card-slider"

type HomeSectionsResponse = {
  boxOfficeCards: HomeMovieCardItem[]
  upcomingCards: HomeMovieCardItem[]
  topRatedCards: HomeMovieCardItem[]
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

  return (
    <>
      <CardSlider
        title="박스오피스 순위"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={data?.boxOfficeCards}
        isLoading={!data && !error}
      />
      <Spacer y={12} />
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
    </>
  )
}

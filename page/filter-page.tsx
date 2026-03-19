"use client"

import { getFilterMovies } from "@/lib/open-api/tmdb-client"
import InfiniteImages from "../components/common/infinite-images"
import { RefObject, useEffect, useState } from "react"
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";
import SelectFilter from "../components/common/select-filter"
import Title from "../components/common/title"

export default function FilterPage({ type }: { type: string }) {
  const [totalContents, setTotalContents] = useState("")
  const [country, setCountries] = useState("")
  const [providers, setProviders] = useState("")
  const [genres, setGenres] = useState("")
  const [date, setDate] = useState("")

  const [hasMore, setHasMore] = useState(false)
  let list = useAsyncList({
    async load({ cursor }) {
      const { results, page, total_results } = await getFilterMovies(
        type,
        country,
        providers,
        date,
        genres,
        cursor ? cursor : 1
      )
      setTotalContents(total_results)
      setHasMore(true)

      return {
        items: results,
        cursor: page + 1,
      }
    }
  })

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: list.loadMore
  }) as unknown as RefObject<HTMLDivElement>[]

  useEffect(() => {
    list.reload()
  }, [country])

  useEffect(() => {
    list.reload()
  }, [date])

  useEffect(() => {
    list.reload()
  }, [providers])

  useEffect(() => {
    list.reload()
  }, [genres])

  const countryDatas = [
    { label: "Korea", value: "KR" },
    { label: "United States", value: "US" },
    { label: "United Kingdom", value: "GB" },
    { label: "Japan", value: "JP" },
  ]

  const flatformDatas = [
    { label: "Google Play", value: 3 },
    { label: "Naver", value: 96 },
    { label: "Netflix", value: 8 },
    { label: "Disney+", value: 337 },
    { label: "Prime Video", value: 119 },
    { label: "Apple TV", value: 350 },
    { label: "Watcha", value: 97 },
    { label: "Wavve", value: 356 },
    { label: "Laftel", value: 1883 },
  ]

  const genreDatas = [
    { value: 28, label: "Action" },
    { value: 12, label: "Adventure" },
    { value: 16, label: "Animation" },
    { value: 35, label: "Comedy" },
    { value: 80, label: "Crime" },
    { value: 99, label: "Documentary" },
    { value: 18, label: "Drama" },
    { value: 10751, label: "Family" },
    { value: 14, label: "Fantasy" },
    { value: 36, label: "History" },
    { value: 27, label: "Horror" },
    { value: 10402, label: "Music" },
    { value: 9648, label: "Mystery" },
    { value: 878, label: "Sci-Fi" },
    { value: 10770, label: "TV Movie" },
    { value: 53, label: "Thriller" },
    { value: 10752, label: "War" },
    { value: 37, label: "Western" }
  ]

  const yearDatas = []
  for (let i = 2025; i >= 1980; i--) {
    yearDatas.push({ label: `${i}`, value: i })
  }

  const onChangeSelect = (e: any, valueType: string) => {
    switch (valueType) {
      case "Year":
        setDate(e.target.value)
        break
      case "Country":
        setCountries(e.target.value)
        break
      case "Platform":
        setProviders(e.target.value)
        break
      case "Genre":
        setGenres(e.target.value)
        break
    }
  }

  return (
    <div className="content-panel">
      <Title
        title={type === "movie" ? "Movies" : "Series"}
        sub={totalContents ? `${Number(totalContents).toLocaleString()} results` : "Browse by year, platform, country, and genre."}
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SelectFilter type={"Year"} items={yearDatas} onChangeSelect={onChangeSelect} />
        <SelectFilter type={"Platform"} items={flatformDatas} onChangeSelect={onChangeSelect} />
        <SelectFilter type={"Country"} items={countryDatas} onChangeSelect={onChangeSelect} />
        <SelectFilter type={"Genre"} items={genreDatas} onChangeSelect={onChangeSelect} />
      </div>

      <div
        className="content-grid-shell overflow-auto rounded-[24px] border p-3"
        style={{ height: "calc(100vh - 280px)" }}
        ref={scrollerRef}
      >
        <InfiniteImages type="info" contents={list.items} />
        {hasMore ? <div className="flex w-full justify-center" ref={loaderRef}></div> : null}
      </div>
    </div>
  )
}

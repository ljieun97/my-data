"use client"

import { getFilterMovies } from "@/lib/open-api/tmdb-client"
import InfiniteImages from "@/components/common/infinite-images"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import SelectFilter from "@/components/common/select-filter"

type FilterResponse = {
  results?: any[]
  page?: number
  total_results?: number
  total_pages?: number
}

export default function FilterPage({
  type,
  initialData,
}: {
  type: string
  initialData?: FilterResponse
}) {
  const initialResults = Array.isArray(initialData?.results) ? initialData.results : []
  const initialPage = Number(initialData?.page ?? 1)
  const initialTotalResults = Number(initialData?.total_results ?? 0)
  const initialTotalPages = Number(initialData?.total_pages ?? 1)

  const [items, setItems] = useState<any[]>(initialResults)
  const [page, setPage] = useState(initialPage)
  const [totalContents, setTotalContents] = useState(initialTotalResults ? String(initialTotalResults) : "")
  const [country, setCountries] = useState("")
  const [providers, setProviders] = useState("")
  const [genres, setGenres] = useState("")
  const [date, setDate] = useState("")
  const [hasMore, setHasMore] = useState(initialPage < initialTotalPages)
  const [isInitialLoading, setIsInitialLoading] = useState(initialResults.length === 0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const isFirstFilterRun = useRef(true)

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    const data = await getFilterMovies(type, country, providers, date, genres, pageNum)
    const nextResults = Array.isArray(data.results) ? data.results : []
    const nextPage = Number(data.page ?? pageNum)
    const totalPages = Number(data.total_pages ?? nextPage)
    const totalResults = Number(data.total_results ?? 0)

    setItems((prev) => (append ? [...prev, ...nextResults] : nextResults))
    setPage(nextPage)
    setTotalContents(totalResults ? String(totalResults) : "0")
    setHasMore(nextPage < totalPages)
  }, [country, date, genres, providers, type])

  useEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false
      return
    }

    let cancelled = false

    const reload = async () => {
      setIsInitialLoading(true)
      try {
        await fetchPage(1, false)
      } finally {
        if (!cancelled) {
          setIsInitialLoading(false)
        }
      }
    }

    reload()

    return () => {
      cancelled = true
    }
  }, [country, date, fetchPage, genres, providers])

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isInitialLoading) {
      return
    }

    setIsLoadingMore(true)
    try {
      await fetchPage(page + 1, true)
    } finally {
      setIsLoadingMore(false)
    }
  }, [fetchPage, hasMore, isInitialLoading, isLoadingMore, page])

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: handleLoadMore
  }) as any

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

  const currentYear = new Date().getFullYear()
  const yearDatas = []
  for (let i = currentYear; i >= 1980; i--) {
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

  const activeFilters = useMemo(() => {
    const nextItems = [];
    if (date) nextItems.push(`Year ${date}`);
    if (providers) nextItems.push(`Platform ${providers}`);
    if (country) nextItems.push(`Country ${country}`);
    if (genres) nextItems.push(`Genre ${genres}`);
    return nextItems;
  }, [country, date, genres, providers]);

  const pageLabel = type === "movie" ? "Movies" : "Series";

  return (
    <div className="content-panel flex h-full min-h-0 flex-col">
      <section className="browse-header mb-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="home-title text-lg font-semibold tracking-[-0.05em]">{pageLabel}</h1>
          <div className="browse-header__meta flex flex-wrap items-center gap-3 text-sm">
            <span className="browse-header__stat">
              {totalContents ? Number(totalContents).toLocaleString() : "..."} results
            </span>
            <span className="browse-header__stat">
              {activeFilters.length} filters
            </span>
          </div>
        </div>

        <div className="browse-filter-row flex flex-wrap gap-2">
          <SelectFilter type={"Year"} items={yearDatas} value={date} onChangeSelect={onChangeSelect} />
          <SelectFilter type={"Platform"} items={flatformDatas} value={providers} onChangeSelect={onChangeSelect} />
          <SelectFilter type={"Country"} items={countryDatas} value={country} onChangeSelect={onChangeSelect} />
          <SelectFilter type={"Genre"} items={genreDatas} value={genres} onChangeSelect={onChangeSelect} />
        </div>
      </section>

      <section
        className="content-grid-shell browse-results min-h-0 flex-1 overflow-auto rounded-[28px] border p-4 pb-6 sm:p-5 sm:pb-7"
        ref={scrollerRef}
      >
        {isInitialLoading ? (
          <div className="filter-page-grid grid gap-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="aspect-[2/3] animate-pulse rounded-[24px] bg-slate-200/80 dark:bg-slate-800/70" />
            ))}
          </div>
        ) : (
          <InfiniteImages type="info" contents={items} />
        )}
        {hasMore ? <div className="flex w-full justify-center pt-4" ref={loaderRef}></div> : null}
      </section>
    </div>
  )
}

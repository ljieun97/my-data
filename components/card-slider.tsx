"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Flatrates from "@/components/contents/flatrates"

export type HomeMovieCardItem = {
  id: string
  title: string
  year?: string
  englishTitle?: string | null
  rank: string
  rankChangeLabel?: string
  rankChangeTone?: string
  tmdbId?: number | null
  posterPath?: string | null
  detailLine?: string
  subdetailLine?: string
  rottenTomatoesUrl?: string | null
  rottenTomatometer?: string | null
  rottenPopcornmeter?: string | null
}

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342"
const MAX_PAGE_SIZE = 5
const DESKTOP_VISIBLE_SLOTS = 5.22
const TABLET_VISIBLE_SLOTS = 4.12
const MOBILE_VISIBLE_SLOTS = 3.08
const DESKTOP_SIDE_PEEK_ITEMS = 0.12
const TABLET_SIDE_PEEK_ITEMS = 0.08
const MOBILE_SIDE_PEEK_ITEMS = 0.04
const SWIPE_THRESHOLD = 40

function RottenTomatoesBadges({
  tomatometer,
  popcornmeter,
}: {
  tomatometer?: string | null
  popcornmeter?: string | null
}) {
  if (!tomatometer && !popcornmeter) {
    return null
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <span className="home-score-chip whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold">
        {`🍅\u00A0${tomatometer ?? "-"}`}
      </span>
      <span className="home-score-chip whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold">
        {`🍿\u00A0${popcornmeter ?? "-"}`}
      </span>
    </div>
  )
}

export default function BoxOffice({
  title,
  emptyMessage,
  results,
  showRank = true,
  isLoading = false,
  desktopPageSize = MAX_PAGE_SIZE,
  desktopVisibleSlots = DESKTOP_VISIBLE_SLOTS,
}: {
  title: string
  emptyMessage?: string
  results?: HomeMovieCardItem[]
  showRank?: boolean
  isLoading?: boolean
  desktopPageSize?: number
  desktopVisibleSlots?: number
}) {
  const safeResults = Array.isArray(results) ? results : []
  const [pageSize, setPageSize] = useState(desktopPageSize)
  const [visibleSlots, setVisibleSlots] = useState(desktopVisibleSlots)
  const [startIndex, setStartIndex] = useState(0)
  const touchStartXRef = useRef<number | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [posterMidpoint, setPosterMidpoint] = useState(0)

  useEffect(() => {
    const updateVisibleItems = () => {
      if (window.innerWidth < 640) {
        setPageSize(3)
        setVisibleSlots(MOBILE_VISIBLE_SLOTS)
        return
      }

      if (window.innerWidth < 1024) {
        setPageSize(4)
        setVisibleSlots(TABLET_VISIBLE_SLOTS)
        return
      }

      setPageSize(desktopPageSize)
      setVisibleSlots(desktopVisibleSlots)
    }

    updateVisibleItems()
    window.addEventListener("resize", updateVisibleItems)

    return () => {
      window.removeEventListener("resize", updateVisibleItems)
    }
  }, [desktopPageSize, desktopVisibleSlots])

  useEffect(() => {
    const maxStartIndex = Math.max(0, safeResults.length - pageSize)
    setStartIndex((prev) => {
      const clamped = Math.min(prev, maxStartIndex)
      return Math.floor(clamped / pageSize) * pageSize
    })
  }, [safeResults.length, pageSize])

  useEffect(() => {
    const element = viewportRef.current

    if (!element) {
      return
    }

    const updatePosterMidpoint = () => {
      const viewportWidth = element.clientWidth
      const cardWidth = viewportWidth / visibleSlots
      const posterHeight = cardWidth * 1.5
      setPosterMidpoint(posterHeight / 2)
    }

    updatePosterMidpoint()

    const resizeObserver = new ResizeObserver(updatePosterMidpoint)
    resizeObserver.observe(element)
    window.addEventListener("resize", updatePosterMidpoint)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updatePosterMidpoint)
    }
  }, [visibleSlots])

  if (isLoading || !safeResults.length) {
    return (
      <section className="content-panel py-8">
        <div className="mx-auto max-w-7xl">
          <div className="page-shell min-h-[24rem]">
            <div className="flex min-h-[21rem] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                {isLoading ? (
                  <span
                    className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100"
                    aria-label="Loading"
                  />
                ) : null}
                <p className="home-copy text-sm">{emptyMessage ?? "No results available."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const maxStartIndex = Math.max(0, safeResults.length - pageSize)

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + pageSize, maxStartIndex))
  }

  const handlePrevious = () => {
    setStartIndex((prev) => Math.max(prev - pageSize, 0))
  }

  const canGoPrevious = startIndex > 0
  const canGoNext = startIndex + pageSize < safeResults.length
  const maxTranslateIndex = Math.max(0, safeResults.length - visibleSlots)
  const sidePeekItems =
    pageSize === 3
      ? MOBILE_SIDE_PEEK_ITEMS
      : pageSize === 4
        ? TABLET_SIDE_PEEK_ITEMS
        : DESKTOP_SIDE_PEEK_ITEMS
  const effectiveStartIndex =
    visibleSlots > pageSize && startIndex > 0
      ? Math.max(0, Math.min(startIndex - sidePeekItems, maxTranslateIndex))
      : startIndex
  const translatePercentage = (effectiveStartIndex * 100) / visibleSlots
  const isTouchSwipeEnabled = pageSize <= 4
  const buttonPositionStyle = posterMidpoint > 0 ? { top: `${posterMidpoint}px` } : undefined

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchSwipeEnabled) {
      return
    }

    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchSwipeEnabled || touchStartXRef.current === null) {
      return
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartXRef.current
    const deltaX = touchEndX - touchStartXRef.current
    touchStartXRef.current = null

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return
    }

    if (deltaX < 0) {
      handleNext()
      return
    }

    handlePrevious()
  }

  return (
    <section>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="home-title text-lg font-semibold tracking-[-0.05em]">
              {title}
            </h1>
          </div>
        </div>

        <div>
          <div className="relative">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              style={buttonPositionStyle}
              className="absolute -left-5 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300/80 bg-white/92 text-base font-semibold text-slate-900 shadow-md backdrop-blur transition hover:border-slate-400 hover:bg-white disabled:pointer-events-none disabled:opacity-0 dark:border-slate-700 dark:bg-slate-900/88 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-900"
              aria-label="Previous"
            >
              ‹
            </button>
            <div ref={viewportRef} className="overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <div
                className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateX(-${translatePercentage}%)` }}
              >
                {safeResults.map((movie) => (
                  <article
                    key={movie.id}
                    className="shrink-0 pr-3"
                    style={{ width: `${100 / visibleSlots}%` }}
                  >
                    <div className="flex min-w-0 flex-col">
                      <div className="relative mb-2 aspect-[2/3]">
                        {showRank ? (
                          <div className="absolute bottom-0 -left-2 z-10 lg:bottom-1 lg:-left-6">
                            <span className="text-6xl font-black italic leading-none tracking-[-0.08em] text-white drop-shadow-[0_3px_10px_rgba(15,23,42,0.85)] lg:text-7xl xl:text-8xl">
                              {movie.rank}
                            </span>
                          </div>
                        ) : null}
                        {showRank && movie.rankChangeLabel ? (
                          <div className="absolute bottom-2 right-2 z-10 lg:bottom-4 lg:right-3">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.04em] shadow-lg sm:px-3 sm:py-1.5 sm:text-xs ${movie.rankChangeTone ?? ""}`}>
                              {movie.rankChangeLabel}
                            </span>
                          </div>
                        ) : null}
                        {movie.tmdbId ? (
                          <div className="absolute right-2 top-2 z-10">
                            <Flatrates type="movie" provider={movie.tmdbId} />
                          </div>
                        ) : null}
                        <div className="relative h-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                          {movie.posterPath ? (
                            <Image
                              src={`${TMDB_POSTER_BASE_URL}${movie.posterPath}`}
                              alt={`${movie.title} poster`}
                              fill
                              sizes="(min-width: 1280px) 18vw, (min-width: 640px) 24vw, 33vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                              No poster
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col">
                        <p className="text-base font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-50">
                          {movie.title}
                        </p>
                        {movie.year ? (
                          <p className="browse-card__meta text-sm">
                            {movie.year}
                          </p>
                        ) : null}
                        <RottenTomatoesBadges
                          tomatometer={movie.rottenTomatometer}
                          popcornmeter={movie.rottenPopcornmeter}
                        />
                        {movie.detailLine ? (
                          <div className="mt-2 px-0">
                            <p className="browse-card__meta text-sm">
                              {movie.detailLine}
                            </p>
                            {movie.subdetailLine ? (
                              <p className="browse-card__meta mt-1 text-sm">
                                {movie.subdetailLine}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              style={buttonPositionStyle}
              className="absolute -right-5 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300/80 bg-white/92 text-base font-semibold text-slate-900 shadow-md backdrop-blur transition hover:border-slate-400 hover:bg-white disabled:pointer-events-none disabled:opacity-0 dark:border-slate-700 dark:bg-slate-900/88 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-900"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

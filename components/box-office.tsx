"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Flatrates from "@/components/contents/flatrates"

export type HomeMovieCardItem = {
  id: string
  title: string
  year?: string
  rank: string
  rankChangeLabel?: string
  rankChangeTone?: string
  tmdbId?: number | null
  posterPath?: string | null
  detailLine?: string
  subdetailLine?: string
}

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342"
const MAX_VISIBLE_ITEMS = 5

export default function BoxOffice({
  title,
  subtitle,
  emptyMessage,
  results,
}: {
  title: string
  subtitle: string
  emptyMessage?: string
  results?: HomeMovieCardItem[]
}) {
  const safeResults = Array.isArray(results) ? results : []
  const [visibleItems, setVisibleItems] = useState(MAX_VISIBLE_ITEMS)
  const [startIndex, setStartIndex] = useState(0)

  useEffect(() => {
    const updateVisibleItems = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(3)
        return
      }

      if (window.innerWidth < 1024) {
        setVisibleItems(4)
        return
      }

      setVisibleItems(MAX_VISIBLE_ITEMS)
    }

    updateVisibleItems()
    window.addEventListener("resize", updateVisibleItems)

    return () => {
      window.removeEventListener("resize", updateVisibleItems)
    }
  }, [])

  useEffect(() => {
    const maxStartIndex = Math.max(0, safeResults.length - visibleItems)
    setStartIndex((prev) => {
      const clamped = Math.min(prev, maxStartIndex)
      return Math.floor(clamped / visibleItems) * visibleItems
    })
  }, [safeResults.length, visibleItems])

  if (!safeResults.length) {
    return (
      <section className="content-panel py-8">
        <div className="mx-auto max-w-7xl">
          <div className="page-shell">
            <p className="home-copy text-sm">{emptyMessage ?? "No results available."}</p>
          </div>
        </div>
      </section>
    )
  }

  const maxStartIndex = Math.max(0, safeResults.length - visibleItems)

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + visibleItems, maxStartIndex))
  }

  const handlePrevious = () => {
    setStartIndex((prev) => Math.max(prev - visibleItems, 0))
  }

  const canGoPrevious = startIndex > 0
  const canGoNext = startIndex + visibleItems < safeResults.length
  const translatePercentage = (startIndex * 100) / visibleItems

  return (
    <section>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="home-title text-2xl font-semibold tracking-[-0.05em]">
              {title}
            </h1>
            <p className="home-copy mt-1 text-sm">
              {subtitle}
            </p>
          </div>
        </div>

        <div>
          <div className="relative">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className="absolute -left-5 top-40 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/80 bg-white/92 text-base font-semibold text-slate-900 shadow-md backdrop-blur transition hover:border-slate-400 hover:bg-white disabled:pointer-events-none disabled:opacity-0 dark:border-slate-700 dark:bg-slate-900/88 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-900"
              aria-label="Previous"
            >
              ‹
            </button>
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateX(-${translatePercentage}%)` }}
              >
                {safeResults.map((movie) => (
                  <article
                    key={movie.id}
                    className="shrink-0 pr-4"
                    style={{ width: `${100 / visibleItems}%` }}
                  >
                    <div className="flex min-w-0 flex-col">
                      <div className="relative mb-2 aspect-[2/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                        <div className="absolute left-2 top-2 z-10 flex items-center gap-2">
                          <div className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold tracking-[0.04em] text-slate-900 shadow-lg backdrop-blur dark:bg-slate-900/80 dark:text-slate-100">
                            {movie.rank}
                          </div>
                          {movie.rankChangeLabel ? (
                            <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold tracking-[0.04em] shadow-lg ${movie.rankChangeTone ?? ""}`}>
                              {movie.rankChangeLabel}
                            </span>
                          ) : null}
                        </div>
                        {movie.tmdbId ? (
                          <div className="absolute right-2 top-2 z-10">
                            <Flatrates type="movie" provider={movie.tmdbId} />
                          </div>
                        ) : null}
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

                      <div className="flex flex-1 flex-col">
                        <p className="text-base font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-50">
                          {movie.title}
                        </p>
                        {movie.year ? (
                          <p className="browse-card__meta text-sm">
                            {movie.year}
                          </p>
                        ) : null}
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
              className="absolute -right-5 top-40 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/80 bg-white/92 text-base font-semibold text-slate-900 shadow-md backdrop-blur transition hover:border-slate-400 hover:bg-white disabled:pointer-events-none disabled:opacity-0 dark:border-slate-700 dark:bg-slate-900/88 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-900"
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

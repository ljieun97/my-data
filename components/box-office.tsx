'use client'

import { useState } from "react"

export default function BoxOffice({ results }: { results: any[] }) {
  const monthGroups = results.reduce((groups: Record<string, any[]>, movie: any) => {
    const openDt = String(movie.openDt ?? "")
    const monthKey = openDt.length >= 6 ? openDt.slice(0, 6) : "unknown"

    if (!groups[monthKey]) {
      groups[monthKey] = []
    }

    groups[monthKey].push(movie)
    return groups
  }, {})

  const formatMonthLabel = (monthKey: string) => {
    if (monthKey === "unknown") {
      return "Unknown month"
    }

    return `${monthKey.slice(0, 4)}.${monthKey.slice(4, 6)}`
  }

  const today = new Date()
  const todayKey = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`
  const currentMonthKey = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`
  const monthEntries = Object.entries(monthGroups) as [string, any[]][]
  const initialOpenMonth = monthGroups[currentMonthKey] ? currentMonthKey : monthEntries[0]?.[0] ?? ""
  const [openMonth, setOpenMonth] = useState(initialOpenMonth)

  return (
    <div className="flex flex-col gap-4">
      {monthEntries.map(([monthKey, movies]) => {
        const isOpen = openMonth === monthKey

        return (
          <section key={monthKey} className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setOpenMonth(isOpen ? "" : monthKey)}
              className="flex items-center justify-between rounded-lg border border-slate-200/70 px-3 py-2 text-left dark:border-slate-700/70"
            >
              <div className="flex items-center gap-2">
                <h2 className="shrink-0 text-base font-semibold tracking-[-0.03em]">
                  {formatMonthLabel(monthKey)}
                </h2>
                <span className="browse-card__stat rounded-full px-2 py-0.5 text-[10px] font-medium">
                  {movies.length}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isOpen ? "Hide" : "Show"}
              </span>
            </button>
            {isOpen && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {movies.map((movie: any) => {
                  const isPastRelease = /^\d{8}$/.test(String(movie.openDt)) && String(movie.openDt) < todayKey

                  return (
                    <div key={movie.movieCd} className="rounded-lg border border-slate-200/70 px-3 py-2 dark:border-slate-700/70">
                      <p className={`line-clamp-1 text-sm font-semibold ${isPastRelease ? "text-slate-400 dark:text-slate-500" : ""}`}>
                        {movie.movieNm}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {movie.openDt} | {movie.nationAlt} | {movie.genreAlt}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

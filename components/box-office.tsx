import Image from "next/image"

type Movie = {
  rnum?: string
  movieNm: string
  salesAmt?: string
  salesShare?: string
  salesAcc?: string
  audiAcc: string
  audiCnt: string
  openDt: string
  rank: string
  rankInten: string
  rankOldAndNew: string
  scrnCnt: string
  showCnt: string
  posterPath?: string | null
}

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342"

const numberFormatter = new Intl.NumberFormat("ko-KR")
const currencyFormatter = new Intl.NumberFormat("ko-KR")

const formatCount = (value?: string) => {
  const parsed = Number(value ?? 0)
  return `${numberFormatter.format(parsed)}명`
}

const formatCurrency = (value?: string) => {
  const parsed = Number(value ?? 0)
  return `${currencyFormatter.format(parsed)}원`
}

const formatDate = (value?: string) => {
  if (!value) {
    return "개봉일 미정"
  }

  const [year, month, day] = value.split("-")
  if (!year || !month || !day) {
    return value
  }

  return `${year}.${month}.${day}`
}

const rankChangeLabel = (movie: Movie) => {
  const change = Number(movie.rankInten ?? 0)

  if (movie.rankOldAndNew === "NEW") {
    return { label: "NEW", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" }
  }

  if (change > 0) {
    return { label: `▲ ${change}`, tone: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" }
  }

  if (change < 0) {
    return { label: `▼ ${Math.abs(change)}`, tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" }
  }

  return { label: "", tone: "" }
}

export default function BoxOffice({ results }: { results?: Movie[] }) {
  const safeResults = Array.isArray(results) ? results : []

  if (!safeResults.length) {
    return (
      <section className="content-panel py-8">
        <div className="mx-auto max-w-7xl">
          <div className="page-shell">
            <p className="home-copy text-sm">No box office results available.</p>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="">
      <div className="">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="browse-results__eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
                MOVIE
              </p>
              <h1 className="home-title text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Daily Box Office
              </h1>
              <p className="home-copy mt-2 text-sm">
                Audience, screens, show counts, and sales in one clean view.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="browse-card__stat rounded-full px-3 py-1 text-xs font-medium">
                {safeResults.length} titles
              </span>
              {safeResults[0]?.openDt && (
                <span className="browse-card__stat rounded-full px-3 py-1 text-xs font-medium">
                  Latest release: {formatDate(safeResults[0].openDt)}
                </span>
              )}
            </div>
          </div>

          <div className="browse-results overflow-hidden rounded-[28px] border">
            <div className="hidden grid-cols-[72px_minmax(0,1.4fr)_1fr_1fr] gap-3 border-b border-slate-200/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-slate-700/70 dark:text-slate-400 md:grid">
              <span>Rank</span>
              <span>Movie</span>
              <span>Audience</span>
              <span>Sales</span>
            </div>
            <div className="divide-y divide-slate-200/70 dark:divide-slate-700/70">
              {safeResults.map((movie) => {
                const rankChange = rankChangeLabel(movie)

                return (
                  <article
                    key={movie.movieNm + movie.rank}
                    className="grid gap-3 px-4 py-4 md:grid-cols-[72px_minmax(0,1.4fr)_1fr_1fr]"
                  >
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                        {movie.rank}
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${rankChange.tone}`}>
                        {rankChange.label}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex gap-4">
                        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                          {movie.posterPath ? (
                            <Image
                              src={`${TMDB_POSTER_BASE_URL}${movie.posterPath}`}
                              alt={`${movie.movieNm} poster`}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                              No poster
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-50">
                            {movie.movieNm}
                          </p>
                          <p className="browse-card__meta mt-1 text-sm">
                            개봉일 {formatDate(movie.openDt)}
                          </p>
                          <p className="browse-card__meta mt-1 text-sm">
                            예매율 {movie.salesShare ?? "0"}%
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                              스크린 {numberFormatter.format(Number(movie.scrnCnt ?? 0))}
                            </span>
                            <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                              상영 {numberFormatter.format(Number(movie.showCnt ?? 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:hidden">
                      <div className="flex flex-wrap gap-2">
                        <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                          관객 {formatCount(movie.audiCnt)}
                        </span>
                        <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                          매출 {formatCurrency(movie.salesAmt)}
                        </span>
                      </div>
                      <p className="browse-card__meta mt-2 text-sm">
                        누적 관객 {formatCount(movie.audiAcc)} · 누적 매출 {formatCurrency(movie.salesAcc)}
                      </p>
                    </div>

                    <div className="hidden md:block">
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                        {formatCount(movie.audiCnt)}
                      </p>
                      <p className="browse-card__meta mt-1 text-sm">
                        누적 {formatCount(movie.audiAcc)}
                      </p>
                    </div>

                    <div className="hidden md:block">
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                        {formatCurrency(movie.salesAmt)}
                      </p>
                      <p className="browse-card__meta mt-1 text-sm">
                        누적 {formatCurrency(movie.salesAcc)}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

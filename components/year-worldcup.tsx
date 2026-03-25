'use client'

import { useEffect, useState } from "react"

type Movie = {
  movieCd: string
  movieNm: string
  openDt?: string
  nationAlt?: string
  genreAlt?: string
}

type TmdbMovie = {
  id: number
  title: string
  release_date?: string
  original_language?: string
  genre_ids?: number[]
}

type WorldcupMovie = Movie | TmdbMovie

type NormalizedMovie = {
  id: string
  title: string
  openDate?: string
  nation?: string
  genre?: string
}

type SelectionHistory = {
  round: number
  winner: NormalizedMovie
  losers: NormalizedMovie[]
}

type TournamentState = {
  roundLabel: number
  roundSize: number
  currentRound: NormalizedMovie[]
  nextRound: NormalizedMovie[]
  winner: NormalizedMovie | null
  history: SelectionHistory[]
}

const genreLabelMap: Record<number, string> = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  37: "Western",
  53: "Thriller",
  80: "Crime",
  99: "Documentary",
  878: "Sci-Fi",
  9648: "Mystery",
  10402: "Music",
  10749: "Romance",
  10751: "Family",
  10752: "War",
}

const normalizeMovie = (movie: WorldcupMovie): NormalizedMovie => {
  if ("movieCd" in movie) {
    return {
      id: movie.movieCd,
      title: movie.movieNm,
      openDate: movie.openDt,
      nation: movie.nationAlt,
      genre: movie.genreAlt,
    }
  }

  return {
    id: String(movie.id),
    title: movie.title,
    openDate: movie.release_date,
    nation: movie.original_language?.toUpperCase(),
    genre: movie.genre_ids
      ?.map((genreId) => genreLabelMap[genreId])
      .filter(Boolean)
      .slice(0, 3)
      .join(", "),
  }
}

const shuffleMovies = (movies: NormalizedMovie[]) => {
  const shuffled = [...movies]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const temp = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = temp
  }

  return shuffled
}

const buildInitialState = (results: NormalizedMovie[]): TournamentState => ({
  roundLabel: results.length,
  roundSize: results.length,
  currentRound: results,
  nextRound: [],
  winner: null,
  history: [],
})

const normalizeTournament = (state: TournamentState): TournamentState => {
  let nextState = { ...state }

  while (true) {
    if (nextState.currentRound.length === 1 && nextState.nextRound.length === 0) {
        return {
          ...nextState,
          roundLabel: 1,
          roundSize: 1,
          winner: nextState.currentRound[0],
        }
    }

    if (nextState.currentRound.length === 0) {
      if (nextState.nextRound.length === 0) {
        return {
          ...nextState,
          roundLabel: 0,
          roundSize: 0,
          winner: null,
        }
      }

      if (nextState.nextRound.length === 1) {
        return {
          ...nextState,
          roundLabel: 1,
          roundSize: 1,
          currentRound: nextState.nextRound,
          nextRound: [],
          winner: nextState.nextRound[0],
        }
      }

      nextState = {
        ...nextState,
        roundLabel: nextState.nextRound.length,
        roundSize: nextState.nextRound.length,
        currentRound: nextState.nextRound,
        nextRound: [],
      }
      continue
    }

    if (nextState.currentRound.length === 1 && nextState.nextRound.length > 0) {
      nextState = {
        ...nextState,
        currentRound: [],
        nextRound: [...nextState.nextRound, nextState.currentRound[0]],
      }
      continue
    }

    return nextState
  }
}

const movieMeta = (movie: NormalizedMovie) => {
  return [movie.openDate, movie.nation, movie.genre].filter(Boolean).join(" | ")
}

export default function YearWorldcup({ title, results }: { title: string, results: WorldcupMovie[] }) {
  const [tournament, setTournament] = useState<TournamentState>(() => buildInitialState(results.map(normalizeMovie)))
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const normalizedResults = results.map(normalizeMovie)
    setTournament(normalizeTournament(buildInitialState(shuffleMovies(normalizedResults))))
    setIsReady(true)
  }, [results])

  const { currentRound, nextRound, winner, roundLabel, roundSize, history } = tournament
  const currentMatchup = currentRound.slice(0, Math.min(2, currentRound.length))
  const matchupCount = Math.max(1, Math.ceil(roundSize / 2))
  const currentMatch = Math.min(nextRound.length + 1, matchupCount || 1)

  const resetTournament = () => {
    const normalizedResults = results.map(normalizeMovie)
    setTournament(normalizeTournament(buildInitialState(shuffleMovies(normalizedResults))))
  }

  const advanceWinner = (selectedMovie: NormalizedMovie) => {
    if (currentMatchup.length < 2) {
      return
    }

    const losers = currentMatchup.filter((movie) => movie.id !== selectedMovie.id)

    setTournament((prev) =>
      normalizeTournament({
        ...prev,
        roundSize: prev.roundSize,
        currentRound: prev.currentRound.slice(currentMatchup.length),
        nextRound: [...prev.nextRound, selectedMovie],
        history: [...prev.history, { round: prev.roundLabel, winner: selectedMovie, losers }],
      })
    )
  }

  const skipMovie = (skippedMovie: NormalizedMovie) => {
    if (currentMatchup.length < 2) {
      return
    }

    const remainingMatchup = currentMatchup.filter((movie) => movie.id !== skippedMovie.id)

    setTournament((prev) => {
      const restOfRound = prev.currentRound.slice(currentMatchup.length)
      const skippedCount = currentMatchup.length - remainingMatchup.length

      return normalizeTournament({
        ...prev,
        roundSize: Math.max(prev.nextRound.length + remainingMatchup.length + restOfRound.length, prev.roundSize - skippedCount),
        currentRound: [...remainingMatchup, ...restOfRound],
      })
    })
  }

  const renderMovieCard = (movie: NormalizedMovie) => {
    return (
      <div
        key={movie.id}
        className="browse-card flex min-h-[220px] cursor-pointer flex-col justify-between rounded-[28px] border p-5 text-left"
        onClick={() => advanceWinner(movie)}
      >
        <div className="flex min-h-[132px] flex-col">
          <div className="flex items-start justify-between gap-3">
            <span className="browse-results__eyebrow text-xs font-semibold uppercase tracking-[0.22em]">
              Pick winner
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                skipMovie(movie)
              }}
              className="browse-card__action shrink-0 rounded-full px-3 py-1.5 text-xs font-medium"
            >
              Skip
            </button>
          </div>
          <div className="mt-4 flex-1">
            <h2 className="browse-card__title text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              {movie.title}
            </h2>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {movie.openDate && (
            <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
              {movie.openDate}
            </span>
          )}
          {movie.nation && (
            <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
              {movie.nation}
            </span>
          )}
          {movie.genre && (
            <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
              {movie.genre}
            </span>
          )}
        </div>
      </div>
    )
  }

  if (!results.length) {
    return (
      <section className="content-panel py-10">
        <p className="home-copy text-sm">No movies available for the tournament.</p>
      </section>
    )
  }

  if (!isReady) {
    return (
      <section className="content-panel py-10">
        <p className="home-copy text-sm">Preparing tournament...</p>
      </section>
    )
  }

  if (!currentRound.length && !winner) {
    return (
      <section className="content-panel py-10">
        <div className="page-shell mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
          <h1 className="home-title text-3xl font-semibold tracking-[-0.05em]">No candidates left</h1>
          <button
            type="button"
            onClick={resetTournament}
            className="rounded-full border border-slate-300/80 px-5 py-2 text-sm font-medium text-slate-800 transition hover:bg-white/80 dark:border-slate-700/80 dark:text-slate-100 dark:hover:bg-slate-900/70"
          >
            Start again
          </button>
        </div>
      </section>
    )
  }

  if (winner) {
    return (
      <section className="content-panel py-10">
        <div className="page-shell mx-auto flex max-w-5xl flex-col gap-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="browse-results__eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
              Year World Cup Winner
            </span>
            <h1 className="home-title text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {winner.title}
            </h1>
            <div className="flex flex-wrap justify-center gap-2">
              {winner.openDate && (
                <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                  {winner.openDate}
                </span>
              )}
              {winner.nation && (
                <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                  {winner.nation}
                </span>
              )}
              {winner.genre && (
                <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                  {winner.genre}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={resetTournament}
              className="rounded-full border border-slate-300/80 px-5 py-2 text-sm font-medium text-slate-800 transition hover:bg-white/80 dark:border-slate-700/80 dark:text-slate-100 dark:hover:bg-slate-900/70"
            >
              Start again
            </button>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-white/70 p-4 dark:border-slate-700/70 dark:bg-slate-950/40">
            <h2 className="home-title text-xl font-semibold tracking-[-0.04em]">Previous selections</h2>
            <div className="mt-4 flex flex-col gap-3">
              {history.map((entry, index) => (
                <div
                  key={`${entry.round}-${entry.winner.id}-${entry.losers.map((movie) => movie.id).join("-")}-${index}`}
                  className="rounded-2xl border border-slate-200/70 px-4 py-3 dark:border-slate-700/70"
                >
                  <p className="browse-results__eyebrow text-[11px] font-semibold uppercase tracking-[0.2em]">
                    Round of {entry.round}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {entry.winner.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    def. {entry.losers.map((movie) => movie.title).join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {movieMeta(entry.winner)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="content-panel py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="browse-results__eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
              Year World Cup
            </p>
            <h1 className="home-title text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              {title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="browse-card__stat rounded-full px-3 py-1 text-xs font-medium">
              Round of {roundLabel}
            </span>
            <span className="browse-card__stat rounded-full px-3 py-1 text-xs font-medium">
              Match {currentMatch}/{matchupCount}
            </span>
          </div>
        </div>

        <div className={`grid gap-4 ${currentMatchup.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-[1fr_auto_1fr] lg:items-stretch"}`}>
          {currentMatchup.length === 3 ? (
            currentMatchup.map((movie) => renderMovieCard(movie))
          ) : (
            <>
              {currentMatchup[0] ? renderMovieCard(currentMatchup[0]) : <div />}
              <div className="flex items-center justify-center">
                <span className="browse-header__stat text-sm uppercase tracking-[0.24em]">VS</span>
              </div>
              {currentMatchup[1] ? renderMovieCard(currentMatchup[1]) : <div />}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

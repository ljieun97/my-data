"use client";

import { useEffect, useMemo, useState } from "react";

type KobisMovie = {
  movieCd: string;
  movieNm: string;
  openDt: string;
  rank: string;
  rankOldAndNew: string;
};

type ShowtimeItem = {
  theater: string;
  brand: string;
  time: string;
  sourceQuery: string;
};

type MovieShowtime = {
  movieCd: string;
  movieNm: string;
  items: ShowtimeItem[];
  searchUrl: string;
  fetchedAt: string;
};

type PlannedItem = {
  id: string;
  movieCd: string;
  movieNm: string;
  theater: string;
  brand: string;
  time: string;
  date: string;
  sourceQuery: string;
};

type LoadState = {
  data?: MovieShowtime;
  error?: string;
  isLoading: boolean;
};

const STORAGE_KEY = "tovie-timetable-plans";

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function toDateInputValue(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function buildWeek(dateText: string) {
  const base = new Date(`${dateText}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(base);
    current.setDate(base.getDate() + index);
    return {
      key: toDateInputValue(current),
      label: formatDateLabel(current),
    };
  });
}

function groupShowtimes(items: ShowtimeItem[]) {
  const map = new Map<string, ShowtimeItem[]>();

  items.forEach((item) => {
    const current = map.get(item.theater) ?? [];
    current.push(item);
    map.set(item.theater, current);
  });

  return Array.from(map.entries()).map(([theater, values]) => ({
    theater,
    brand: values[0]?.brand ?? "",
    values: values.sort((a, b) => a.time.localeCompare(b.time)),
  }));
}

export default function TimetablePlanner() {
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [movies, setMovies] = useState<KobisMovie[]>([]);
  const [plans, setPlans] = useState<PlannedItem[]>([]);
  const [showtimeMap, setShowtimeMap] = useState<Record<string, LoadState>>({});
  const [isMoviesLoading, setIsMoviesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const week = useMemo(() => buildWeek(selectedDate), [selectedDate]);
  const plansByDate = useMemo(() => {
    return week.reduce<Record<string, PlannedItem[]>>((acc, day) => {
      acc[day.key] = plans
        .filter((item) => item.date === day.key)
        .sort((a, b) => a.time.localeCompare(b.time));
      return acc;
    }, {});
  }, [plans, week]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as PlannedItem[];
      setPlans(Array.isArray(parsed) ? parsed : []);
    } catch (storageError) {
      console.error(storageError);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    let ignore = false;

    async function loadMovies() {
      setIsMoviesLoading(true);
      setError(null);
      setShowtimeMap({});

      try {
        const response = await fetch(`/api/timetable/movies?date=${selectedDate}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch KOBIS movies.");
        }

        const data = (await response.json()) as { movies: KobisMovie[] };
        if (!ignore) {
          setMovies(data.movies);
        }
      } catch (fetchError) {
        console.error(fetchError);
        if (!ignore) {
          setMovies([]);
          setError("Could not load movies from KOBIS.");
        }
      } finally {
        if (!ignore) {
          setIsMoviesLoading(false);
        }
      }
    }

    loadMovies();

    return () => {
      ignore = true;
    };
  }, [selectedDate]);

  const loadMovieShowtimes = async (movie: KobisMovie) => {
    setShowtimeMap((current) => ({
      ...current,
      [movie.movieCd]: {
        ...current[movie.movieCd],
        isLoading: true,
        error: undefined,
      },
    }));

      try {
        const response = await fetch("/api/timetable/showtimes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          movie: {
            movieCd: movie.movieCd,
            movieNm: movie.movieNm,
          },
        }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || "Failed to fetch official showtimes.");
        }

      const data = (await response.json()) as { showtime: MovieShowtime };
      setShowtimeMap((current) => ({
        ...current,
        [movie.movieCd]: {
          data: data.showtime,
          isLoading: false,
        },
      }));
      } catch (fetchError) {
        console.error(fetchError);
        setShowtimeMap((current) => ({
          ...current,
          [movie.movieCd]: {
            ...current[movie.movieCd],
            error: fetchError instanceof Error ? fetchError.message : "Could not load official schedules for this movie.",
            isLoading: false,
          },
        }));
      }
  };

  const addPlan = (movie: MovieShowtime, item: ShowtimeItem) => {
    setPlans((current) => [
      ...current,
      {
        id: `${movie.movieCd}-${selectedDate}-${item.theater}-${item.time}-${Date.now()}`,
        movieCd: movie.movieCd,
        movieNm: movie.movieNm,
        theater: item.theater,
        brand: item.brand,
        time: item.time,
        date: selectedDate,
        sourceQuery: item.sourceQuery,
      },
    ]);
  };

  const removePlan = (id: string) => {
    setPlans((current) => current.filter((item) => item.id !== id));
  };

  const resetPlans = () => {
    setPlans([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/55">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/80 to-transparent" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-600 dark:text-amber-300">Timetable Planner</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Official booking timetables, loaded per movie.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Movies come from KOBIS first. After choosing a date, load each movie card to crawl official CGV, Lotte Cinema,
              and Megabox booking schedules for that day, then save what you want into the 7 day planner.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Date
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 shadow-sm outline-none transition focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
            <button
              type="button"
              onClick={resetPlans}
              className="min-h-12 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-400 dark:hover:text-rose-300"
            >
              Reset planner
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Movies</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isMoviesLoading ? "Loading KOBIS movies..." : `${movies.length} movies found for this date.`}
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex max-h-[58rem] flex-col gap-4 overflow-y-auto pr-1">
            {movies.map((movie) => {
              const state = showtimeMap[movie.movieCd];
              const loadedShowtime = state?.data;
              const grouped = loadedShowtime ? groupShowtimes(loadedShowtime.items) : [];

              return (
                <article
                  key={movie.movieCd}
                  className="rounded-[26px] border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-5 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">#{movie.rank}</div>
                      <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{movie.movieNm}</h3>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Open date: {movie.openDt || "-"}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadMovieShowtimes(movie)}
                      disabled={state?.isLoading}
                      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 hover:text-slate-950 disabled:cursor-default disabled:opacity-60 dark:bg-white dark:text-slate-950"
                    >
                      {state?.isLoading ? "Loading..." : loadedShowtime ? "Reload schedules" : "Load schedules"}
                    </button>
                  </div>

                  {state?.error ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                      {state.error}
                    </div>
                  ) : null}

                  {loadedShowtime ? (
                    <div className="mt-4">
                      <div className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                        Loaded from official booking pages at {new Date(loadedShowtime.fetchedAt).toLocaleTimeString("ko-KR")}
                      </div>

                      {grouped.length ? (
                        <div className="flex flex-col gap-3">
                          {grouped.map((group) => (
                            <div key={`${movie.movieCd}-${group.theater}`} className="rounded-2xl bg-slate-100/80 p-3 dark:bg-slate-900/80">
                              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                <span className="rounded-full bg-white px-2 py-1 text-xs dark:bg-slate-800">{group.brand}</span>
                                <span>{group.theater}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {group.values.map((item) => (
                                  <button
                                    key={`${movie.movieCd}-${group.theater}-${item.time}`}
                                    type="button"
                                    onClick={() => addPlan(loadedShowtime, item)}
                                    className="rounded-full bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-500 hover:text-slate-950 dark:bg-white dark:text-slate-950"
                                  >
                                    {item.time}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                          No official schedule entries were matched for this movie on the selected date.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      Load this card to scan official schedules from CGV, Lotte Cinema, and Megabox.
                    </div>
                  )}
                </article>
              );
            })}

            {!isMoviesLoading && !movies.length ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Nothing was available for the selected date.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">My Week</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Only the next 7 days are shown.</p>
            </div>
            <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
              {plans.length} saved
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {week.map((day) => {
              const items = plansByDate[day.key] ?? [];

              return (
                <div
                  key={day.key}
                  className="rounded-[24px] border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{day.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{day.key}</div>
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{items.length} items</div>
                  </div>

                  {items.length ? (
                    <div className="flex flex-col gap-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-3 rounded-2xl bg-slate-100 px-3 py-3 dark:bg-slate-900"
                        >
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.movieNm}</div>
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {item.theater} · {item.time}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePlan(item.id)}
                            className="rounded-full border border-transparent px-2 py-1 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:text-rose-600 dark:text-slate-300 dark:hover:border-rose-400/40 dark:hover:text-rose-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      No plans added here yet.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

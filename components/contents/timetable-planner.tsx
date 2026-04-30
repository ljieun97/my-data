"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type KobisMovie = {
  movieCd: string;
  movieNm: string;
};

type ShowtimeItem = {
  theater: string;
  brand: string;
  time: string;
  endTime: string;
  screen: string;
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
  endTime?: string;
  screen?: string;
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
    month: "numeric",
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

function sortShowtimes(items: ShowtimeItem[]) {
  return [...items].sort((a, b) => {
    if (a.time === b.time) {
      return a.theater.localeCompare(b.theater);
    }

    return a.time.localeCompare(b.time);
  });
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function getRange(item: { time: string; endTime?: string }) {
  const start = timeToMinutes(item.time);
  const end = item.endTime ? timeToMinutes(item.endTime) : null;

  if (start === null || end === null) {
    return null;
  }

  return {
    start,
    end: end <= start ? end + 24 * 60 : end,
  };
}

function rangesOverlap(a: { start: number; end: number }, b: { start: number; end: number }) {
  return a.start < b.end && b.start < a.end;
}

export default function TimetablePlanner() {
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [selectedMovieCd, setSelectedMovieCd] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [movies, setMovies] = useState<KobisMovie[]>([]);
  const [plans, setPlans] = useState<PlannedItem[]>([]);
  const [showtimeMap, setShowtimeMap] = useState<Record<string, LoadState>>({});

  const week = useMemo(() => buildWeek(selectedDate), [selectedDate]);
  const selectedMovie = useMemo(
    () => movies.find((movie) => movie.movieCd === selectedMovieCd) ?? null,
    [movies, selectedMovieCd],
  );
  const selectedState = selectedMovieCd ? showtimeMap[selectedMovieCd] : undefined;
  const selectedShowtimes = selectedState?.data ? sortShowtimes(selectedState.data.items) : [];
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
    setShowtimeMap({});
    setSelectedMovieCd(null);
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
        throw new Error(payload?.error || "상영시간을 못 가져왔어요.");
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
          error: fetchError instanceof Error ? fetchError.message : "상영시간을 못 가져왔어요.",
          isLoading: false,
        },
      }));
    }
  };

  const selectMovie = (movie: KobisMovie) => {
    if (selectedMovieCd === movie.movieCd) {
      setSelectedMovieCd(null);
      return;
    }

    setSelectedMovieCd(movie.movieCd);

    if (!showtimeMap[movie.movieCd]?.data && !showtimeMap[movie.movieCd]?.isLoading) {
      void loadMovieShowtimes(movie);
    }
  };

  const searchMovie = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const movieName = searchText.trim();
    if (!movieName) {
      return;
    }

    const movie = {
      movieCd: `search:${movieName}`,
      movieNm: movieName,
    };

    setMovies((current) => [movie, ...current.filter((item) => item.movieNm !== movie.movieNm)]);
    setSelectedMovieCd(movie.movieCd);
    void loadMovieShowtimes(movie);
  };

  const addPlan = (movie: MovieShowtime, item: ShowtimeItem) => {
    const existingPlan = getMatchingPlan(movie, item);
    if (existingPlan) {
      removePlan(existingPlan.id);
      return;
    }

    if (isOverlapping(item)) {
      return;
    }

    setPlans((current) => [
      ...current,
      {
        id: `${movie.movieCd}-${selectedDate}-${item.theater}-${item.screen}-${item.time}-${Date.now()}`,
        movieCd: movie.movieCd,
        movieNm: movie.movieNm,
        theater: item.theater,
        brand: item.brand,
        time: item.time,
        endTime: item.endTime,
        screen: item.screen,
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

  const getMatchingPlan = (movie: MovieShowtime, item: ShowtimeItem) => {
    return plans.find((plan) => {
      return (
        plan.date === selectedDate &&
        plan.movieCd === movie.movieCd &&
        plan.theater === item.theater &&
        (!plan.screen || plan.screen === item.screen) &&
        plan.time === item.time &&
        (!plan.endTime || plan.endTime === item.endTime)
      );
    });
  };

  const isOverlapping = (item: ShowtimeItem) => {
    const range = getRange(item);
    return Boolean(
      range &&
        plans.some((plan) => {
          if (plan.date !== selectedDate) {
            return false;
          }

          const planRange = getRange(plan);
          return Boolean(planRange && rangesOverlap(range, planRange));
        }),
    );
  };

  return (
    <div className="grid gap-4 pb-8 xl:grid-cols-[280px,1fr,360px]">
      <aside className="rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mb-3 flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="min-h-10 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={resetPlans}
            className="rounded-2xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300"
          >
            초기화
          </button>
        </div>

        <form onSubmit={searchMovie} className="mb-3 flex gap-2">
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="영화 검색"
            className="min-h-10 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="rounded-2xl bg-slate-950 px-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
          >
            검색
          </button>
        </form>

        <div className="flex max-h-[calc(100vh-230px)] flex-col gap-1 overflow-y-auto pr-1">
          {!movies.length ? <div className="px-3 py-8 text-center text-sm text-slate-500">검색해서 시작</div> : null}
          {movies.map((movie) => {
            const isSelected = movie.movieCd === selectedMovieCd;

            return (
              <button
                key={movie.movieCd}
                type="button"
                onClick={() => selectMovie(movie)}
                className={`rounded-2xl px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                }`}
              >
                <span className="font-semibold">{movie.movieNm}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mb-2 flex min-h-10 items-center justify-between gap-3 px-2">
          <h1 className="truncate text-lg font-semibold text-slate-950 dark:text-white">
            {selectedMovie?.movieNm ?? "영화 선택"}
          </h1>
          {selectedMovie ? (
            <button
              type="button"
              onClick={() => loadMovieShowtimes(selectedMovie)}
              disabled={selectedState?.isLoading}
              className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              {selectedState?.isLoading ? "조회중" : "새로고침"}
            </button>
          ) : null}
        </div>

        {selectedState?.error ? (
          <div className="mb-2 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{selectedState.error}</div>
        ) : null}

        <div className="flex max-h-[calc(100vh-190px)] flex-col gap-1 overflow-y-auto pr-1">
          {!selectedMovie ? <div className="px-3 py-10 text-center text-sm text-slate-500">왼쪽에서 영화 선택</div> : null}
          {selectedMovie && selectedState?.isLoading ? <div className="px-3 py-10 text-center text-sm text-slate-500">상영시간 조회중</div> : null}
          {selectedMovie && !selectedState?.isLoading && selectedState?.data && !selectedShowtimes.length ? (
            <div className="px-3 py-10 text-center text-sm text-slate-500">상영시간 없음</div>
          ) : null}
          {selectedState?.data
            ? selectedShowtimes.map((item) => {
                const isSelected = Boolean(getMatchingPlan(selectedState.data!, item));
                const isBlocked = !isSelected && isOverlapping(item);

                return (
                  <button
                    key={`${item.theater}-${item.screen}-${item.time}-${item.endTime}`}
                    type="button"
                    onClick={() => addPlan(selectedState.data!, item)}
                    disabled={isBlocked}
                    className={`grid grid-cols-[7.5rem,1fr,3.5rem] items-center rounded-2xl px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent ${
                      isSelected
                        ? "bg-amber-300 text-slate-950 hover:bg-amber-200 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
                        : "text-slate-800 hover:bg-amber-100 dark:text-slate-100 dark:hover:bg-amber-500/15"
                    }`}
                  >
                    <span className="font-semibold tabular-nums">
                      {item.time}
                      {item.endTime ? `~${item.endTime}` : ""}
                    </span>
                    <span className="truncate">
                      {item.theater}
                      {item.screen ? ` ${item.screen}` : ""}
                    </span>
                    <span className={`text-right text-xs ${isSelected ? "font-semibold text-slate-950" : "text-rose-500"}`}>
                      {isSelected ? "선택됨" : isBlocked ? "겹침" : ""}
                    </span>
                  </button>
                );
              })
            : null}
        </div>
      </main>

      <aside className="rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mb-2 flex min-h-10 items-center justify-between px-2">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">내 일정</h2>
          <span className="text-xs text-slate-500">{plans.length}</span>
        </div>

        <div className="flex max-h-[calc(100vh-190px)] flex-col gap-2 overflow-y-auto pr-1">
          {week.map((day) => {
            const items = plansByDate[day.key] ?? [];

            return (
              <div key={day.key} className="rounded-2xl bg-slate-50 p-2 dark:bg-slate-900/70">
                <div className="mb-1 flex items-center justify-between px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>{day.label}</span>
                  <span>{items.length}</span>
                </div>

                {items.length ? (
                  <div className="flex flex-col gap-1">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => removePlan(item.id)}
                        className="rounded-xl bg-white px-2 py-2 text-left text-xs text-slate-700 hover:text-rose-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:text-rose-300"
                      >
                        <span className="mr-2 font-semibold tabular-nums">
                          {item.time}
                          {item.endTime ? `~${item.endTime}` : ""}
                        </span>
                        <span className="font-semibold">{item.movieNm}</span>
                        <span className="ml-2 text-slate-400">
                          {item.theater}
                          {item.screen ? ` ${item.screen}` : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

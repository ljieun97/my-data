"use client";

import Title from "@/components/common/title";
import CalendarView from "@/components/contents/calendar-view";
import { CaptureMovie, CapturePerson, useCaptureContent } from "@/context/CaptureContentContext";
import { faDownload, faGripVertical, faRotateLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toPng } from "html-to-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function formatYear(movie: CaptureMovie) {
  return movie.release_date ? movie.release_date.slice(0, 4) : "";
}

function getBackdropUrl(movie?: CaptureMovie) {
  if (!movie?.backdrop_path) return "";
  return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
}

function getPosterUrl(movie?: CaptureMovie) {
  if (!movie?.poster_path) return "";
  return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
}

function getPosterThumbUrl(posterPath?: string) {
  if (!posterPath) return "";
  return `https://image.tmdb.org/t/p/w185${posterPath}`;
}

function getProfileUrl(profilePath?: string) {
  if (!profilePath) return "";
  return `https://image.tmdb.org/t/p/original${profilePath}`;
}

function toSafeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, "-").trim().replace(/\s+/g, " ");
}

function CaptureFooter({
  footerLeft,
  footerRight,
  borderless = false,
}: {
  footerLeft: string;
  footerRight: string;
  borderless?: boolean;
}) {
  return (
    <footer className={["mt-auto flex items-center justify-between pt-4 text-xs font-black text-white/82", borderless ? "" : "border-t border-white/40"].join(" ")}>
      <span className="text-[11px] uppercase tracking-[0.08em]">{footerLeft || "셰나코리아"}</span>
      <span>{footerRight || "@scena.kr"}</span>
    </footer>
  );
}

function MovieCaptureRow({
  movie,
  index,
}: {
  movie?: CaptureMovie;
  index: number;
}) {
  const backdropUrl = getBackdropUrl(movie);
  const noteMode = movie?.noteMode ?? "custom";
  const rottenValue =
    movie?.rottenTomatometer || movie?.rottenPopcornmeter
      ? `${movie?.rottenTomatometer ?? "00%"} ${movie?.rottenPopcornmeter ?? "-%"}`
      : "00% 00%";
  const noteValue = noteMode === "rotten" ? rottenValue : movie?.note ?? "";

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-900 text-white">
      {backdropUrl ? (
        <img
          alt=""
          src={backdropUrl}
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
          crossOrigin="anonymous"
        />
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.36)_28%,rgba(0,0,0,0.04)_58%,rgba(0,0,0,0.52)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0)_46%,rgba(0,0,0,0.22)_100%)]" />

      <div className="relative z-[1] flex h-full items-end gap-2 px-5 pb-4 pt-3">
        {/* <div className="flex w-8 shrink-0 items-baseline">
          <span className="text-xl font-black leading-tight text-white drop-shadow">
            {index + 1}위
          </span>
        </div> */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black leading-tight text-white drop-shadow">{movie?.title ?? "영화를 추가하세요"}</p>
        </div>
        {movie?.noteMode !== "custom" || movie?.note ? (
          <p className="max-w-[36%] shrink-0 text-right text-base font-black leading-tight text-white drop-shadow">
            {noteValue}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function MovieListTemplate({
  slots,
  footerLeft,
  footerRight,
}: {
  slots: Array<CaptureMovie | undefined>;
  footerLeft: string;
  footerRight: string;
}) {
  return (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex min-h-0 flex-1 flex-col bg-slate-950">
        {slots.map((movie, index) => (
          <MovieCaptureRow
            key={movie?.id ?? `preview-${index}`}
            movie={movie}
            index={index}
          />
        ))}
      </div>

      <div className="mx-7 mb-7">
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} borderless />
      </div>
    </div>
  );
}

function MovieCoverTemplate({
  slots,
  title,
  subtitle,
  layout,
  footerLeft,
  footerRight,
}: {
  slots: Array<CaptureMovie | undefined>;
  title: string;
  subtitle: string;
  layout: "stack" | "grid";
  footerLeft: string;
  footerRight: string;
}) {
  const movies = slots.filter(Boolean) as CaptureMovie[];
  const gridTemplateColumns =
    movies.length <= 2
      ? "repeat(2, minmax(0, 1fr))"
      : movies.length === 3
        ? "repeat(3, minmax(0, 1fr))"
        : movies.length === 4
          ? "repeat(2, minmax(0, 1fr))"
          : "repeat(3, minmax(0, 1fr))";
  const gridTemplateRows = `repeat(${movies.length || 1}, minmax(0, 1fr))`;
  const contentClass = "gap-0";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.02)_56%,rgba(0,0,0,0.72)_100%)]" />
      <div className="relative z-[0] flex-1 overflow-hidden">
        <div
          className={["grid h-full", contentClass].join(" ")}
          style={
            layout === "stack"
              ? { gridTemplateRows }
              : { gridTemplateColumns }
          }
        >
          {movies.map((movie, index) => {
            const posterUrl = layout === "grid" ? getPosterUrl(movie) || getBackdropUrl(movie) : getBackdropUrl(movie) || getPosterUrl(movie);

            return (
              <div key={movie.id} className="relative overflow-hidden bg-slate-900">
                {posterUrl ? (
                  <img
                    alt=""
                    src={posterUrl}
                    className={["h-full w-full object-cover", layout === "stack" ? "object-top" : "object-center"].join(" ")}
                    crossOrigin="anonymous"
                  />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.48)_100%)]" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[1] px-7 pb-7 pt-24">
        <p className="text-sm font-bold leading-tight text-white/78">{subtitle || "TOVIE MOVIE COVER"}</p>
        <h1 className="mt-2 break-keep text-4xl font-black leading-none text-white drop-shadow">
          {title || "영화 목록"}
        </h1>
        <div className="mt-7">
          <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
        </div>
      </div>
    </div>
  );
}

function SingleMovieTemplate({
  movie,
  footerLeft,
  footerRight,
}: {
  movie: CaptureMovie | undefined;
  footerLeft: string;
  footerRight: string;
}) {
  const posterUrl = getPosterUrl(movie);
  const title = movie?.singlePreviewTitle ?? movie?.title ?? "영화를 추가하세요";
  const subtitle = movie?.singlePreviewSubtitle ?? movie?.original_title ?? movie?.title ?? "설명 텍스트";
  const body = movie?.singlePreviewBody ?? "여기에 설명을 적어주세요.\n두 줄까지 표시됩니다.";
  const textPosition = movie?.singlePreviewTextPosition ?? "center";
  const showTitle = movie?.singlePreviewShowTitle ?? true;
  const showSubtitle = movie?.singlePreviewShowSubtitle ?? true;
  const showBody = movie?.singlePreviewShowBody ?? true;
  const subtitleValue =
    movie?.noteMode === "rotten"
      ? movie?.rottenTomatometer || movie?.rottenPopcornmeter
        ? `${movie.rottenTomatometer ?? "00%"} ${movie.rottenPopcornmeter ?? "-%"}`
        : "00% 00%"
      : movie?.note || subtitle;
  const titleLength = title.replace(/\s/g, "").length;
  const titleClass =
    titleLength >= 14
      ? "text-xl sm:text-2xl"
      : titleLength >= 7
        ? "text-2xl sm:text-[2.2rem]"
        : "text-4xl";
  const positionClass =
    textPosition === "top"
      ? "items-start pt-7"
      : textPosition === "bottom"
        ? "items-end pb-7"
        : "items-center";
  const subtitleClass = "text-sm font-bold leading-tight text-white/78";
  const bodyClass = "mt-2 whitespace-pre-line text-base font-medium leading-relaxed text-white/76";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-white">
      {posterUrl ? (
        <img alt="" src={posterUrl} className="absolute inset-0 h-full w-full object-cover object-center" crossOrigin="anonymous" />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.88)_100%)]" />
      <div className="absolute inset-0 z-[1] flex flex-col px-7 py-7">
        <div className={["flex flex-1", positionClass].join(" ")}>
          <div className="w-full max-w-[20rem] text-left">
            {showSubtitle ? <p className={["truncate", subtitleClass].join(" ")}>{subtitleValue || "설명 텍스트"}</p> : null}
            {showTitle ? (
              <div className="mt-2">
                <h1 className={["min-w-0 flex-1 break-keep font-black leading-none text-white drop-shadow", titleClass].join(" ")}>
                  {title || movie?.title || "영화를 추가하세요"}
                </h1>
              </div>
            ) : null}
            {showBody ? <p className={bodyClass}>{body || "여기에 설명을 적어주세요.\n두 줄까지 표시됩니다."}</p> : null}
          </div>
        </div>
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
      </div>
    </div>
  );
}

function PersonCoverTemplate({
  person,
  headline,
  kicker,
  footerLeft,
  footerRight,
}: {
  person: CapturePerson | null;
  headline: string;
  kicker: string;
  footerLeft: string;
  footerRight: string;
}) {
  const profileUrl = getProfileUrl(person?.profile_path);

  return (
    <div className="relative h-full overflow-hidden bg-slate-950 text-white">
      {profileUrl ? (
        <img
          alt=""
          src={profileUrl}
          className="absolute inset-0 h-full w-full object-cover object-center"
          crossOrigin="anonymous"
        />
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.05)_42%,rgba(0,0,0,0.82)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-[1] px-7 pb-7 pt-24">
        <p className="text-sm font-bold leading-tight text-white/78">{kicker || "TOVIE PERSON"}</p>
        <h1 className="mt-2 break-keep text-4xl font-black leading-none text-white drop-shadow">
          {headline || person?.name || "인물 이름"}
        </h1>
        <div className="mt-7">
          <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
        </div>
      </div>
    </div>
  );
}

function CalendarCoverTemplate({
  results,
  option,
  title,
  showTitle,
  footerLeft,
  footerRight,
}: {
  results: any[];
  option: any;
  title: string;
  showTitle: boolean;
  footerLeft: string;
  footerRight: string;
}) {
  return (
    <div className="relative w-full overflow-hidden bg-white text-slate-900">
      <CalendarView results={results} option={option} hideCaptureButton embedCalendarOnly />
      <div
        className={[
          "pointer-events-none absolute inset-x-0 bottom-0 z-[2] px-7 pb-7 pt-24 bg-gradient-to-t from-black/64 via-black/24 to-transparent",
          showTitle ? "from-black/78 via-black/46" : "",
        ].join(" ")}
      >
        {showTitle ? (
          <h2 className="mt-2 break-keep text-4xl font-black leading-none text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]">
            {title || "TOVIE CALENDAR"}
          </h2>
        ) : null}
        <div className="mt-7">
          <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} borderless={!showTitle} />
        </div>
      </div>
    </div>
  );
}

export default function ContentCapturePage() {
  const {
    captureMode,
    setCaptureMode,
    selectedMovies,
    selectedPerson,
    removeMovie,
    reorderMovie,
    updateMovieNote,
    updateMovieNoteMode,
    updateMoviePoster,
    updateMovieRottenScore,
    updateMovieSinglePreview,
    updatePersonProfilePath,
    clearMovies,
    clearPerson,
  } = useCaptureContent();
  const captureRef = useRef<HTMLDivElement | null>(null);
  const singleMovieCaptureRef = useRef<HTMLDivElement | null>(null);
  const movieCoverCaptureRef = useRef<HTMLDivElement | null>(null);
  const personCaptureRef = useRef<HTMLDivElement | null>(null);
  const calendarCaptureRef = useRef<HTMLDivElement | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const [personTitle, setPersonTitle] = useState("인물 이름");
  const [personSubtitle, setPersonSubtitle] = useState("관객수가 증명한 배우");
  const [movieCoverTitle, setMovieCoverTitle] = useState("영화 묶음");
  const [movieCoverSubtitle, setMovieCoverSubtitle] = useState("TOVIE MOVIE COVER");
  const [movieCoverLayout, setMovieCoverLayout] = useState<"stack" | "grid">("stack");
  const [footerLeft, setFooterLeft] = useState("셰나코리아");
  const [footerRight, setFooterRight] = useState("@scena.kr");
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewMovieIndex, setPreviewMovieIndex] = useState(0);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [didCopyText, setDidCopyText] = useState(false);
  const [loadingRottenIds, setLoadingRottenIds] = useState<Record<number, boolean>>({});
  const [calendarResults, setCalendarResults] = useState<any[]>([]);
  const [calendarOption, setCalendarOption] = useState<any>({ initialView: "dayGridMonth" });
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState("");
  const [calendarTitle, setCalendarTitle] = useState(`${new Date().getMonth() + 1}월 개봉 일정`);
  const [showCalendarTitle, setShowCalendarTitle] = useState(true);

  const isPersonMode = captureMode === "person-cover";
  const isMovieListMode = captureMode === "movie-list";
  const isMovieCoverMode = captureMode === "movie-cover";
  const isCalendarMode = captureMode === "calendar";
  const isMovieMode = isMovieListMode || isMovieCoverMode;
  const movieMinCount = isMovieCoverMode ? 2 : 3;
  const movieSlotCount = Math.min(Math.max(selectedMovies.length, movieMinCount), 5);
  const currentSingleMovie = selectedMovies[previewMovieIndex];

  useEffect(() => {
    if (selectedPerson?.name) {
      setPersonTitle(`${selectedPerson.name} 영화 TOP ${movieSlotCount}`);
    }
  }, [movieSlotCount, selectedPerson?.id, selectedPerson?.name]);

  useEffect(() => {
    if (!selectedMovies.length) {
      setPreviewMovieIndex(0);
      return;
    }

    setPreviewMovieIndex((current) => Math.min(current, selectedMovies.length - 1));
  }, [selectedMovies.length]);

  const requestRottenScore = useCallback(
    async (movie: CaptureMovie) => {
      if (loadingRottenIds[movie.id]) return;

      setLoadingRottenIds((current) => ({ ...current, [movie.id]: true }));

      try {
        const year = formatYear(movie);
        const params = new URLSearchParams({
          title: movie.title,
          originalTitle: movie.original_title || "",
          year,
        });

        const response = await fetch(`/api/rottentomatoes/movie/${movie.id}?${params.toString()}`);
        const payload = await response.json();

        updateMovieRottenScore(movie.id, {
          rottenTomatometer: payload?.rottenTomatometer ?? null,
          rottenPopcornmeter: payload?.rottenPopcornmeter ?? null,
          rottenTomatoesUrl: payload?.rottenTomatoesUrl ?? null,
        });
      } catch (error) {
        console.error("Failed to load Rotten Tomatoes score", error);
      } finally {
        setLoadingRottenIds((current) => ({ ...current, [movie.id]: false }));
      }
    },
    [loadingRottenIds, updateMovieRottenScore],
  );

  useEffect(() => {
    selectedMovies.forEach((movie) => {
      if (movie.noteMode === "rotten" && !movie.rottenTomatometer && !movie.rottenPopcornmeter) {
        void requestRottenScore(movie);
      }
    });
  }, [requestRottenScore, selectedMovies]);

  useEffect(() => {
    if (!isCalendarMode || calendarResults.length) return;

    const loadCalendarData = async () => {
      try {
        setIsCalendarLoading(true);
        setCalendarError("");
        const response = await fetch("/api/capture/calendar", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error("Failed to load calendar data");
        }

        setCalendarResults(Array.isArray(payload?.results) ? payload.results : []);
        if (payload?.option?.initialView) {
          setCalendarOption(payload.option);
        }
      } catch (error) {
        console.error("Failed to load calendar capture data", error);
        setCalendarError("달력 데이터를 불러오지 못했습니다.");
      } finally {
        setIsCalendarLoading(false);
      }
    };

    void loadCalendarData();
  }, [calendarResults.length, isCalendarMode]);

  const handleCapture = async () => {
    const targetRef = isCalendarMode
      ? calendarCaptureRef
      : isPersonMode
        ? personCaptureRef
        : isMovieCoverMode
          ? movieCoverCaptureRef
          : captureRef;
    if (!targetRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const dataUrl = await toPng(targetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: isCalendarMode ? "#ffffff" : "#111827",
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `tovie-${captureMode}-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadEachMovie = async () => {
    if (!isMovieListMode || !selectedMovies.length || isCapturing) return;

    try {
      setIsCapturing(true);

      for (let index = 0; index < selectedMovies.length; index += 1) {
        setPreviewMovieIndex(index);

        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

        if (!singleMovieCaptureRef.current) continue;

        const dataUrl = await toPng(singleMovieCaptureRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#111827",
        });

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `tovie-${toSafeFilename(selectedMovies[index]?.title || `movie-${index + 1}`)}-${new Date().toISOString().slice(0, 10)}.png`;
        link.click();

        await new Promise((resolve) => window.setTimeout(resolve, 120));
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const slots = Array.from({ length: movieSlotCount }, (_, index) => selectedMovies[index]);
  const movieTextForCopy = useMemo(
    () =>
      selectedMovies
        .map((movie, index) => {
          const year = formatYear(movie);
          return [`-`, movie.title, year ? `(${year})` : ""].filter(Boolean).join(" ");
        })
        .join("\n"),
    [selectedMovies],
  );
  const calendarTextForCopy = useMemo(() => {
    const groups = new Map<string, any[]>();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const getPriority = (item: any) => {
      if (item?.type === "공휴일") return 4;
      if (item?.type === "관리자") return 3;
      if (item?.type === "박스오피스") return 2;
      if (item?.type === "재개봉") return 1;
      return 0;
    };

    calendarResults.forEach((item: any) => {
      const type = String(item?.type ?? "");
      const title = String(item?.title ?? "");
      const isHoliday = type.includes("공휴일") || title.includes("공휴일") || type.includes("대체공휴일") || title.includes("대체공휴일");
      const isAdmin = type === "관리자";
      if (isHoliday || isAdmin) return;

      const dateKey = String(item?.release_date ?? item?.start ?? "").slice(0, 10);
      if (!dateKey) return;
      const date = new Date(`${dateKey}T00:00:00`);
      if (date.getFullYear() !== currentYear || date.getMonth() !== currentMonth) return;
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)?.push(item);
    });

    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, items]) => {
        const date = new Date(`${dateKey}T00:00:00`);
        const head = `${date.getMonth() + 1}/${date.getDate()} (${weekdays[date.getDay()]})`;
        const lines = items
          .sort((a, b) => {
            const pa = getPriority(a);
            const pb = getPriority(b);
            if (pa !== pb) return pb - pa;
            return String(a?.title ?? "").localeCompare(String(b?.title ?? ""), "ko");
          })
          .map((entry: any) => `- ${entry?.title}${entry?.type === "재개봉" ? " (재개봉)" : ""}`);
        return [head, ...lines].join("\n");
      })
      .join("\n\n");
  }, [calendarResults]);

  const updateCurrentSinglePreview = (
    patch: Partial<
      Pick<
        CaptureMovie,
        | "singlePreviewTitle"
        | "singlePreviewSubtitle"
        | "singlePreviewBody"
        | "singlePreviewTextPosition"
        | "singlePreviewShowTitle"
        | "singlePreviewShowSubtitle"
        | "singlePreviewShowBody"
      >
    >,
  ) => {
    if (!currentSingleMovie) return;
    updateMovieSinglePreview(currentSingleMovie.id, patch);
  };

  const handleCopyMovieText = async () => {
    if (!movieTextForCopy) return;

    await navigator.clipboard.writeText(movieTextForCopy);
    setDidCopyText(true);
    window.setTimeout(() => setDidCopyText(false), 1200);
  };
  const handleCopyCalendarText = async () => {
    if (!calendarTextForCopy) return;

    await navigator.clipboard.writeText(calendarTextForCopy);
    setDidCopyText(true);
    window.setTimeout(() => setDidCopyText(false), 1200);
  };

  const handleDragStart = (index: number) => {
    draggedIndexRef.current = index;
  };

  const handleDrop = (index: number) => {
    const fromIndex = draggedIndexRef.current;
    draggedIndexRef.current = null;
    setDragOverIndex(null);

    if (fromIndex === null) return;
    reorderMovie(fromIndex, index);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Title title="Capture" sub="Instagram content maker" />
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={isPersonMode ? clearPerson : clearMovies}
            disabled={isCalendarMode ? true : isPersonMode ? !selectedPerson : !selectedMovies.length}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Reset selected movies"
            title="Reset"
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={isCapturing || (isCalendarMode ? isCalendarLoading || !calendarResults.length : isPersonMode ? !selectedPerson : !selectedMovies.length)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 border border-slate-900 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-default disabled:opacity-45 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white sm:flex-none"
          >
            <FontAwesomeIcon icon={faDownload} />
            {isCapturing ? "capturing" : "download"}
          </button>
          {isMovieListMode ? (
            <button
              type="button"
              onClick={handleDownloadEachMovie}
              disabled={isCapturing || !selectedMovies.length}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 sm:flex-none"
            >
              <FontAwesomeIcon icon={faDownload} />
              개별
            </button>
          ) : null}
        </div>
      </div>

      <div className="inline-flex w-full border border-slate-200 bg-white/72 p-1 dark:border-slate-800 dark:bg-slate-950/70 sm:w-fit">
        {[
          { key: "person-cover", label: "Person Cover" },
          { key: "movie-cover", label: "Movie Cover" },
          { key: "movie-list", label: "Movie List" },
          { key: "calendar", label: "Calendar" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setCaptureMode(item.key as "movie-list" | "movie-cover" | "person-cover" | "calendar")}
            className={[
              "h-9 flex-1 px-4 text-sm font-bold transition sm:flex-none",
              captureMode === item.key
                ? "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4">
          {isCalendarMode ? (
          <>
            <div className="border border-slate-200 bg-white/72 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200">
              <p className="font-bold text-slate-900 dark:text-slate-100">Calendar Mode</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                달력 페이지 내용을 그대로 표시합니다. 상단 download 버튼으로 캡처하세요.
              </p>
              {isCalendarLoading ? <p className="mt-3 text-xs">불러오는 중...</p> : null}
              {calendarError ? <p className="mt-3 text-xs text-rose-500">{calendarError}</p> : null}
              {!isCalendarLoading && !calendarError ? (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  이벤트 {calendarResults.length}개
                </p>
              ) : null}
            </div>
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Cover Text</p>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                <input
                  value={calendarTitle}
                  onChange={(event) => setCalendarTitle(event.target.value)}
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowCalendarTitle((current) => !current)}
                className={[
                  "h-8 border px-2 text-xs font-bold transition",
                  showCalendarTitle
                    ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                ].join(" ")}
              >
                Title {showCalendarTitle ? "ON" : "OFF"}
              </button>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Footer left</span>
                  <input
                    value={footerLeft}
                    onChange={(event) => setFooterLeft(event.target.value)}
                    className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Footer right</span>
                  <input
                    value={footerRight}
                    onChange={(event) => setFooterRight(event.target.value)}
                    className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
              </div>
              <div className="mt-3 border border-slate-200 bg-white/72 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Copy Text</p>
                  <button
                    type="button"
                    onClick={handleCopyCalendarText}
                    disabled={!calendarTextForCopy}
                    className="h-8 border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {didCopyText ? "copied" : "copy"}
                  </button>
                </div>
                <pre className="min-h-24 whitespace-pre-wrap border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                  {calendarTextForCopy || "캘린더 데이터가 로드되면 복사용 텍스트가 표시됩니다."}
                </pre>
              </div>
            </div>
          </>
          ) : isMovieMode ? (
          <>
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Movies</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedMovies.length}/{movieSlotCount}</p>
            </div>
            <p className="mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              3개부터 시작해서 추가하면 4, 5개로 자동 확장됩니다.
            </p>

            <div className="flex flex-col gap-2">
              {slots.map((movie, index) => (
                <div
                  key={movie?.id ?? `slot-${index}`}
                  draggable={Boolean(movie)}
                  onDragStart={(event) => {
                    if (!movie) return;
                    handleDragStart(index);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", String(movie.id));
                  }}
                  onDragOver={(event) => {
                    if (!movie || draggedIndexRef.current === null) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setDragOverIndex(index);
                  }}
                  onDragLeave={() => {
                    setDragOverIndex((current) => (current === index ? null : current));
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (!movie) return;
                    handleDrop(index);
                  }}
                  onDragEnd={() => {
                    draggedIndexRef.current = null;
                    setDragOverIndex(null);
                  }}
                  className={[
                    "flex min-h-14 items-center gap-2 border bg-white px-2.5 py-2 transition dark:bg-slate-900/60 sm:px-3",
                    movie ? "cursor-grab active:cursor-grabbing" : "",
                    dragOverIndex === index
                      ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-slate-100 dark:ring-slate-100/20"
                      : "border-slate-200 dark:border-slate-800",
                  ].join(" ")}
                >
                  <span className="inline-flex h-8 w-5 shrink-0 items-center justify-center text-slate-300 dark:text-slate-600">
                    {movie ? <FontAwesomeIcon icon={faGripVertical} /> : null}
                  </span>
                  <span className="w-5 shrink-0 text-xs font-bold text-slate-400 sm:w-6">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{movie?.title ?? "빈 슬롯"}</p>
                    {movie && isMovieListMode ? (
                      <div className="mt-1 flex flex-col gap-1.5">
                        <select
                          value={movie.noteMode ?? "custom"}
                          onChange={(event) => {
                            const nextMode = event.target.value as "custom" | "rotten";
                            updateMovieNoteMode(movie.id, nextMode);
                            if (nextMode === "rotten" && !movie.rottenTomatometer && !movie.rottenPopcornmeter) {
                              void requestRottenScore(movie);
                            }
                          }}
                          onMouseDown={(event) => event.stopPropagation()}
                          className="h-7 w-full border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-slate-100"
                        >
                          <option value="custom">직접 입력</option>
                          <option value="rotten">로튼</option>
                        </select>
                        {movie.noteMode === "custom" ? (
                          <input
                            value={movie.note ?? ""}
                            onChange={(event) => updateMovieNote(movie.id, event.target.value)}
                            onMouseDown={(event) => event.stopPropagation()}
                            onDragStart={(event) => event.preventDefault()}
                            maxLength={16}
                            placeholder="오른쪽 문구"
                            className="h-7 w-full border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                          />
                        ) : (
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {movie.rottenTomatometer || movie.rottenPopcornmeter
                              ? `${movie.rottenTomatometer ?? "00%"} ${movie.rottenPopcornmeter ?? "-%"}`
                              : loadingRottenIds[movie.id]
                                ? "불러오는 중"
                                : "00% 00%"}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {movie ? "목록형 커버에서는 사진만 사용합니다" : "상단 검색으로 추가"}
                      </p>
                    )}
                  </div>
                  {movie ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => removeMovie(movie.id)}
                        className="inline-flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label={`${movie.title} remove`}
                        title="Remove"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {isMovieListMode ? (
            <>
              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Text</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Footer left</span>
                    <input
                      value={footerLeft}
                      onChange={(event) => setFooterLeft(event.target.value)}
                      className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Footer right</span>
                    <input
                      value={footerRight}
                      onChange={(event) => setFooterRight(event.target.value)}
                      className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                    />
                  </label>
                </div>
              </div>

              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Copy Text</p>
                  <button
                    type="button"
                    onClick={handleCopyMovieText}
                    disabled={!movieTextForCopy}
                    className="h-8 border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {didCopyText ? "copied" : "copy"}
                  </button>
                </div>
                <pre className="min-h-24 whitespace-pre-wrap border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                  {movieTextForCopy || "영화를 추가하면 복사용 텍스트가 표시됩니다."}
                </pre>
              </div>
            </>
          ) : null}
          {isMovieCoverMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Cover Text</p>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                <input
                  value={movieCoverTitle}
                  onChange={(event) => setMovieCoverTitle(event.target.value)}
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle</span>
                <input
                  value={movieCoverSubtitle}
                  onChange={(event) => setMovieCoverSubtitle(event.target.value)}
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <div className="mb-3">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Layout</span>
                <div className="inline-flex w-full border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                  {[
                    { key: "stack", label: "세로" },
                    { key: "grid", label: "가로" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setMovieCoverLayout(item.key as "stack" | "grid")}
                      className={[
                        "h-8 flex-1 text-xs font-bold transition",
                        movieCoverLayout === item.key
                          ? "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Footer left</span>
                  <input
                    value={footerLeft}
                    onChange={(event) => setFooterLeft(event.target.value)}
                    className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Footer right</span>
                  <input
                    value={footerRight}
                    onChange={(event) => setFooterRight(event.target.value)}
                    className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
              </div>
            </div>
          ) : null}
          {isMovieListMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Single Preview Text</p>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                <input
                  value={currentSingleMovie?.singlePreviewTitle ?? currentSingleMovie?.title ?? ""}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewTitle: event.target.value })}
                  placeholder={currentSingleMovie?.title ?? "제목"}
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle</span>
                <input
                  value={currentSingleMovie?.singlePreviewSubtitle ?? currentSingleMovie?.original_title ?? currentSingleMovie?.title ?? ""}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewSubtitle: event.target.value })}
                  placeholder="서브타이틀"
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Body</span>
                <textarea
                  value={currentSingleMovie?.singlePreviewBody ?? "여기에 설명을 적어주세요.\n두 줄까지 표시됩니다."}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewBody: event.target.value })}
                  rows={2}
                  className="min-h-20 w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    key: "title",
                    label: "Title",
                    checked: currentSingleMovie?.singlePreviewShowTitle ?? true,
                    setChecked: (next: boolean | ((current: boolean) => boolean)) => {
                      const current = currentSingleMovie?.singlePreviewShowTitle ?? true;
                      updateCurrentSinglePreview({ singlePreviewShowTitle: typeof next === "function" ? next(current) : next });
                    },
                  },
                  {
                    key: "subtitle",
                    label: "Subtitle",
                    checked: currentSingleMovie?.singlePreviewShowSubtitle ?? true,
                    setChecked: (next: boolean | ((current: boolean) => boolean)) => {
                      const current = currentSingleMovie?.singlePreviewShowSubtitle ?? true;
                      updateCurrentSinglePreview({ singlePreviewShowSubtitle: typeof next === "function" ? next(current) : next });
                    },
                  },
                  {
                    key: "body",
                    label: "Body",
                    checked: currentSingleMovie?.singlePreviewShowBody ?? true,
                    setChecked: (next: boolean | ((current: boolean) => boolean)) => {
                      const current = currentSingleMovie?.singlePreviewShowBody ?? true;
                      updateCurrentSinglePreview({ singlePreviewShowBody: typeof next === "function" ? next(current) : next });
                    },
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => item.setChecked((current) => !current)}
                    className={[
                      "h-8 border px-2 text-xs font-bold transition",
                      item.checked
                        ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                {[
                  { key: "top", label: "Top" },
                  { key: "center", label: "Center" },
                  { key: "bottom", label: "Bottom" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => updateCurrentSinglePreview({ singlePreviewTextPosition: item.key as "top" | "center" | "bottom" })}
                    className={[
                      "h-8 flex-1 border px-2 text-xs font-bold transition",
                      (currentSingleMovie?.singlePreviewTextPosition ?? "center") === item.key
                        ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          </>
          ) : (
            <>
              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Person</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedPerson ? "selected" : "empty"}</p>
                </div>
                <div className="flex items-center gap-3 border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                  {selectedPerson?.profile_path ? (
                    <img
                      alt=""
                      src={`https://image.tmdb.org/t/p/w185${selectedPerson.profile_path}`}
                      className="h-20 w-14 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="h-20 w-14 shrink-0 bg-slate-200 dark:bg-slate-800" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{selectedPerson?.name ?? "상단 검색으로 인물 선택"}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{selectedPerson?.known_for_department ?? "프로필 이미지를 선택할 수 있습니다"}</p>
                  </div>
                </div>

                {selectedPerson?.profileOptions?.length ? (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {selectedPerson.profileOptions.map((profilePath) => (
                      <button
                        key={profilePath}
                        type="button"
                        onClick={() => updatePersonProfilePath(profilePath)}
                        className={[
                          "aspect-[4/5] overflow-hidden border transition",
                          selectedPerson.profile_path === profilePath ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20" : "border-slate-200 dark:border-slate-800",
                        ].join(" ")}
                        aria-label="Select profile image"
                      >
                        <img alt="" src={`https://image.tmdb.org/t/p/w185${profilePath}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Cover Text</p>
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                  <input
                    value={personTitle}
                    onChange={(event) => setPersonTitle(event.target.value)}
                    className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle</span>
                  <input
                    value={personSubtitle}
                    onChange={(event) => setPersonSubtitle(event.target.value)}
                    className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Footer left</span>
                  <input
                    value={footerLeft}
                    onChange={(event) => setFooterLeft(event.target.value)}
                    className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Footer right</span>
                  <input
                    value={footerRight}
                    onChange={(event) => setFooterRight(event.target.value)}
                    className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[min(100%,390px)] sm:max-w-[420px]">
            <div
              ref={isCalendarMode ? calendarCaptureRef : captureMode === "person-cover" ? personCaptureRef : isMovieCoverMode ? movieCoverCaptureRef : captureRef}
              className={[
                isCalendarMode ? "aspect-[4/5] w-full overflow-hidden bg-white text-slate-900" : "aspect-[4/5] w-full overflow-hidden bg-slate-950 text-white",
                "shadow-[0_24px_64px_rgba(15,23,42,0.24)]",
              ].join(" ")}
            >
              {isCalendarMode ? (
                <CalendarCoverTemplate
                  results={calendarResults}
                  option={calendarOption}
                  title={calendarTitle}
                  showTitle={showCalendarTitle}
                  footerLeft={footerLeft}
                  footerRight={footerRight}
                />
              ) : captureMode === "person-cover" ? (
                <PersonCoverTemplate
                  person={selectedPerson}
                  headline={personTitle}
                  kicker={personSubtitle}
                  footerLeft={footerLeft}
                  footerRight={footerRight}
                />
              ) : isMovieCoverMode ? (
                <MovieCoverTemplate
                  slots={slots}
                  title={movieCoverTitle}
                  subtitle={movieCoverSubtitle}
                  layout={movieCoverLayout}
                  footerLeft={footerLeft}
                  footerRight={footerRight}
                />
              ) : (
              <MovieListTemplate
                slots={slots}
                footerLeft={footerLeft}
                footerRight={footerRight}
              />
              )}
            </div>
            {isMovieListMode ? (
              <div className="mt-4 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Single Preview</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {selectedMovies.length ? `${previewMovieIndex + 1}/${selectedMovies.length}` : "empty"}
                  </p>
                </div>

                {selectedMovies.length ? (
                  <>
                    <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                      {selectedMovies.map((movie, index) => (
                        <button
                          key={movie.id}
                          type="button"
                          onClick={() => setPreviewMovieIndex(index)}
                          className={[
                            "inline-flex h-8 min-w-8 items-center justify-center border px-2 text-xs font-bold transition",
                            previewMovieIndex === index
                              ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                          ].join(" ")}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <div className="aspect-[4/5] overflow-hidden bg-slate-950 text-white">
                      <div ref={singleMovieCaptureRef} className="h-full w-full">
                        <SingleMovieTemplate
                          movie={selectedMovies[previewMovieIndex]}
                          footerLeft={footerLeft}
                          footerRight={footerRight}
                        />
                      </div>
                    </div>

                    {selectedMovies[previewMovieIndex]?.posterOptions?.length ? (
                      <div className="mt-3 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Poster</p>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {selectedMovies[previewMovieIndex]?.posterOptions?.length ?? 0}
                          </p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                          {selectedMovies[previewMovieIndex]?.posterOptions?.map((posterPath) => (
                            <button
                              key={posterPath}
                              type="button"
                              onClick={() => updateMoviePoster(selectedMovies[previewMovieIndex].id, posterPath)}
                              className={[
                                "aspect-[4/5] overflow-hidden border transition",
                                selectedMovies[previewMovieIndex]?.poster_path === posterPath
                                  ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20"
                                  : "border-slate-200 dark:border-slate-800",
                              ].join(" ")}
                              aria-label="Select poster"
                            >
                              <img alt="" src={getPosterThumbUrl(posterPath)} className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                  </>
                ) : (
                  <div className="flex h-56 items-center justify-center border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    영화를 추가하면 개별 미리보기가 표시됩니다.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

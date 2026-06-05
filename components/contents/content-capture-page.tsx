"use client";

import Title from "@/components/common/title";
import { CalendarCaptureControls } from "@/components/contents/content-capture-calendar-controls";
import CalendarView from "@/components/contents/calendar-view";
import { MovieSlotsPanel } from "@/components/contents/content-capture-movie-controls";
import { CaptureMovie, CapturePerson, useCaptureContent } from "@/context/CaptureContentContext";
import { faDownload, faRotateLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toPng } from "html-to-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SyntheticEvent } from "react";

function formatYear(movie: CaptureMovie) {
  return movie.release_date ? movie.release_date.slice(0, 4) : "";
}

function isMovieContent(movie?: CaptureMovie) {
  return (movie?.media_type ?? "movie") === "movie";
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

function buildImageCandidates(...values: Array<string | undefined>) {
  return values.filter((value, index, list): value is string => Boolean(value) && list.indexOf(value) === index);
}

function handleImageFallback(event: SyntheticEvent<HTMLImageElement>, candidates: string[]) {
  const nextIndex = Number(event.currentTarget.dataset.fallbackIndex ?? "0") + 1;

  if (nextIndex >= candidates.length) {
    event.currentTarget.onerror = null;
    event.currentTarget.style.display = "none";
    return;
  }

  event.currentTarget.dataset.fallbackIndex = String(nextIndex);
  event.currentTarget.src = candidates[nextIndex];
}

function getCalendarPosterUrl(item: any) {
  const raw = String(item?.poster_path ?? item?.posterPath ?? item?.poster ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return `https://image.tmdb.org/t/p/w500${raw}`;
  return "";
}

function getCalendarBackdropUrl(item: any) {
  const raw = String(item?.backdrop_path ?? item?.backdropPath ?? item?.backdrop ?? item?.src ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return `https://image.tmdb.org/t/p/original${raw}`;
  return "";
}

function formatEnglishMonthBadge(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date).toUpperCase();
}

function formatEnglishDateBadge(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(date).toUpperCase();
}

function formatReleaseBoardDate(value: string) {
  return value.trim();
}

function getReleaseBoardAutoDate(movie?: CaptureMovie) {
  const rawDate = String(movie?.release_date ?? "").slice(0, 10);
  if (!rawDate) return "";

  const [year, month, day] = rawDate.split("-").map(Number);
  if (!year || !month || !day) return "";

  return `${month}/${day}`;
}

const RELEASE_BOARD_DEFAULT_COLORS = [
  "#b91c1c",
  "#315f90",
  "#374151",
  "#111827",
  "#d14d72",
  "#7c1d5a",
  "#caa13f",
  "#ea6b00",
];

function toSafeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, "-").trim().replace(/\s+/g, " ");
}

function CaptureFooter({
  footerRight,
}: {
  footerLeft: string;
  footerRight: string;
  borderless?: boolean;
}) {
  return (
    <footer className="pt-0.5 text-center">
      <span className="text-[10px] font-semibold tracking-[0.03em] text-white/92">{footerRight || "@scena.kr"}</span>
    </footer>
  );
}

function getDualPersonTitle(persons: CapturePerson[]) {
  if (!persons.length) return "인물 이름";
  if (persons.length === 1) return persons[0].name;
  return `${persons[0].name} & ${persons[1].name}`;
}

function MovieCaptureRow({
  movie,
  index,
}: {
  movie?: CaptureMovie;
  index: number;
}) {
  const imageCandidates = buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));
  const noteMode = movie?.noteMode ?? "custom";
  const rottenValue =
    movie?.rottenTomatometer || movie?.rottenPopcornmeter
      ? `${movie?.rottenTomatometer ?? "00%"} ${movie?.rottenPopcornmeter ?? "-%"}`
      : "00% 00%";
  const noteValue = noteMode === "rotten" ? rottenValue : movie?.note ?? "";

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-900 text-white">
      {imageCandidates[0] ? (
        <img
          alt=""
          src={imageCandidates[0]}
          data-fallback-index="0"
          onError={(event) => handleImageFallback(event, imageCandidates)}
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
          crossOrigin="anonymous"
        />
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.56)_0%,rgba(0,0,0,0.24)_28%,rgba(0,0,0,0.02)_58%,rgba(0,0,0,0.36)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0)_46%,rgba(0,0,0,0.14)_100%)]" />

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

      <div className="px-4 pb-1">
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.01)_56%,rgba(0,0,0,0.56)_100%)]" />
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
            const imageCandidates =
              layout === "grid"
                ? buildImageCandidates(getPosterUrl(movie), getBackdropUrl(movie))
                : buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));

            return (
              <div key={movie.id} className="relative overflow-hidden bg-slate-900">
                {imageCandidates[0] ? (
                  <img
                    alt=""
                    src={imageCandidates[0]}
                    data-fallback-index="0"
                    onError={(event) => handleImageFallback(event, imageCandidates)}
                    className={["h-full w-full object-cover", layout === "stack" ? "object-top" : "object-center"].join(" ")}
                    crossOrigin="anonymous"
                  />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.34)_100%)]" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[1] px-6 pb-1 pt-24">
        <div className="pb-[31px]">
          <p className="text-sm font-bold leading-tight text-white/78">{subtitle || "TOVIE MOVIE COVER"}</p>
          <h1 className="mt-2 break-keep text-[32px] font-black leading-[1.06] text-white drop-shadow">
            {title || "영화 목록"}
          </h1>
        </div>
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
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
  const imageCandidates = buildImageCandidates(getPosterUrl(movie), getBackdropUrl(movie));
  const title = movie?.singlePreviewTitle ?? movie?.title ?? "영화를 추가하세요";
  const subtitle = movie?.singlePreviewSubtitle ?? movie?.original_title ?? movie?.title ?? "설명 텍스트";
  const body = movie?.singlePreviewBody ?? movie?.overview ?? "여기에 설명을 적어주세요.\n두 줄까지 표시됩니다.";
  const showTitle = movie?.singlePreviewShowTitle ?? true;
  const showSubtitle = movie?.singlePreviewShowSubtitle ?? true;
  const showBody = movie?.singlePreviewShowBody ?? true;
  const subtitleValue =
    movie?.noteMode === "rotten"
      ? movie?.rottenTomatometer || movie?.rottenPopcornmeter
        ? `${movie.rottenTomatometer ?? "00%"} ${movie.rottenPopcornmeter ?? "-%"}`
        : "00% 00%"
      : movie?.note || subtitle;
  const titleClass = "text-[32px]";
  const subtitleClass = "text-sm font-bold leading-tight text-white/78";
  const bodyClass = "mt-2 line-clamp-2 whitespace-pre-line text-base font-medium leading-relaxed text-white/76";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-white">
      {imageCandidates[0] ? (
        <img
          alt=""
          src={imageCandidates[0]}
          data-fallback-index="0"
          onError={(event) => handleImageFallback(event, imageCandidates)}
          className="absolute inset-0 h-full w-full object-cover object-center"
          crossOrigin="anonymous"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.12)_42%,rgba(0,0,0,0.68)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-[1] px-6 pb-1 pt-24">
        <div className="w-full max-w-[20rem] pb-[31px] text-left">
          {showSubtitle ? <p className={["truncate", subtitleClass].join(" ")}>{subtitleValue || "설명 텍스트"}</p> : null}
          {showTitle ? (
            <div className="mt-2">
              <h1 className={["min-w-0 flex-1 break-keep font-black leading-[1.06] text-white drop-shadow", titleClass].join(" ")}>
                {title || movie?.title || "영화를 추가하세요"}
              </h1>
            </div>
          ) : null}
          {showBody ? <p className={bodyClass}>{body || "여기에 설명을 적어주세요.\n두 줄까지 표시됩니다."}</p> : null}
        </div>
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
      </div>
    </div>
  );
}

function PersonCoverTemplate({
  persons,
  headline,
  kicker,
  body,
  showTitle,
  showSubtitle,
  showBody,
  footerLeft,
  footerRight,
}: {
  persons: CapturePerson[];
  headline: string;
  kicker: string;
  body: string;
  showTitle: boolean;
  showSubtitle: boolean;
  showBody: boolean;
  footerLeft: string;
  footerRight: string;
}) {
  const primaryPerson = persons[0] ?? null;
  const secondaryPerson = persons[1] ?? null;
  const profileUrl = getProfileUrl(primaryPerson?.profile_path);
  const secondaryProfileUrl = getProfileUrl(secondaryPerson?.profile_path);
  const bodyValue = body || primaryPerson?.biography || "";
  const isDualLayout = Boolean(primaryPerson && secondaryPerson);

  return (
    <div className="relative h-full overflow-hidden bg-slate-950 text-white">
      {isDualLayout ? (
        <>
          {profileUrl ? (
            <img
              alt=""
              src={profileUrl}
              className="absolute inset-y-0 left-0 h-full w-1/2 object-cover"
              crossOrigin="anonymous"
            />
          ) : null}
          {secondaryProfileUrl ? (
            <img
              alt=""
              src={secondaryProfileUrl}
              className="absolute inset-y-0 right-0 h-full w-1/2 object-cover"
              crossOrigin="anonymous"
            />
          ) : null}
        </>
      ) : profileUrl ? (
        <img
          alt=""
          src={profileUrl}
          className="absolute inset-0 h-full w-full object-cover"
          crossOrigin="anonymous"
        />
      ) : null}

      <div className={["absolute inset-0", isDualLayout ? "bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.04)_40%,rgba(0,0,0,0.62)_100%)]" : "bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.03)_42%,rgba(0,0,0,0.62)_100%)]"].join(" ")} />
      <div className="absolute inset-x-0 bottom-0 z-[1] px-6 pb-1 pt-24">
        <div className="pb-[31px]">
          {showSubtitle ? <p className="text-sm font-bold leading-tight text-white/78">{kicker || "TOVIE PERSON"}</p> : null}
          {showTitle ? (
            <h1 className="mt-2 break-keep text-[32px] font-black leading-[1.06] text-white drop-shadow">
              {headline || getDualPersonTitle(persons)}
            </h1>
          ) : null}
          {showBody && bodyValue ? (
            <p className="mt-2 line-clamp-2 whitespace-pre-line text-base font-medium leading-relaxed text-white/76">
              {bodyValue}
            </p>
          ) : null}
        </div>
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
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
    <div className="relative h-full w-full overflow-hidden bg-white text-slate-900">
      <CalendarView results={results} option={option} hideCaptureButton embedCalendarOnly />
      <div
        className={[
          "pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex flex-col justify-end px-6 pb-1 pt-24",
          showTitle ? "" : "bg-gradient-to-t from-black/20 via-black/6 to-transparent",
        ].join(" ")}
      >
        {showTitle ? (
          <h1 className="mt-2 inline-flex w-fit break-keep bg-black px-3 py-2 text-[32px] font-black leading-[1.06] text-white">
            {title || "TOVIE CALENDAR"}
          </h1>
        ) : null}
        {showTitle ? (
          <div className="h-[31px]" aria-hidden="true" />
        ) : (
          <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
        )}
      </div>
    </div>
  );
}

function CalendarDayPreviewTemplate({
  dateKey,
  items,
  footerLeft,
  footerRight,
}: {
  dateKey: string;
  items: any[];
  footerLeft: string;
  footerRight: string;
}) {
  const date = new Date(`${dateKey}T00:00:00`);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const showBackdropGrid = items.length >= 2;
  const isDense = items.length >= 4;
  const leadTitle = String(items[0]?.title ?? "");

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 z-[2] h-12 bg-gradient-to-b from-black/56 via-black/22 to-transparent px-6">
        <div className="flex h-full items-center justify-between gap-3">
          <p className="text-sm font-black leading-tight text-white">{date.getMonth() + 1}월 {date.getDate()}일 ({weekdays[date.getDay()]})</p>
          <span className="shrink-0 text-xs font-bold text-white/88">@scena.kr</span>
        </div>
      </div>

      {showBackdropGrid ? (
        <div className={["absolute inset-x-0 top-12 bottom-0 grid", isDense ? "grid-cols-2" : "grid-cols-1"].join(" ")}>
          {items.map((item, idx) => {
            const backdrop = getCalendarBackdropUrl(item);
            const title = String(item?.title ?? "");
            const isLastOddWide = isDense && items.length % 2 === 1 && idx === items.length - 1;
            return (
              <div key={`${dateKey}-${idx}`} className={["relative overflow-hidden bg-slate-800", isLastOddWide ? "col-span-2" : ""].join(" ")}>
                {backdrop ? (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${backdrop})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center top",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-black/10" />
                <p className="absolute inset-x-2 bottom-2 z-[1] line-clamp-2 whitespace-normal text-center [word-break:keep-all] text-xs font-bold leading-tight text-white drop-shadow">{title}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="absolute inset-x-0 top-12 bottom-0 bg-slate-900">
          {getCalendarPosterUrl(items[0]) || getCalendarBackdropUrl(items[0]) ? (
            <img
              alt=""
              src={getCalendarPosterUrl(items[0]) || getCalendarBackdropUrl(items[0])}
              className="block h-full w-full object-cover object-top"
              crossOrigin="anonymous"
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.03)_0%,rgba(0,0,0,0.08)_42%,rgba(0,0,0,0.58)_100%)]" />
        </div>
      )}

      <div className={["pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/52 via-black/18 to-transparent px-6 pb-6 pt-0"].join(" ")}>
        {!showBackdropGrid ? (
          <h2 className="mb-0 whitespace-normal [word-break:keep-all] text-[36px] font-black leading-none text-white drop-shadow">
            {leadTitle}
          </h2>
        ) : null}
      </div>
    </div>
  );
}

function CalendarReleaseBoardTemplate({
  movies,
  title,
  labelColors,
  dateLabels,
}: {
  movies: Array<CaptureMovie | undefined>;
  title: string;
  labelColors: string[];
  dateLabels: string[];
}) {
  const visibleMovies = movies.slice(0, 8).filter(Boolean) as CaptureMovie[];
  const gridColsClass =
    visibleMovies.length <= 2 ? "grid-cols-2" : visibleMovies.length <= 6 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#221f2e] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.34),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_36%),linear-gradient(180deg,#7a3f52_0%,#4a364a_52%,#262b3d_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.18)_0.8px,transparent_0.8px)] [background-size:11px_11px]" />

      <div className="relative z-[1] flex h-full min-h-0 flex-col px-4 pb-1 pt-4">
        <div className="flex flex-col items-center">
          <h1 className="mt-0.5 inline-flex max-w-full items-center justify-center rounded-[1.1rem] bg-white px-4 py-2 break-keep text-center text-[1.55rem] font-black leading-[0.94] tracking-[-0.09em] text-slate-950 [text-shadow:0_0_0_currentColor]">
            {title}
          </h1>
        </div>

        <div className={["mt-2.5 grid min-h-0 flex-1 gap-2", gridColsClass].join(" ")}>
          {visibleMovies.map((movie, index) => {
            const posterUrl = getPosterUrl(movie) || getBackdropUrl(movie);

            return (
              <div key={`${movie?.id ?? "empty"}-${index}`} className="flex min-h-0 flex-col overflow-hidden rounded-[0.95rem] bg-white/6 shadow-[0_10px_20px_rgba(0,0,0,0.22)]">
                <div
                  className="px-2 py-0.5 text-center"
                  style={{ backgroundColor: labelColors[index] || RELEASE_BOARD_DEFAULT_COLORS[index] || "#1f2937" }}
                >
                  <p className="text-[0.78rem] font-black tracking-[0.06em] text-white">{formatReleaseBoardDate(dateLabels[index] || "") || `SLOT ${index + 1}`}</p>
                </div>
                <div className="relative min-h-0 flex-1 bg-white">
                  {posterUrl ? (
                    <img alt="" src={posterUrl} className="h-full w-full object-cover" crossOrigin="anonymous" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/90 text-center text-xs font-bold tracking-[0.08em] text-slate-400">
                      ADD MOVIE
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="pt-0.5 text-center">
          <span className="text-[10px] font-semibold tracking-[0.03em] text-white/92">@scena.kr</span>
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
    selectedPersons,
    removeMovie,
    removePerson,
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
  const calendarReleaseCaptureRef = useRef<HTMLDivElement | null>(null);
  const calendarDayPreviewCaptureRef = useRef<HTMLDivElement | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const [personTitle, setPersonTitle] = useState("인물 이름");
  const [personSubtitle, setPersonSubtitle] = useState("관객수가 증명한 배우");
  const [personBody, setPersonBody] = useState("");
  const [personShowTitle, setPersonShowTitle] = useState(true);
  const [personShowSubtitle, setPersonShowSubtitle] = useState(true);
  const [personShowBody, setPersonShowBody] = useState(true);
  const [movieCoverTitle, setMovieCoverTitle] = useState("영화 묶음");
  const [movieCoverSubtitle, setMovieCoverSubtitle] = useState("TOVIE MOVIE COVER");
  const [movieCoverLayout, setMovieCoverLayout] = useState<"stack" | "grid">("stack");
  const [footerLeft, setFooterLeft] = useState("셰나코리아");
  const [footerRight, setFooterRight] = useState("@scena.kr");
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewMovieIndex, setPreviewMovieIndex] = useState(0);
  const [releaseBoardPreviewIndex, setReleaseBoardPreviewIndex] = useState(0);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [didCopyText, setDidCopyText] = useState(false);
  const [loadingRottenIds, setLoadingRottenIds] = useState<Record<number, boolean>>({});
  const [calendarResults, setCalendarResults] = useState<any[]>([]);
  const [calendarOption, setCalendarOption] = useState<any>({ initialView: "dayGridMonth" });
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState("");
  const [calendarTitle, setCalendarTitle] = useState(`${new Date().getMonth() + 1}월 개봉 일정`);
  const [showCalendarTitle, setShowCalendarTitle] = useState(true);
  const [calendarPreviewDateKey, setCalendarPreviewDateKey] = useState("");
  const [calendarReleaseTitle, setCalendarReleaseTitle] = useState("6월 개봉예정 영화 라인업");
  const [calendarReleaseLabelColors, setCalendarReleaseLabelColors] = useState(RELEASE_BOARD_DEFAULT_COLORS);
  const [calendarReleaseDates, setCalendarReleaseDates] = useState(() => Array.from({ length: 8 }, () => ""));

  const isPersonMode = captureMode === "person-cover";
  const isMovieListMode = captureMode === "movie-list";
  const isMovieCoverMode = captureMode === "movie-cover";
  const isCalendarMode = captureMode === "calendar";
  const isCalendarReleaseMode = captureMode === "calendar-release";
  const isCalendarDataMode = isCalendarMode;
  const isMovieMode = isMovieListMode || isMovieCoverMode || isCalendarReleaseMode;
  const movieMinCount = isMovieCoverMode ? 2 : 3;
  const movieSlotCount = Math.min(Math.max(selectedMovies.length, movieMinCount), 5);
  const currentSingleMovie = selectedMovies[previewMovieIndex];
  const calendarPreviewGroups = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const groups = new Map<string, any[]>();

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
      if (!(item?.backdrop_path ?? item?.backdropPath)) return;
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)?.push(item);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, items]) => ({ dateKey, items }))
      .filter((group) => group.items.length > 0);
  }, [calendarResults]);
  const activeCalendarPreview =
    calendarPreviewGroups.find((group) => group.dateKey === calendarPreviewDateKey) ?? calendarPreviewGroups[0] ?? null;
  const releaseBoardSlots = Array.from({ length: 8 }, (_, index) => selectedMovies[index]);
  const releaseBoardDateLabels = releaseBoardSlots.map((movie, index) => formatReleaseBoardDate(calendarReleaseDates[index]) || getReleaseBoardAutoDate(movie));
  const currentReleaseBoardMovie = releaseBoardSlots[releaseBoardPreviewIndex];

  useEffect(() => {
    if (selectedPersons.length === 1 && selectedPersons[0]?.name) {
      setPersonTitle(selectedPersons[0].name);
      return;
    }
    if (selectedPersons.length === 2) {
      setPersonTitle(getDualPersonTitle(selectedPersons));
    }
  }, [movieSlotCount, selectedPersons]);

  useEffect(() => {
    setPersonBody(selectedPerson?.biography || "");
  }, [selectedPerson?.id, selectedPerson?.biography]);

  useEffect(() => {
    if (!selectedMovies.length) {
      setPreviewMovieIndex(0);
      return;
    }

    setPreviewMovieIndex((current) => Math.min(current, selectedMovies.length - 1));
  }, [selectedMovies.length]);

  useEffect(() => {
    if (!calendarPreviewGroups.length) {
      setCalendarPreviewDateKey("");
      return;
    }
    if (!calendarPreviewGroups.some((group) => group.dateKey === calendarPreviewDateKey)) {
      setCalendarPreviewDateKey(calendarPreviewGroups[0].dateKey);
    }
  }, [calendarPreviewDateKey, calendarPreviewGroups]);

  const requestRottenScore = useCallback(
    async (movie: CaptureMovie) => {
      if (loadingRottenIds[movie.id]) return;
      if (!isMovieContent(movie)) return;

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
      if (isMovieContent(movie) && movie.noteMode === "rotten" && !movie.rottenTomatometer && !movie.rottenPopcornmeter) {
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
      : isCalendarReleaseMode
        ? calendarReleaseCaptureRef
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

      const rect = targetRef.current.getBoundingClientRect();
      const captureWidth = Math.max(1, Math.round(rect.width));
      const captureHeight = Math.max(1, Math.round(rect.height) - (isCalendarMode ? 2 : 0));

      const dataUrl = await toPng(targetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: isCalendarMode ? "#ffffff" : isCalendarReleaseMode ? "#221f2e" : "#111827",
        width: captureWidth,
        height: captureHeight,
        canvasWidth: captureWidth * 2,
        canvasHeight: captureHeight * 2,
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

  const handleDownloadEachCalendarPreview = async () => {
    if (!isCalendarMode || !calendarPreviewGroups.length || isCapturing) return;

    try {
      setIsCapturing(true);

      for (const group of calendarPreviewGroups) {
        setCalendarPreviewDateKey(group.dateKey);

        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

        if (!calendarDayPreviewCaptureRef.current) continue;

        const rect = calendarDayPreviewCaptureRef.current.getBoundingClientRect();
        const captureWidth = Math.max(1, Math.round(rect.width));
        const captureHeight = Math.max(1, Math.round(rect.height));

        const dataUrl = await toPng(calendarDayPreviewCaptureRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#111827",
          width: captureWidth,
          height: captureHeight,
          canvasWidth: captureWidth * 2,
          canvasHeight: captureHeight * 2,
        });

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `tovie-calendar-preview-${group.dateKey}.png`;
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
      if (item?.type === "공휴일" || item?.type === "대체공휴일") return 4;
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
          {isCalendarMode ? (
            <button
              type="button"
              onClick={handleDownloadEachCalendarPreview}
              disabled={isCapturing || !calendarPreviewGroups.length}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 sm:flex-none"
            >
              <FontAwesomeIcon icon={faDownload} />
              ?좎쭨蹂?            </button>
          ) : null}
        </div>
      </div>

      <div className="inline-flex w-full border border-slate-200 bg-white/72 p-1 dark:border-slate-800 dark:bg-slate-950/70 sm:w-fit">
        {[
          { key: "person-cover", label: "Person Cover" },
          { key: "movie-cover", label: "Movie Cover" },
          { key: "movie-list", label: "Movie List" },
          { key: "calendar", label: "Calendar" },
          { key: "calendar-release", label: "Release Board" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setCaptureMode(item.key as "movie-list" | "movie-cover" | "person-cover" | "calendar" | "calendar-release")}
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
          {isCalendarMode || isCalendarReleaseMode ? (
            <CalendarCaptureControls
              isCalendarReleaseMode={isCalendarReleaseMode}
              isCalendarMode={isCalendarMode}
              isCalendarLoading={isCalendarLoading}
              calendarError={calendarError}
              selectedMoviesCount={selectedMovies.length}
              calendarResultsCount={calendarResults.length}
              calendarReleaseTitle={calendarReleaseTitle}
              setCalendarReleaseTitle={setCalendarReleaseTitle}
              calendarReleaseLabelColors={calendarReleaseLabelColors}
              setCalendarReleaseLabelColors={setCalendarReleaseLabelColors}
              calendarReleaseDates={calendarReleaseDates}
              setCalendarReleaseDates={setCalendarReleaseDates}
              releaseBoardPlaceholders={releaseBoardSlots.map((movie) => getReleaseBoardAutoDate(movie) || "6/5")}
              calendarTitle={calendarTitle}
              setCalendarTitle={setCalendarTitle}
              showCalendarTitle={showCalendarTitle}
              setShowCalendarTitle={setShowCalendarTitle}
              footerLeft={footerLeft}
              setFooterLeft={setFooterLeft}
              footerRight={footerRight}
              setFooterRight={setFooterRight}
              handleCopyCalendarText={handleCopyCalendarText}
              calendarTextForCopy={calendarTextForCopy}
              didCopyText={didCopyText}
            />
          ) : isMovieMode ? (
          <>
            <MovieSlotsPanel
              isCalendarReleaseMode={isCalendarReleaseMode}
              isMovieListMode={isMovieListMode}
              selectedMoviesCount={selectedMovies.length}
              movieSlotCount={movieSlotCount}
              movies={isCalendarReleaseMode ? releaseBoardSlots : slots}
              dragOverIndex={dragOverIndex}
              loadingRottenIds={loadingRottenIds}
              onDragStart={handleDragStart}
              onDragOver={(index) => setDragOverIndex(index)}
              onDragLeave={(index) => setDragOverIndex((current) => (current === index ? null : current))}
              onDrop={handleDrop}
              onDragEnd={() => {
                draggedIndexRef.current = null;
                setDragOverIndex(null);
              }}
              removeMovie={removeMovie}
              updateMovieNote={updateMovieNote}
              updateMovieNoteMode={updateMovieNoteMode}
              requestRottenScore={(movie) => {
                void requestRottenScore(movie);
              }}
              isMovieContent={isMovieContent}
            />

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
                  value={currentSingleMovie?.singlePreviewBody ?? currentSingleMovie?.overview ?? "여기에 설명을 적어주세요.\n두 줄까지 표시됩니다."}
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
            </div>
          ) : null}

          </>
          ) : (
            <>
              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Person</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedPersons.length}/2</p>
                </div>
                <div className="flex flex-col gap-3">
                  {selectedPersons.length ? (
                    selectedPersons.map((person, index) => (
                      <div key={person.id} className="border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="flex items-start gap-3">
                          {person.profile_path ? (
                            <img
                              alt=""
                              src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                              className="h-20 w-14 shrink-0 object-cover"
                            />
                          ) : (
                            <div className="h-20 w-14 shrink-0 bg-slate-200 dark:bg-slate-800" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{person.name}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{person.known_for_department ?? "프로필 이미지를 선택할 수 있습니다"}</p>
                            <p className="mt-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">인물 {index + 1}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePerson(person.id)}
                            className="inline-flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            aria-label={`${person.name} remove`}
                            title="Remove"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>

                        {person.profileOptions?.length ? (
                          <div className="mt-3 grid grid-cols-5 gap-2">
                            {person.profileOptions.map((profilePath) => (
                              <button
                                key={`${person.id}-${profilePath}`}
                                type="button"
                                onClick={() => updatePersonProfilePath(person.id, profilePath)}
                                className={[
                                  "aspect-[4/5] overflow-hidden border transition",
                                  person.profile_path === profilePath ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20" : "border-slate-200 dark:border-slate-800",
                                ].join(" ")}
                                aria-label="Select profile image"
                              >
                                <img alt="" src={`https://image.tmdb.org/t/p/w185${profilePath}`} className="h-full w-full object-cover" />
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                      상단 검색으로 인물을 최대 2명까지 추가하세요
                    </div>
                  )}
                </div>
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
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Body</span>
                  <textarea
                    value={personBody}
                    onChange={(event) => setPersonBody(event.target.value)}
                    placeholder={selectedPerson?.biography ? "" : "인물 설명"}
                    rows={2}
                    className="min-h-20 w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {[
                    { key: "title", label: "Title", checked: personShowTitle, setChecked: setPersonShowTitle },
                    { key: "subtitle", label: "Subtitle", checked: personShowSubtitle, setChecked: setPersonShowSubtitle },
                    { key: "body", label: "Body", checked: personShowBody, setChecked: setPersonShowBody },
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
              ref={isCalendarMode ? calendarCaptureRef : isCalendarReleaseMode ? calendarReleaseCaptureRef : captureMode === "person-cover" ? personCaptureRef : isMovieCoverMode ? movieCoverCaptureRef : captureRef}
              className={[
                isCalendarMode ? "aspect-[4/5] w-full overflow-hidden bg-white text-slate-900" : isCalendarReleaseMode ? "aspect-[4/5] w-full overflow-hidden bg-[#221f2e] text-white" : "aspect-[4/5] w-full overflow-hidden bg-slate-950 text-white",
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
              ) : isCalendarReleaseMode ? (
                <CalendarReleaseBoardTemplate
                  movies={releaseBoardSlots}
                  title={calendarReleaseTitle}
                  labelColors={calendarReleaseLabelColors}
                  dateLabels={releaseBoardDateLabels}
                />
              ) : captureMode === "person-cover" ? (
                <PersonCoverTemplate
                  persons={selectedPersons}
                  headline={personTitle}
                  kicker={personSubtitle}
                  body={personBody}
                  showTitle={personShowTitle}
                  showSubtitle={personShowSubtitle}
                  showBody={personShowBody}
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
            {isCalendarMode ? (
              <div className="mt-4 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                  {calendarPreviewGroups.map((group) => (
                    <button
                      key={group.dateKey}
                      type="button"
                      onClick={() => setCalendarPreviewDateKey(group.dateKey)}
                      className={[
                        "inline-flex h-8 min-w-12 items-center justify-center border px-2 text-xs font-bold transition",
                        (activeCalendarPreview?.dateKey ?? "") === group.dateKey
                          ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                      ].join(" ")}
                    >
                      {group.dateKey.slice(5).replace("-", "/")}
                    </button>
                  ))}
                </div>
                {activeCalendarPreview ? (
                  <div ref={calendarDayPreviewCaptureRef} className="overflow-hidden bg-slate-950">
                    <CalendarDayPreviewTemplate
                      dateKey={activeCalendarPreview.dateKey}
                      items={activeCalendarPreview.items}
                      footerLeft={footerLeft}
                      footerRight={footerRight}
                    />
                  </div>
                ) : (
                  <div className="flex h-56 items-center justify-center border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    ?대깽?멸? ?덈뒗 ?좎쭨媛 ?놁뒿?덈떎.
                  </div>
                )}
              </div>
            ) : null}
            {isCalendarReleaseMode ? (
              <div className="mt-4 overflow-hidden border border-slate-200 bg-white/72 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="p-4 pb-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Release Board Poster</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {selectedMovies.length ? `${releaseBoardPreviewIndex + 1}/${Math.min(selectedMovies.length, 8)}` : "empty"}
                    </p>
                  </div>

                  {selectedMovies.length ? (
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {releaseBoardSlots.map((movie, index) => (
                        <button
                          key={`${movie?.id ?? "release-slot"}-${index}`}
                          type="button"
                          onClick={() => setReleaseBoardPreviewIndex(index)}
                          className={[
                            "inline-flex h-8 min-w-8 items-center justify-center border px-2 text-xs font-bold transition",
                            releaseBoardPreviewIndex === index
                              ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                          ].join(" ")}
                          disabled={!movie}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {currentReleaseBoardMovie?.posterOptions?.length ? (
                  <div className="m-4 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Poster</p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {currentReleaseBoardMovie.posterOptions.length}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {currentReleaseBoardMovie.posterOptions.map((posterPath) => (
                        <button
                          key={posterPath}
                          type="button"
                          onClick={() => updateMoviePoster(currentReleaseBoardMovie.id, posterPath)}
                          className={[
                            "aspect-[4/5] overflow-hidden border transition",
                            currentReleaseBoardMovie.poster_path === posterPath
                              ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20"
                              : "border-slate-200 dark:border-slate-800",
                          ].join(" ")}
                          aria-label="Select release board poster"
                        >
                          <img alt="" src={getPosterThumbUrl(posterPath)} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-400">
                    {selectedMovies.length ? "선택한 영화에 포스터 옵션이 없으면 현재 포스터가 그대로 사용됩니다." : "영화를 추가하면 포스터 선택이 표시됩니다."}
                  </div>
                )}
              </div>
            ) : null}
            {isMovieListMode ? (
              <div className="mt-4 overflow-hidden border border-slate-200 bg-white/72 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="p-4 pb-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Single Preview</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {selectedMovies.length ? `${previewMovieIndex + 1}/${selectedMovies.length}` : "empty"}
                    </p>
                  </div>

                  {selectedMovies.length ? (
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
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
                    ) : null}
                </div>

                {selectedMovies.length ? (
                  <>
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
                      <div className="m-4 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
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

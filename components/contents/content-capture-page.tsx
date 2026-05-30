"use client";

import Title from "@/components/common/title";
import { CaptureFollowMovie, CaptureMovie, CapturePerson, useCaptureContent } from "@/context/CaptureContentContext";
import { faDownload, faGripVertical, faRotateLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";

function formatYear(movie: CaptureMovie) {
  return movie.release_date ? movie.release_date.slice(0, 4) : "";
}

function getBackdropUrl(movie?: CaptureMovie) {
  if (!movie?.backdrop_path) return "";
  return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
}

function getPosterUrl(movie?: CaptureMovie) {
  if (!movie?.poster_path) return "";
  return `https://image.tmdb.org/t/p/w342${movie.poster_path}`;
}

function getPosterThumbUrl(posterPath?: string) {
  if (!posterPath) return "";
  return `https://image.tmdb.org/t/p/w185${posterPath}`;
}

function getProfileUrl(profilePath?: string) {
  if (!profilePath) return "";
  return `https://image.tmdb.org/t/p/original${profilePath}`;
}

function MovieCaptureRow({ movie, index }: { movie?: CaptureMovie; index: number }) {
  const backdropUrl = getBackdropUrl(movie);

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
        <div className="flex w-8 shrink-0 items-baseline">
          <span className="text-xl font-black leading-tight text-white drop-shadow">
            {index + 1}위
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-black leading-tight text-white drop-shadow">{movie?.title ?? "영화를 추가하세요"}</p>
        </div>
        {movie?.note ? (
          <p className="max-w-[36%] shrink-0 text-right text-base font-black leading-tight text-white drop-shadow">
            {movie.note}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function MovieListTemplate({
  slots,
  title,
  label,
  footerLeft,
  footerRight,
}: {
  slots: Array<CaptureMovie | undefined>;
  title: string;
  label: string;
  footerLeft: string;
  footerRight: string;
}) {
  const isLongTitle = title.replace(/\s/g, "").length >= 10;

  return (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <header className="shrink-0 px-6 py-4">
        {/* <p className="text-xs font-semibold leading-tight text-white/62">{label || "TOP 5"}</p> */}
        <h1 className={["mt-1.5 mb-2 truncate font-black leading-none", isLongTitle ? "text-lg" : "text-xl"].join(" ")}>
          {title || "인물 이름"}
        </h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col bg-slate-950">
        {slots.map((movie, index) => (
          <MovieCaptureRow key={movie?.id ?? `preview-${index}`} movie={movie} index={index} />
        ))}
      </div>

      <footer className="mb-7 mx-7 flex items-center justify-between pt-4 text-xs font-black text-white/82">
        <span className="text-[11px] uppercase tracking-[0.08em]">{footerLeft || "셰나코리아"}</span>
        <span>{footerRight || "@scena.kr"}</span>
      </footer>
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
        <h1 className="mt-2 text-4xl font-black leading-none text-white drop-shadow">
          {headline || person?.name || "인물 이름"}
        </h1>
        <div className="mt-7 flex items-center justify-between border-t border-white/40 pt-4 text-xs font-black text-white/82">
          <span className="text-[11px] uppercase tracking-[0.08em]">{footerLeft || "셰나코리아"}</span>
          <span>{footerRight || "@scena.kr"}</span>
        </div>
      </div>
    </div>
  );
}

function FollowCardTemplate({
  movie,
  title,
  subtitle,
  footerLeft,
  footerRight,
  onSelectPoster,
}: {
  movie: CaptureFollowMovie | null;
  title: string;
  subtitle: string;
  footerLeft: string;
  footerRight: string;
  onSelectPoster: (posterPath: string) => void;
}) {
  const posterUrl = getPosterUrl(movie ?? undefined);
  const posterOptions = movie?.posterOptions ?? [];

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-white">
      {posterUrl ? (
        <img alt="" src={posterUrl} className="absolute inset-0 h-full w-full object-cover object-center" crossOrigin="anonymous" />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.88)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-[1] px-7 pb-7 pt-24">
        <div className="mx-auto max-w-[20rem]">
          <p className="text-sm font-bold leading-tight text-white/78">
            {subtitle || "더 많은 영화와 배우 이야기를 보고 싶다면"}
          </p>

          <h1 className="mt-2 text-4xl font-black leading-none text-white drop-shadow">
            {title || "셰나코리아"}
          </h1>
        </div>
        <div className="mt-7 flex items-center justify-between border-t border-white/40 pt-4 text-xs font-black text-white/82">
          <span className="text-[11px] uppercase tracking-[0.08em]">{footerLeft || "셰나코리아"}</span>
          <span>{footerRight || "@scena.kr"}</span>
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
    selectedFollowMovie,
    selectedPerson,
    removeMovie,
    reorderMovie,
    updateMovieNote,
    updateFollowMoviePoster,
    updatePersonProfilePath,
    clearMovies,
    clearFollowMovie,
    clearPerson,
  } = useCaptureContent();
  const captureRef = useRef<HTMLDivElement | null>(null);
  const personCaptureRef = useRef<HTMLDivElement | null>(null);
  const followCaptureRef = useRef<HTMLDivElement | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const [personTitle, setPersonTitle] = useState("인물 이름");
  const [movieTitle, setMovieTitle] = useState("하면 떠오르는 영화는?");
  const [movieSubtitle, setMovieSubtitle] = useState("TOP 5");
  const [personSubtitle, setPersonSubtitle] = useState("관객수가 증명한 배우");
  const [followTitle, setFollowTitle] = useState("셰나코리아");
  const [followSubtitle, setFollowSubtitle] = useState("더 많은 영화와 배우 이야기를 보고 싶다면");
  const [footerLeft, setFooterLeft] = useState("셰나코리아");
  const [footerRight, setFooterRight] = useState("@scena.kr");
  const [isCapturing, setIsCapturing] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [didCopyText, setDidCopyText] = useState(false);

  const isPersonMode = captureMode === "person-cover";
  const isFollowMode = captureMode === "follow-card";
  const isMovieMode = captureMode === "movie-list";

  useEffect(() => {
    if (selectedPerson?.name) {
      setPersonTitle(`${selectedPerson.name} 영화 TOP 5`);
    }
  }, [selectedPerson?.id, selectedPerson?.name]);

  const handleCapture = async () => {
    const targetRef = isPersonMode ? personCaptureRef : isFollowMode ? followCaptureRef : captureRef;
    if (!targetRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const dataUrl = await toPng(targetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#111827",
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `tovie-${captureMode}-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } finally {
      setIsCapturing(false);
    }
  };

  const slots = Array.from({ length: 5 }, (_, index) => selectedMovies[index]);
  const movieTextForCopy = useMemo(
    () =>
      selectedMovies
        .map((movie, index) => {
          const year = formatYear(movie);
          return [`${index + 1}위`, movie.title, year ? `(${year})` : "", movie.note].filter(Boolean).join(" ");
        })
        .join("\n"),
    [selectedMovies],
  );

  const handleCopyMovieText = async () => {
    if (!movieTextForCopy) return;

    await navigator.clipboard.writeText(movieTextForCopy);
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
            onClick={
              isPersonMode
                ? clearPerson
                : isFollowMode
                  ? clearFollowMovie
                  : clearMovies
            }
            disabled={isPersonMode ? !selectedPerson : isFollowMode ? !selectedFollowMovie : !selectedMovies.length}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Reset selected movies"
            title="Reset"
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={isCapturing || (isPersonMode ? !selectedPerson : isMovieMode ? !selectedMovies.length : !selectedFollowMovie)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 border border-slate-900 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-default disabled:opacity-45 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white sm:flex-none"
          >
            <FontAwesomeIcon icon={faDownload} />
            {isCapturing ? "capturing" : "download"}
          </button>
        </div>
      </div>

      <div className="inline-flex w-full border border-slate-200 bg-white/72 p-1 dark:border-slate-800 dark:bg-slate-950/70 sm:w-fit">
        {[
          { key: "person-cover", label: "Person Cover" },
          { key: "movie-list", label: "Movie List" },
          { key: "follow-card", label: "Follow Card" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setCaptureMode(item.key as "movie-list" | "person-cover" | "follow-card")}
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
          {isMovieMode ? (
          <>
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Movies</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedMovies.length}/5</p>
            </div>

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
                    dragOverIndex === index ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-slate-100 dark:ring-slate-100/20" : "border-slate-200 dark:border-slate-800",
                  ].join(" ")}
                >
                  <span className="inline-flex h-8 w-5 shrink-0 items-center justify-center text-slate-300 dark:text-slate-600">
                    {movie ? <FontAwesomeIcon icon={faGripVertical} /> : null}
                  </span>
                  <span className="w-5 shrink-0 text-xs font-bold text-slate-400 sm:w-6">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{movie?.title ?? "빈 슬롯"}</p>
                    {movie ? (
                      <input
                        value={movie.note ?? ""}
                        onChange={(event) => updateMovieNote(movie.id, event.target.value)}
                        onMouseDown={(event) => event.stopPropagation()}
                        onDragStart={(event) => event.preventDefault()}
                        maxLength={16}
                        placeholder="오른쪽 문구"
                        className="mt-1 h-7 w-full border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                      />
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">상단 검색으로 추가</p>
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

          <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
            <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Text</p>
            <label className="mb-3 block">
              <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
              <input
                value={movieTitle}
                onChange={(event) => setMovieTitle(event.target.value)}
                className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
              />
            </label>
            <label className="mb-3 block">
              <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle</span>
              <input
                value={movieSubtitle}
                onChange={(event) => setMovieSubtitle(event.target.value)}
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
          ) : isFollowMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Follow Card</p>
              <div className="mb-3 flex items-center gap-3 border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                {selectedFollowMovie?.poster_path ? (
                  <img
                    alt=""
                    src={`https://image.tmdb.org/t/p/w185${selectedFollowMovie.poster_path}`}
                    className="h-20 w-14 shrink-0 object-cover"
                  />
                ) : (
                  <div className="h-20 w-14 shrink-0 bg-slate-200 dark:bg-slate-800" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                    {selectedFollowMovie?.title ?? "영화 검색으로 1개 선택"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">포스터를 고를 수 있습니다</p>
                </div>
              </div>
              {selectedFollowMovie?.posterOptions?.length ? (
                <div className="mb-3 grid grid-cols-6 gap-2">
                  {selectedFollowMovie.posterOptions.map((posterPath) => (
                    <button
                      key={posterPath}
                      type="button"
                      onClick={() => updateFollowMoviePoster(posterPath)}
                      className={[
                        "aspect-[4/5] overflow-hidden border transition",
                        selectedFollowMovie.poster_path === posterPath ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20" : "border-slate-200 dark:border-slate-800",
                      ].join(" ")}
                      aria-label="Select poster"
                    >
                      <img alt="" src={`https://image.tmdb.org/t/p/w185${posterPath}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                <input
                  value={followTitle}
                  onChange={(event) => setFollowTitle(event.target.value)}
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle</span>
                <input
                  value={followSubtitle}
                  onChange={(event) => setFollowSubtitle(event.target.value)}
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
              ref={captureMode === "person-cover" ? personCaptureRef : captureMode === "follow-card" ? followCaptureRef : captureRef}
              className="aspect-[4/5] w-full overflow-hidden bg-slate-950 text-white shadow-[0_24px_64px_rgba(15,23,42,0.24)]"
            >
              {captureMode === "person-cover" ? (
                <PersonCoverTemplate
                  person={selectedPerson}
                  headline={personTitle}
                  kicker={personSubtitle}
                  footerLeft={footerLeft}
                  footerRight={footerRight}
                />
              ) : captureMode === "follow-card" ? (
                <FollowCardTemplate
                  movie={selectedFollowMovie}
                  title={followTitle}
                  subtitle={followSubtitle}
                  footerLeft={footerLeft}
                  footerRight={footerRight}
                  onSelectPoster={updateFollowMoviePoster}
                />
              ) : (
                <MovieListTemplate
                  slots={slots}
                  title={movieTitle}
                  label={movieSubtitle}
                  footerLeft={footerLeft}
                  footerRight={footerRight}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

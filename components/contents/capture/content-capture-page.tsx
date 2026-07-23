"use client";

import Title from "@/components/common/title";
import { CaptureSizeControls, CaptureTextArea, CaptureToggleButton } from "@/components/contents/capture/content-capture-controls";
import { MovieSlotsPanel } from "@/components/contents/capture/content-capture-movie-controls";
import { CaptureMovie, CaptureMode, getCaptureMovieMaxCount, useCaptureContent } from "@/context/CaptureContentContext";
import { faDownload, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCoverSubtitleClass,
  getPosterThumbUrl,
  isExternalImageUrl,
  MovieListTemplate,
  getReleaseBoardAutoDate,
  getReleaseBoardDefaultColors,
  ReleaseBoardTemplate,
  RankingV2Template,
  SingleMovieTemplate,
  subtitleChipToneOptions,
  toSafeFilename,
  type SubtitleChipTone,
  formatYear,
} from "@/components/contents/capture/content-capture-templates";
import {
  getTitleColorValue,
  NewsCoverTemplate,
  RankingCoverTemplate,
  titleColorOptions,
  type TitleColorKey,
  type TitleFontMode,
} from "@/components/contents/capture/content-capture-social-templates";
import { getBackdropUrl, getPosterUrl } from "@/components/contents/capture/content-capture-utils";
import { FastAverageColor } from "fast-average-color";

function getTodayBoxOfficeDateLabel() {
  const today = new Date();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${today.getMonth() + 1}/${today.getDate()}(${weekdays[today.getDay()]})`;
}

const rankingV2BackgroundPresets = [
  { key: "classic", label: "Classic", start: "#7a3f52", end: "#34384c" },
  { key: "boxoffice", label: "Box Office", start: "#3a3d42", end: "#31343a" },
  { key: "netflix", label: "Netflix", start: "#7a2228", end: "#402744" },
  { key: "watcha", label: "Watcha", start: "#8b2c54", end: "#34264f" },
  { key: "tving", label: "TVING", start: "#8b2428", end: "#34303b" },
  { key: "disney", label: "Disney+", start: "#1d4a55", end: "#493454" },
  { key: "coupang", label: "Coupang", start: "#24518c", end: "#273f59" },
  { key: "purple", label: "Purple", start: "#533878", end: "#27395f" },
];

export default function ContentCapturePage() {
  const {
    captureMode,
    setCaptureMode,
    selectedMovies,
    removeMovie,
    reorderMovie,
    updateMovieTitle,
    updateMovieNote,
    updateMovieRankingText,
    updateMovieRankingTotalAudience,
    updateMovieYear,
    updateMovieImagePosition,
    updateMoviePoster,
    updateMovieSinglePreview,
    clearMovies,
  } = useCaptureContent();
  const captureRef = useRef<HTMLDivElement | null>(null);
  const singleMovieCaptureRef = useRef<HTMLDivElement | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const previousMovieCountRef = useRef(0);
  const [movieListColumns, setMovieListColumns] = useState<1 | 2>(1);
  const [movieListTwoColumnTextMode, setMovieListTwoColumnTextMode] = useState<"corner" | "center">("corner");
  const [movieListCenterTitles, setMovieListCenterTitles] = useState<string[]>([]);
  const [subtitleChipTone, setSubtitleChipTone] = useState<SubtitleChipTone>("burgundy");
  const [singlePreviewTitleSize, setSinglePreviewTitleSize] = useState(28);
  const [singlePreviewVariant, setSinglePreviewVariant] = useState<"default" | "spotlight">("default");
  const [newsHeadline, setNewsHeadline] = useState("라라랜드 10주년 재개봉");
  const [bodyHeadline, setBodyHeadline] = useState("");
  const [newsAccentText, setNewsAccentText] = useState("");
  const [showNewsReview, setShowNewsReview] = useState(false);
  const [newsReviewRating, setNewsReviewRating] = useState("3.5");
  const [newsReviewText, setNewsReviewText] = useState("");
  const [newsTitleSize, setNewsTitleSize] = useState(22);
  const [titleFontMode, setTitleFontMode] = useState<TitleFontMode>("gmarket");
  const [highlightText, setHighlightText] = useState("");
  const [titleColor, setTitleColor] = useState("#fff3d0");
  const [titleColorMode, setTitleColorMode] = useState<"auto" | TitleColorKey>("auto");
  const [rankingHeadline, setRankingHeadline] = useState("일일 박스오피스");
  const [rankingDateLabel, setRankingDateLabel] = useState(getTodayBoxOfficeDateLabel);
  const [showRankingDailyAudience, setShowRankingDailyAudience] = useState(false);
  const [showRankingTotalAudience, setShowRankingTotalAudience] = useState(false);
  const [showRankingV2Images, setShowRankingV2Images] = useState(false);
  const [showRankingV2RowBackgrounds, setShowRankingV2RowBackgrounds] = useState(true);
  const [rankingV2BackgroundStart, setRankingV2BackgroundStart] = useState("#7a3f52");
  const [rankingV2BackgroundEnd, setRankingV2BackgroundEnd] = useState("#34384c");
  const [releaseBoardTitle, setReleaseBoardTitle] = useState("7월 개봉예정 영화 라인업");
  const [releaseBoardTitleSize, setReleaseBoardTitleSize] = useState(25);
  const [releaseBoardLabelColors, setReleaseBoardLabelColors] = useState(() => getReleaseBoardDefaultColors());
  const [releaseBoardDates, setReleaseBoardDates] = useState(() => Array.from({ length: 8 }, () => ""));
  const [useFilmFilter, setUseFilmFilter] = useState(false);
  const [footerLeft, setFooterLeft] = useState("占싸놂옙占쌘몌옙占쏙옙");
  const [footerRight, setFooterRight] = useState("35Film");
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewMovieIndex, setPreviewMovieIndex] = useState(0);
  const [rankingCoverMovieId, setRankingCoverMovieId] = useState<number | null>(null);
  const [rankingV2BackgroundMovieId, setRankingV2BackgroundMovieId] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [didCopyText, setDidCopyText] = useState(false);
  const [didCopyRankingText, setDidCopyRankingText] = useState(false);
  const [externalImageUrl, setExternalImageUrl] = useState("");
  const [externalImageError, setExternalImageError] = useState("");
  const subtitleChipClass = getCoverSubtitleClass(subtitleChipTone);
  const isNewsMode = captureMode === "news-cover";
  const isBodyMode = captureMode === "news-body";
  const isRankingMode = captureMode === "ranking-cover";
  const isRankingV2Mode = captureMode === "ranking-cover-v2";
  const isRankingTextMode = isRankingMode || isRankingV2Mode;
  const isReleaseMode = captureMode === "release-board";
  const isMovieListMode = captureMode === "movie-list";
  const isMovieMode = isNewsMode || isBodyMode || isRankingTextMode || isReleaseMode || isMovieListMode;
  const movieMinCount = isNewsMode ? 1 : isReleaseMode ? 8 : 2;
  const movieMaxCount = getCaptureMovieMaxCount(captureMode);
  const rankingSlotCount = 10;
  const releaseSlotCount = 8;
  const movieSlotCount = isRankingTextMode
    ? rankingSlotCount
    : isReleaseMode
    ? releaseSlotCount
    : Math.min(Math.max(selectedMovies.length, movieMinCount), movieMaxCount);
  const currentSingleMovie = selectedMovies[previewMovieIndex];
  const currentSingleMovieId = currentSingleMovie?.id ?? null;
  const rankingCoverMovie = rankingCoverMovieId
    ? selectedMovies.find((movie) => movie.id === rankingCoverMovieId)
    : undefined;
  const rankingV2BackgroundMovie = rankingV2BackgroundMovieId
    ? selectedMovies.find((movie) => movie.id === rankingV2BackgroundMovieId)
    : undefined;
  const currentCoverMovie = isRankingMode ? rankingCoverMovie ?? selectedMovies[0] : isRankingV2Mode ? rankingV2BackgroundMovie : currentSingleMovie;
  const selectedTitleColor = titleColorMode === "auto" ? titleColor : getTitleColorValue(titleColorMode);
  const getReadableTitleColor = (rgb: [number, number, number]) => {
    const cream = [255, 243, 208];
    const mixed = cream.map((value, index) => Math.round(value * 0.68 + rgb[index] * 0.32));
    return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
  };
  useEffect(() => {
    if (!selectedMovies.length) {
      setPreviewMovieIndex(0);
      setRankingCoverMovieId(null);
      setRankingV2BackgroundMovieId(null);
      previousMovieCountRef.current = 0;
      return;
    }
    if (isMovieListMode && selectedMovies.length > previousMovieCountRef.current) {
      setPreviewMovieIndex(selectedMovies.length - 1);
      previousMovieCountRef.current = selectedMovies.length;
      return;
    }
    setPreviewMovieIndex((current) => Math.min(current, selectedMovies.length - 1));
    previousMovieCountRef.current = selectedMovies.length;
  }, [isMovieListMode, selectedMovies.length]);
  useEffect(() => {
    if (!isRankingTextMode) return;
    if (rankingCoverMovieId && selectedMovies.some((movie) => movie.id === rankingCoverMovieId)) return;
    if (rankingCoverMovieId) {
      setRankingCoverMovieId(null);
      return;
    }
    if (isRankingMode && selectedMovies.length) setRankingCoverMovieId(selectedMovies[0].id);
  }, [isRankingMode, isRankingTextMode, rankingCoverMovieId, selectedMovies]);
  useEffect(() => {
    if (!rankingV2BackgroundMovieId) return;
    if (selectedMovies.some((movie) => movie.id === rankingV2BackgroundMovieId)) return;
    setRankingV2BackgroundMovieId(null);
  }, [rankingV2BackgroundMovieId, selectedMovies]);
  useEffect(() => {
    if (!(isNewsMode || isBodyMode || isRankingMode) || titleColorMode !== "auto") return;
    const imageUrl = getBackdropUrl(currentCoverMovie) || getPosterUrl(currentCoverMovie);
    if (!imageUrl) {
      setTitleColor("#fff3d0");
      return;
    }

    let cancelled = false;
    const averageColor = new FastAverageColor();

    averageColor
      .getColorAsync(imageUrl, { crossOrigin: "anonymous" })
      .then((color) => {
        if (cancelled) return;
        setTitleColor(getReadableTitleColor([color.value[0], color.value[1], color.value[2]]));
      })
      .catch(() => {
        if (!cancelled) setTitleColor("#fff3d0");
      });

    return () => {
      cancelled = true;
      averageColor.destroy();
    };
  }, [currentCoverMovie?.backdrop_path, currentCoverMovie?.poster_path, currentCoverMovie?.id, isNewsMode, isBodyMode, isRankingMode, titleColorMode]);
  useEffect(() => {
    setExternalImageUrl("");
    setExternalImageError("");
  }, [currentSingleMovieId]);
  const handleApplyExternalImageUrl = () => {
    const imageUrl = externalImageUrl.trim();
    if (!imageUrl) {
      setExternalImageError("占싱뱄옙占쏙옙 URL占쏙옙 占쌉뤄옙占쏙옙占쌍쇽옙占쏙옙.");
      return;
    }
    if (!isExternalImageUrl(imageUrl)) {
      setExternalImageError("http:// 占실댐옙 https://占쏙옙 占쏙옙占쏙옙占싹댐옙 占싱뱄옙占쏙옙 URL占쏙옙 占쌍억옙占쌍쇽옙占쏙옙.");
      return;
    }
    const imagePickerMovie = isRankingTextMode ? currentCoverMovie : selectedMovies[previewMovieIndex];
    if (!imagePickerMovie) return;
    updateMoviePoster(imagePickerMovie.id, imageUrl);
    setExternalImageUrl("");
    setExternalImageError("");
  };
  const handleCapture = async () => {
    const targetRef = captureRef;
    if (!targetRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      const rect = targetRef.current.getBoundingClientRect();
      const captureWidth = Math.max(1, Math.round(rect.width));
      const captureHeight = Math.max(1, Math.round(rect.height));
      const dataUrl = await toPng(targetRef.current, {
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
  const releaseBoardDateLabels = slots.map((movie, index) => releaseBoardDates[index]?.trim() || getReleaseBoardAutoDate(movie));
  const movieListCenterTitleDefaults = Array.from({ length: Math.ceil(slots.length / 2) }, (_, index) => {
    const left = slots[index * 2];
    const right = slots[index * 2 + 1];
    return [left?.title, right?.title].filter(Boolean).join(" 占쏙옙 ") || "占쏙옙화占쏙옙 占쌩곤옙占싹쇽옙占쏙옙";
  });
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
  const rankingTextForCopy = useMemo(
    () => Array.from({ length: 10 }, (_, index) => `${index + 1}위 ${selectedMovies[index]?.title ?? ""}`).join("\n"),
    [selectedMovies],
  );
  const updateCurrentSinglePreview = (
    patch: Partial<
      Pick<
        CaptureMovie,
        | "singlePreviewTitle"
        | "singlePreviewSubtitle"
        | "singlePreviewSubbody"
        | "singlePreviewBody"
        | "singlePreviewTextPosition"
        | "singlePreviewShowTitle"
        | "singlePreviewShowSubtitle"
        | "singlePreviewShowSubbody"
        | "singlePreviewShowBody"
      >
    >,
  ) => {
    if (!currentSingleMovie) return;
    updateMovieSinglePreview(currentSingleMovie.id, patch);
  };
  const updateMovieListCenterTitle = (index: number, title: string) => {
    setMovieListCenterTitles((current) => {
      const nextTitles = [...current];
      nextTitles[index] = title;
      return nextTitles;
    });
  };
  const renderMovieListImagePicker = () => {
    const imagePickerMovie = isRankingTextMode ? currentCoverMovie : currentSingleMovie;
    if (!(isMovieListMode || isNewsMode || isBodyMode || isRankingTextMode || isReleaseMode) || !imagePickerMovie) return null;
    const imagePickerIndex = selectedMovies.findIndex((movie) => movie.id === imagePickerMovie.id);
    return (
      <div className="mt-4 overflow-hidden border border-slate-200 bg-white/72 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="p-4 pb-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Cover Image</p>
            {!isRankingMode ? (
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {imagePickerIndex + 1}/{selectedMovies.length}
              </p>
            ) : null}
          </div>
          {!isRankingMode ? (
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
        {imagePickerMovie.posterOptions?.length ? (
          <div className="m-4 mt-0 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Image</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{imagePickerMovie.posterOptions.length}</p>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {imagePickerMovie.posterOptions.map((posterPath) => (
                <button
                  key={posterPath}
                  type="button"
                  onClick={() => updateMoviePoster(imagePickerMovie.id, posterPath)}
                  className={[
                    "aspect-[4/5] overflow-hidden border transition",
                    imagePickerMovie.poster_path === posterPath
                      ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20"
                      : "border-slate-200 dark:border-slate-800",
                  ].join(" ")}
                  aria-label="Select cover image"
                >
                  <img alt="" src={getPosterThumbUrl(posterPath)} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="m-4 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mb-3">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">External Image</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">占싱뱄옙占쏙옙 占쌍소몌옙 占쌕울옙占쏙옙占쏙옙占쏙옙 占쏙옙占?占쏙옙占쏙옙占쏙옙占?占쏙옙占쏙옙 占쏙옙占쏙옙占썰에 占쏙옙占쏙옙 占쏙옙占쏙옙絳求占?</p>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              handleApplyExternalImageUrl();
            }}
          >
            <input
              type="text"
              value={externalImageUrl}
              onChange={(event) => setExternalImageUrl(event.target.value)}
              className="min-w-0 flex-1 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
              placeholder="https://example.com/image.jpg"
            />
            <button
              type="submit"
              className="shrink-0 border border-slate-950 bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
            >
              占쏙옙占쏙옙
            </button>
          </form>
          {externalImageUrl && isExternalImageUrl(externalImageUrl.trim()) ? (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
              <button
                type="button"
                onClick={handleApplyExternalImageUrl}
                className="aspect-[4/5] overflow-hidden border border-slate-200 transition hover:border-slate-950 dark:border-slate-800 dark:hover:border-white"
                aria-label="Apply external image"
              >
                <img
                  alt=""
                  src={getPosterThumbUrl(externalImageUrl.trim())}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
              </button>
            </div>
          ) : null}
          {externalImageError ? (
            <p className="mt-2 text-xs font-semibold text-red-500">{externalImageError}</p>
          ) : null}
        </div>
      </div>
    );
  };
  const handleCopyMovieText = async () => {
    if (!movieTextForCopy) return;
    await navigator.clipboard.writeText(movieTextForCopy);
    setDidCopyText(true);
    window.setTimeout(() => setDidCopyText(false), 1200);
  };
  const handleCopyRankingText = async () => {
    if (!rankingTextForCopy) return;
    await navigator.clipboard.writeText(rankingTextForCopy);
    setDidCopyRankingText(true);
    window.setTimeout(() => setDidCopyRankingText(false), 1200);
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
            onClick={clearMovies}
            disabled={!selectedMovies.length}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Reset selected movies"
            title="Reset"
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={isCapturing || !selectedMovies.length}
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
              占쏙옙占쏙옙
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex w-full flex-wrap border border-slate-200 bg-white/72 p-1 dark:border-slate-800 dark:bg-slate-950/70 sm:inline-flex sm:w-fit">
        {[
          { key: "news-cover", label: "뉴스형" },
          { key: "news-body", label: "본문형" },
          { key: "ranking-cover", label: "순위형" },
          { key: "ranking-cover-v2", label: "순위형 v2" },
          { key: "release-board", label: "릴리즈형" },
          { key: "movie-list", label: "목록형" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setCaptureMode(item.key as CaptureMode)}
            className={[
              "h-9 min-w-0 flex-[1_1_calc(50%-0.25rem)] px-3 text-sm font-bold transition sm:flex-none sm:px-4",
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
            <MovieSlotsPanel
              isRankingMode={isRankingTextMode}
              isMovieListMode={isMovieListMode || isRankingTextMode || isReleaseMode}
              showRankingTotalAudience={showRankingTotalAudience}
              showImagePositionControls={isRankingV2Mode}
              rankingCoverMovieId={isRankingV2Mode ? rankingV2BackgroundMovieId : rankingCoverMovieId}
              selectedMoviesCount={isRankingTextMode || isReleaseMode ? Math.min(selectedMovies.length, movieSlotCount) : selectedMovies.length}
              movieSlotCount={movieSlotCount}
              movies={slots}
              dragOverIndex={dragOverIndex}
              onDragStart={handleDragStart}
              onDragOver={(index) => setDragOverIndex(index)}
              onDragLeave={(index) => setDragOverIndex((current) => (current === index ? null : current))}
              onDrop={handleDrop}
              onDragEnd={() => {
                draggedIndexRef.current = null;
                setDragOverIndex(null);
              }}
              removeMovie={removeMovie}
              updateMovieTitle={updateMovieTitle}
              updateMovieNote={updateMovieNote}
              updateMovieRankingText={updateMovieRankingText}
              updateMovieRankingTotalAudience={updateMovieRankingTotalAudience}
              updateMovieYear={updateMovieYear}
              updateMovieImagePosition={updateMovieImagePosition}
              onSelectRankingCoverMovie={(id) => {
                if (isRankingV2Mode) {
                  setRankingV2BackgroundMovieId((current) => (current === id ? null : id));
                } else {
                  setRankingCoverMovieId(id);
                }
                const nextIndex = selectedMovies.findIndex((movie) => movie.id === id);
                if (nextIndex >= 0) setPreviewMovieIndex(nextIndex);
              }}
            />
          {(isNewsMode || isBodyMode || isRankingMode) ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Photo Tone</p>
              <CaptureToggleButton
                type="button"
                active={useFilmFilter}
                onClick={() => setUseFilmFilter((current) => !current)}
                className="w-full"
              >
                ?꾩뭅 ?꾪꽣
              </CaptureToggleButton>
              <div className="mt-4">
                <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title Font</span>
                <div className="grid grid-cols-2 gap-2">
                  <CaptureToggleButton
                    type="button"
                    active={titleFontMode === "gmarket"}
                    onClick={() => setTitleFontMode("gmarket")}
                  >
                    Gmarket
                  </CaptureToggleButton>
                  <CaptureToggleButton
                    type="button"
                    active={titleFontMode === "serif"}
                    onClick={() => setTitleFontMode("serif")}
                  >
                    Serif
                  </CaptureToggleButton>
                </div>
              </div>
              {!isRankingMode && titleFontMode === "gmarket" ? (
                <label className="mt-4 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Highlight Word</span>
                  <input
                    value={highlightText}
                    onChange={(event) => setHighlightText(event.target.value)}
                    className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                    placeholder="예: 500만, 1위, 재개봉"
                  />
                </label>
              ) : null}
              {!isRankingMode && titleFontMode === "gmarket" ? (
              <div className="mt-4">
                <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title Color</span>
                <div className="grid grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => setTitleColorMode("auto")}
                    className={[
                      "h-9 border px-2 text-[11px] font-bold transition",
                      titleColorMode === "auto"
                        ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-500",
                    ].join(" ")}
                  >
                    Auto
                  </button>
                  {titleColorOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setTitleColorMode(option.key)}
                      className={[
                        "flex h-9 items-center justify-center border transition",
                        titleColorMode === option.key
                          ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20"
                          : "border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500",
                      ].join(" ")}
                      title={option.label}
                      aria-label={`Title color ${option.label}`}
                    >
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: option.value }} />
                    </button>
                  ))}
                </div>
              </div>
              ) : null}
            </div>
          ) : null}
          {(isNewsMode || isBodyMode || isRankingTextMode || isReleaseMode) ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Footer</p>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Text</span>
                <input
                  value={footerRight}
                  onChange={(event) => setFooterRight(event.target.value)}
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  placeholder="35Film"
                />
              </label>
            </div>
          ) : null}
          {isReleaseMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Release Board</p>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                <CaptureTextArea
                  value={releaseBoardTitle}
                  onChange={(event) => setReleaseBoardTitle(event.target.value)}
                  rows={2}
                  placeholder="7월 개봉예정 영화 라인업"
                />
                <CaptureSizeControls value={releaseBoardTitleSize} defaultValue={25} onChange={setReleaseBoardTitleSize} step={2} min={18} max={36} />
              </label>
              <div className="mb-3">
                <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Date Label Colors</span>
                <div className="grid grid-cols-4 gap-2">
                  {releaseBoardLabelColors.map((color, index) => (
                    <label key={`release-color-${index}`} className="flex items-center gap-2 border border-slate-200 bg-white px-2 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                      <input
                        type="color"
                        value={color}
                        onChange={(event) =>
                          setReleaseBoardLabelColors((current) =>
                            current.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)),
                          )
                        }
                        className="h-7 w-7 cursor-pointer border-0 bg-transparent p-0"
                      />
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{index + 1}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Date Labels</span>
                <div className="grid grid-cols-2 gap-2">
                  {releaseBoardDates.map((dateLabel, index) => (
                    <label key={`release-date-${index}`} className="block">
                      <span className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400">{index + 1}</span>
                      <input
                        value={dateLabel}
                        onChange={(event) =>
                          setReleaseBoardDates((current) =>
                            current.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)),
                          )
                        }
                        placeholder={getReleaseBoardAutoDate(slots[index]) || "7/1"}
                        className="h-9 w-full border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                날짜는 추가한 영화의 개봉일에서 자동으로 채우고, 직접 입력하면 그 값이 우선 표시됩니다.
              </p>
            </div>
          ) : null}
          {isNewsMode ? (
            <>
              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">News Cover</p>
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Headline</span>
                  <CaptureTextArea
                    value={newsHeadline}
                    onChange={(event) => setNewsHeadline(event.target.value)}
                    rows={2}
                    placeholder="라라랜드 10주년 재개봉"
                  />
                  <CaptureSizeControls value={newsTitleSize} defaultValue={24} onChange={setNewsTitleSize} step={2} min={18} max={34} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Accent Text</span>
                  <input
                    value={newsAccentText}
                    onChange={(event) => setNewsAccentText(event.target.value)}
                    className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                    placeholder="예: 9월 재개봉"
                  />
                </label>
                <div className="mt-4">
                  <CaptureToggleButton
                    type="button"
                    active={showNewsReview}
                    onClick={() => setShowNewsReview((current) => !current)}
                    className="w-full"
                  >
                    별점 + 한줄평
                  </CaptureToggleButton>
                </div>
                {showNewsReview ? (
                  <div className="mt-3 grid gap-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Rating</span>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        value={newsReviewRating}
                        onChange={(event) => setNewsReviewRating(event.target.value)}
                        className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                        placeholder="3.5"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">One-line Review</span>
                      <textarea
                        value={newsReviewText}
                        onChange={(event) => setNewsReviewText(event.target.value)}
                        rows={2}
                        className="w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-5 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                        placeholder="한줄평을 입력하세요"
                      />
                    </label>
                  </div>
                ) : null}
              </div>
              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Background Image</p>
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
              </div>
            </>
          ) : null}
          {isBodyMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Body Text</p>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Text</span>
                <CaptureTextArea
                  value={bodyHeadline}
                  onChange={(event) => setBodyHeadline(event.target.value)}
                  rows={4}
                  placeholder="본문에 들어갈 짧은 문구"
                />
              </label>
            </div>
          ) : null}
          {isRankingTextMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">{isRankingV2Mode ? "Ranking Cover v2" : "Ranking Cover"}</p>
              <div className="mb-3">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Daily Audience</span>
                <CaptureToggleButton
                  type="button"
                  active={showRankingDailyAudience}
                  onClick={() => setShowRankingDailyAudience((current) => !current)}
                  className="w-full"
                >
                  일일 관객 표시
                </CaptureToggleButton>
              </div>
              <div className="mb-3">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Total Audience</span>
                <CaptureToggleButton
                  type="button"
                  active={showRankingTotalAudience}
                  onClick={() => setShowRankingTotalAudience((current) => !current)}
                  className="w-full"
                  disabled={!showRankingDailyAudience}
                >
                  누적 관객 표시
                </CaptureToggleButton>
              </div>
              {isRankingV2Mode ? (
                <>
                  <div className="mb-3">
                    <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Row Background</span>
                    <CaptureToggleButton
                      type="button"
                      active={showRankingV2RowBackgrounds}
                      onClick={() => setShowRankingV2RowBackgrounds((current) => !current)}
                      className="mb-3 w-full"
                    >
                      행 배경 표시
                    </CaptureToggleButton>
                    <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Images</span>
                    <CaptureToggleButton
                      type="button"
                      active={showRankingV2Images}
                      onClick={() => setShowRankingV2Images((current) => !current)}
                      className="w-full"
                      disabled={!showRankingV2RowBackgrounds}
                    >
                      사진 표시
                    </CaptureToggleButton>
                  </div>
                  <div className="mb-3">
                    <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Background</span>
                    <div className="grid grid-cols-2 gap-2">
                      {rankingV2BackgroundPresets.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => {
                            setRankingV2BackgroundStart(preset.start);
                            setRankingV2BackgroundEnd(preset.end);
                          }}
                          className={[
                            "flex h-9 items-center gap-2 border px-2 text-[11px] font-bold transition",
                            rankingV2BackgroundStart === preset.start && rankingV2BackgroundEnd === preset.end
                              ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
                          ].join(" ")}
                        >
                          <span
                            className="h-4 w-4 rounded-full"
                            style={{ background: `linear-gradient(135deg, ${preset.start}, ${preset.end})` }}
                          />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{isRankingV2Mode ? "Title" : "Photo Headline"}</span>
                <CaptureTextArea
                  value={rankingHeadline}
                  onChange={(event) => setRankingHeadline(event.target.value)}
                  rows={2}
                  placeholder="군체 500만 관객 돌파, 박스오피스 1위"
                />
              </label>
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Date / Sub Text</span>
                <input
                  value={rankingDateLabel}
                  onChange={(event) => setRankingDateLabel(event.target.value)}
                  className="h-9 w-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  placeholder="7/23(목) 또는 넷플릭스 영화 TOP 10"
                />
              </label>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ranking Copy</span>
                  <button
                    type="button"
                    onClick={handleCopyRankingText}
                    className="h-7 border border-slate-300 bg-white px-2.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {didCopyRankingText ? "copied" : "copy"}
                  </button>
                </div>
                <pre className="max-h-44 overflow-auto whitespace-pre-wrap border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                  {rankingTextForCopy}
                </pre>
              </div>
            </div>
          ) : null}
          {isMovieListMode ? (
            <>
              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Layout</p>
                <div>
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Columns</span>
                  <div className="grid grid-cols-2 gap-2">
                    <CaptureToggleButton type="button" active={movieListColumns === 1} onClick={() => setMovieListColumns(1)}>
                      1占쏙옙
                    </CaptureToggleButton>
                    <CaptureToggleButton type="button" active={movieListColumns === 2} onClick={() => setMovieListColumns(2)}>
                      2占쏙옙
                    </CaptureToggleButton>
                  </div>
                </div>
                {movieListColumns === 2 ? (
                  <div className="mt-3">
                    <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Text Mode</span>
                    <div className="grid grid-cols-2 gap-2">
                      <CaptureToggleButton
                        type="button"
                        active={movieListTwoColumnTextMode === "corner"}
                        onClick={() => setMovieListTwoColumnTextMode("corner")}
                      >
                        占쏙옙占쏙옙 표占쏙옙
                      </CaptureToggleButton>
                      <CaptureToggleButton
                        type="button"
                        active={movieListTwoColumnTextMode === "center"}
                        onClick={() => setMovieListTwoColumnTextMode("center")}
                      >
                        占쌩억옙 占쏙옙占쏙옙
                      </CaptureToggleButton>
                    </div>
                  </div>
                ) : null}
                {movieListColumns === 2 && movieListTwoColumnTextMode === "center" ? (
                  <div className="mt-3 space-y-2">
                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Center Titles</span>
                    {movieListCenterTitleDefaults.map((defaultTitle, index) => (
                      <label key={`center-title-${index}`} className="block">
                        <span className="mb-1 block text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          {index + 1}占쏙옙
                        </span>
                        <CaptureTextArea
                          value={movieListCenterTitles[index] ?? ""}
                          onChange={(event) => updateMovieListCenterTitle(index, event.target.value)}
                          placeholder={defaultTitle}
                          rows={2}
                        />
                      </label>
                    ))}
                  </div>
                ) : null}
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
                  {movieTextForCopy || "占쏙옙화占쏙옙 占쌩곤옙占싹몌옙 占쏙옙占쏙옙占?占쌔쏙옙트占쏙옙 표占시됩니댐옙."}
                </pre>
              </div>
            </>
          ) : null}
          {isMovieListMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Single Preview Text</p>
              <div className="mb-3">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Preview Version</span>
                <div className="grid grid-cols-2 gap-2">
                  <CaptureToggleButton type="button" active={singlePreviewVariant === "default"} onClick={() => setSinglePreviewVariant("default")}>
                    占썩본
                  </CaptureToggleButton>
                  <CaptureToggleButton type="button" active={singlePreviewVariant === "spotlight"} onClick={() => setSinglePreviewVariant("spotlight")}>
                    占쏙옙占쏙옙占쏙옙占쏙옙
                  </CaptureToggleButton>
                </div>
              </div>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                <CaptureTextArea
                  value={currentSingleMovie?.singlePreviewTitle ?? currentSingleMovie?.title ?? ""}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewTitle: event.target.value })}
                  placeholder={currentSingleMovie?.title ?? "占쏙옙占쏙옙"}
                  rows={2}
                />
                <CaptureSizeControls value={singlePreviewTitleSize} defaultValue={28} onChange={setSinglePreviewTitleSize} step={2} min={16} max={48} />
              </label>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle</span>
                <input
                  value={currentSingleMovie?.singlePreviewSubtitle ?? currentSingleMovie?.original_title ?? currentSingleMovie?.title ?? ""}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewSubtitle: event.target.value })}
                  placeholder="占쏙옙占쏙옙타占쏙옙틀"
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <div className="mb-3">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle Chip</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {subtitleChipToneOptions.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSubtitleChipTone(item.key)}
                      className={[
                        "flex h-9 items-center gap-2 border px-2 text-xs font-bold transition",
                        subtitleChipTone === item.key
                          ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                      ].join(" ")}
                    >
                      <span className={["h-3 w-3 rounded-full", item.swatchClass].join(" ")} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subbody</span>
                <textarea
                  value={currentSingleMovie?.singlePreviewSubbody ?? ""}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewSubbody: event.target.value })}
                  rows={2}
                  className="w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Body</span>
                <textarea
                  value={currentSingleMovie?.singlePreviewBody ?? currentSingleMovie?.overview ?? "占쏙옙占썩에 占쏙옙占쏙옙占쏙옙 占쏙옙占쏙옙占쌍쇽옙占쏙옙.\n占쏙옙 占쌕깍옙占쏙옙 표占시됩니댐옙."}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewBody: event.target.value })}
                  rows={4}
                  className="w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <div className="grid grid-cols-4 gap-2">
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
                    checked: currentSingleMovie?.singlePreviewShowSubtitle ?? false,
                    setChecked: (next: boolean | ((current: boolean) => boolean)) => {
                      const current = currentSingleMovie?.singlePreviewShowSubtitle ?? false;
                      updateCurrentSinglePreview({ singlePreviewShowSubtitle: typeof next === "function" ? next(current) : next });
                    },
                  },
                  {
                    key: "subbody",
                    label: "Subbody",
                    checked: currentSingleMovie?.singlePreviewShowSubbody ?? true,
                    setChecked: (next: boolean | ((current: boolean) => boolean)) => {
                      const current = currentSingleMovie?.singlePreviewShowSubbody ?? true;
                      updateCurrentSinglePreview({ singlePreviewShowSubbody: typeof next === "function" ? next(current) : next });
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
          ) : null}
        </section>
        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[min(100%,390px)] sm:max-w-[420px]">
            <div
              ref={captureRef}
              className={[
                "aspect-[4/5] w-full overflow-hidden bg-slate-950 text-white",
                "shadow-[0_24px_64px_rgba(15,23,42,0.24)]",
              ].join(" ")}
            >
              {isNewsMode ? (
                <NewsCoverTemplate
                  movie={selectedMovies[previewMovieIndex]}
                  headline={newsHeadline}
                  accentText={newsAccentText}
                  titleSize={newsTitleSize}
                  titleColor={selectedTitleColor}
                  titleFontMode={titleFontMode}
                  highlightText={highlightText}
                  reviewRating={showNewsReview ? Number(newsReviewRating) : undefined}
                  reviewText={showNewsReview ? newsReviewText : undefined}
                  useFilmFilter={useFilmFilter}
                  footerRight={footerRight}
                />
              ) : isBodyMode ? (
                <NewsCoverTemplate
                  movie={selectedMovies[previewMovieIndex]}
                  headline={bodyHeadline}
                  accentText=""
                  titleSize={14}
                  titleColor="#ffffff"
                  titleFontMode="gmarket"
                  highlightText=""
                  bodyCard
                  useFilmFilter={useFilmFilter}
                  footerRight={footerRight}
                />
              ) : isRankingMode ? (
                <RankingCoverTemplate
                  movies={slots}
                  headline={rankingHeadline}
                  titleSize={newsTitleSize}
                  titleColor={selectedTitleColor}
                  titleFontMode={titleFontMode}
                  highlightText={highlightText}
                  useFilmFilter={useFilmFilter}
                  footerRight={footerRight}
                  coverMovieId={currentCoverMovie?.id}
                  dateLabel={rankingDateLabel}
                  showDailyAudience={showRankingDailyAudience}
                  showTotalAudience={showRankingTotalAudience}
                />
              ) : isRankingV2Mode ? (
                <RankingV2Template
                  movies={slots}
                  title={rankingHeadline}
                  titleSize={newsTitleSize}
                  footerRight={footerRight}
                  dateLabel={rankingDateLabel}
                  backgroundStart={rankingV2BackgroundStart}
                  backgroundEnd={rankingV2BackgroundEnd}
                  backgroundMovie={rankingV2BackgroundMovie}
                  showDailyAudience={showRankingDailyAudience}
                  showTotalAudience={showRankingTotalAudience}
                  showImages={showRankingV2Images}
                  showRowBackgrounds={showRankingV2RowBackgrounds}
                />
              ) : isReleaseMode ? (
                <ReleaseBoardTemplate
                  movies={slots}
                  title={releaseBoardTitle}
                  titleSize={releaseBoardTitleSize}
                  labelColors={releaseBoardLabelColors}
                  dateLabels={releaseBoardDateLabels}
                  footerRight={footerRight}
                />
              ) : (
              <MovieListTemplate
                slots={slots}
                columns={movieListColumns}
                twoColumnTextMode={movieListTwoColumnTextMode}
                centerTitles={movieListCenterTitles}
                footerLeft={footerLeft}
                footerRight={footerRight}
              />
              )}
            </div>
            {(isMovieListMode || isNewsMode || isBodyMode || isRankingTextMode || isReleaseMode) && selectedMovies.length ? renderMovieListImagePicker() : null}
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
                          titleSize={singlePreviewTitleSize}
                          subtitleChipClass={subtitleChipClass}
                          variant={singlePreviewVariant}
                          rank={previewMovieIndex + 1}
                          footerLeft={footerLeft}
                          footerRight={footerRight}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-56 items-center justify-center border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    占쏙옙화占쏙옙 占쌩곤옙占싹몌옙 占쏙옙占쏙옙 占싱몌옙占쏙옙占썩가 표占시됩니댐옙.
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

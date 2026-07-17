"use client";

import Title from "@/components/common/title";
import { ReleaseBoardControls } from "@/components/contents/capture/content-capture-release-board-controls";
import { CaptureSizeControls, CaptureTextArea, CaptureToggleButton } from "@/components/contents/capture/content-capture-controls";
import { MovieSlotsPanel } from "@/components/contents/capture/content-capture-movie-controls";
import { CAPTURE_PERSON_MAX_COUNT, CaptureMovie, CapturePerson, getCaptureMovieMaxCount, useCaptureContent } from "@/context/CaptureContentContext";
import { faDownload, faRotateLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarReleaseBoardTemplate,
  getCoverSubtitleClass,
  getDualPersonTitle,
  getPosterThumbUrl,
  getProfileThumbUrl,
  getProviderLogoUrl,
  getReleaseBoardAutoDate,
  isExternalImageUrl,
  MovieListTemplate,
  PersonCoverTemplate,
  RELEASE_BOARD_DEFAULT_COLORS,
  SingleMovieTemplate,
  subtitleChipToneOptions,
  toSafeFilename,
  type ProviderLogoOption,
  type SubtitleChipTone,
  formatReleaseBoardDate,
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
    updateMovieTitle,
    updateMovieNote,
    updateMovieYear,
    updateMovieImagePosition,
    updateMovieProviderLogo,
    updateMoviePoster,
    updateMovieSinglePreview,
    updatePersonProfilePath,
    clearMovies,
    clearPerson,
  } = useCaptureContent();
  const captureRef = useRef<HTMLDivElement | null>(null);
  const singleMovieCaptureRef = useRef<HTMLDivElement | null>(null);
  const personCaptureRef = useRef<HTMLDivElement | null>(null);
  const calendarReleaseCaptureRef = useRef<HTMLDivElement | null>(null);
  const calendarDayPreviewCaptureRef = useRef<HTMLDivElement | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const [personTitle, setPersonTitle] = useState("?? ??");
  const [personSubtitle, setPersonSubtitle] = useState("???? ??? ??");
  const [personSubbody, setPersonSubbody] = useState("");
  const [personBody, setPersonBody] = useState("");
  const [personShowTitle, setPersonShowTitle] = useState(true);
  const [personShowSubtitle, setPersonShowSubtitle] = useState(false);
  const [personShowSubbody, setPersonShowSubbody] = useState(true);
  const [personShowBody, setPersonShowBody] = useState(true);
  const [movieListColumns, setMovieListColumns] = useState<1 | 2>(1);
  const [movieListTwoColumnTextMode, setMovieListTwoColumnTextMode] = useState<"corner" | "center">("corner");
  const [movieListCenterTitles, setMovieListCenterTitles] = useState<string[]>([]);
  const [subtitleChipTone, setSubtitleChipTone] = useState<SubtitleChipTone>("burgundy");
  const [singlePreviewTitleSize, setSinglePreviewTitleSize] = useState(28);
  const [singlePreviewVariant, setSinglePreviewVariant] = useState<"default" | "spotlight">("default");
  const [personTitleSize, setPersonTitleSize] = useState(28);
  const [newsHeadline, setNewsHeadline] = useState("라라랜드 10주년 재개봉");
  const [bodyHeadline, setBodyHeadline] = useState("");
  const [newsAccentText, setNewsAccentText] = useState("");
  const [newsTitleSize, setNewsTitleSize] = useState(24);
  const [titleFontMode, setTitleFontMode] = useState<TitleFontMode>("gmarket");
  const [highlightText, setHighlightText] = useState("");
  const [titleColor, setTitleColor] = useState("#fff3d0");
  const [titleColorMode, setTitleColorMode] = useState<"auto" | TitleColorKey>("auto");
  const [rankingHeadline, setRankingHeadline] = useState("군체 500만 관객 돌파,\n박스오피스 1위");
  const [useFilmFilter, setUseFilmFilter] = useState(false);
  const [footerLeft, setFooterLeft] = useState("�γ��ڸ���");
  const [footerRight, setFooterRight] = useState("35Film");
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewMovieIndex, setPreviewMovieIndex] = useState(0);
  const [rankingCoverMovieId, setRankingCoverMovieId] = useState<number | null>(null);
  const [releaseBoardPreviewIndex, setReleaseBoardPreviewIndex] = useState(0);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [didCopyText, setDidCopyText] = useState(false);
  const [releaseBoardTitle, setReleaseBoardTitle] = useState("6? ???? ?? ???");
  const [releaseBoardTitleSize, setReleaseBoardTitleSize] = useState(23);
  const [releaseBoardLabelColors, setReleaseBoardLabelColors] = useState(RELEASE_BOARD_DEFAULT_COLORS);
  const [releaseBoardDates, setReleaseBoardDates] = useState(() => Array.from({ length: 8 }, () => ""));
  const [releaseBoardProviderOptions, setReleaseBoardProviderOptions] = useState<ProviderLogoOption[]>([]);
  const [externalImageUrl, setExternalImageUrl] = useState("");
  const [externalImageError, setExternalImageError] = useState("");
  const subtitleChipClass = getCoverSubtitleClass(subtitleChipTone);
  const isNewsMode = captureMode === "news-cover";
  const isBodyMode = captureMode === "news-body";
  const isRankingMode = captureMode === "ranking-cover";
  const isPersonMode = captureMode === "person-cover";
  const isMovieListMode = captureMode === "movie-list";
  const isCalendarReleaseMode = captureMode === "calendar-release";
  const isMovieMode = isNewsMode || isBodyMode || isRankingMode || isMovieListMode || isCalendarReleaseMode;
  const movieMinCount = isNewsMode ? 1 : 2;
  const movieMaxCount = getCaptureMovieMaxCount(captureMode);
  const movieSlotCount = Math.min(Math.max(selectedMovies.length, movieMinCount), movieMaxCount);
  const currentSingleMovie = selectedMovies[previewMovieIndex];
  const currentSingleMovieId = currentSingleMovie?.id ?? null;
  const rankingCoverMovie = rankingCoverMovieId
    ? selectedMovies.find((movie) => movie.id === rankingCoverMovieId)
    : undefined;
  const currentCoverMovie = isRankingMode ? rankingCoverMovie ?? selectedMovies[0] : currentSingleMovie;
  const releaseBoardSlots = Array.from({ length: 8 }, (_, index) => selectedMovies[index]);
  const releaseBoardDateLabels = releaseBoardSlots.map((movie, index) => formatReleaseBoardDate(releaseBoardDates[index]) || getReleaseBoardAutoDate(movie));
  const currentReleaseBoardMovie = releaseBoardSlots[releaseBoardPreviewIndex];
  const currentReleaseBoardProviderOptions = releaseBoardProviderOptions;
  const selectedTitleColor = titleColorMode === "auto" ? titleColor : getTitleColorValue(titleColorMode);
  const getReadableTitleColor = (rgb: [number, number, number]) => {
    const cream = [255, 243, 208];
    const mixed = cream.map((value, index) => Math.round(value * 0.68 + rgb[index] * 0.32));
    return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
  };
  useEffect(() => {
    if (selectedPersons.length === 1 && selectedPersons[0]?.name) {
      setPersonTitle(selectedPersons[0].name);
      return;
    }
    if (selectedPersons.length >= 2) {
      setPersonTitle(getDualPersonTitle(selectedPersons));
    }
  }, [movieSlotCount, selectedPersons]);
  useEffect(() => {
    setPersonBody(selectedPerson?.biography || "");
  }, [selectedPerson?.id, selectedPerson?.biography]);
  useEffect(() => {
    if (!selectedMovies.length) {
      setPreviewMovieIndex(0);
      setRankingCoverMovieId(null);
      return;
    }
    setPreviewMovieIndex((current) => Math.min(current, selectedMovies.length - 1));
  }, [selectedMovies.length]);
  useEffect(() => {
    if (!isRankingMode || !selectedMovies.length) return;
    if (rankingCoverMovieId && selectedMovies.some((movie) => movie.id === rankingCoverMovieId)) return;
    setRankingCoverMovieId(selectedMovies[0].id);
  }, [isRankingMode, rankingCoverMovieId, selectedMovies]);
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
  useEffect(() => {
    if (!isCalendarReleaseMode || releaseBoardProviderOptions.length) {
      return;
    }
    let cancelled = false;
    const loadProviderOptions = async () => {
      try {
        const response = await fetch("/api/provider-catalog");
        if (!response.ok) {
          throw new Error(`Failed to load provider catalog: ${response.status}`);
        }
        const payload = (await response.json()) as {
          results?: ProviderLogoOption[];
        };
        if (!cancelled) {
          setReleaseBoardProviderOptions(Array.isArray(payload.results) ? payload.results : []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
        }
      }
    };
    void loadProviderOptions();
    return () => {
      cancelled = true;
    };
  }, [isCalendarReleaseMode, releaseBoardProviderOptions.length]);
  const handleApplyExternalImageUrl = () => {
    const imageUrl = externalImageUrl.trim();
    if (!imageUrl) {
      setExternalImageError("�̹��� URL�� �Է����ּ���.");
      return;
    }
    if (!isExternalImageUrl(imageUrl)) {
      setExternalImageError("http:// �Ǵ� https://�� �����ϴ� �̹��� URL�� �־��ּ���.");
      return;
    }
    const imagePickerMovie = isRankingMode ? currentCoverMovie : selectedMovies[previewMovieIndex];
    if (!imagePickerMovie) return;
    updateMoviePoster(imagePickerMovie.id, imageUrl);
    setExternalImageUrl("");
    setExternalImageError("");
  };
  const handleCapture = async () => {
    const targetRef = isCalendarReleaseMode
      ? calendarReleaseCaptureRef
      : isPersonMode
        ? personCaptureRef
        : captureRef;
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
        backgroundColor: isCalendarReleaseMode ? "#221f2e" : "#111827",
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
  const movieListCenterTitleDefaults = Array.from({ length: Math.ceil(slots.length / 2) }, (_, index) => {
    const left = slots[index * 2];
    const right = slots[index * 2 + 1];
    return [left?.title, right?.title].filter(Boolean).join(" �� ") || "��ȭ�� �߰��ϼ���";
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
    const imagePickerMovie = isRankingMode ? currentCoverMovie : currentSingleMovie;
    if (!(isMovieListMode || isNewsMode || isBodyMode || isRankingMode) || !imagePickerMovie) return null;
    const imagePickerIndex = selectedMovies.findIndex((movie) => movie.id === imagePickerMovie.id);
    return (
      <div className="mt-4 overflow-hidden border border-slate-200 bg-white/72 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="p-4 pb-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Cover Image</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {imagePickerIndex + 1}/{selectedMovies.length}
            </p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {selectedMovies.map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => {
                  setPreviewMovieIndex(index);
                  if (isRankingMode) {
                    setRankingCoverMovieId(movie.id);
                  }
                }}
                className={[
                  "inline-flex h-8 min-w-8 items-center justify-center border px-2 text-xs font-bold transition",
                  isRankingMode ? (rankingCoverMovieId ?? selectedMovies[0]?.id) === movie.id : previewMovieIndex === index
                    ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                ].join(" ")}
              >
                {index + 1}
              </button>
            ))}
          </div>
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
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">�̹��� �ּҸ� �ٿ������� ��� ������� ���� �����信 ���� ����˴ϴ�.</p>
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
              ����
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
            disabled={isPersonMode ? !selectedPerson : !selectedMovies.length}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Reset selected movies"
            title="Reset"
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={isCapturing || (isPersonMode ? !selectedPerson : !selectedMovies.length)}
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
              ����
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex w-full flex-wrap border border-slate-200 bg-white/72 p-1 dark:border-slate-800 dark:bg-slate-950/70 sm:inline-flex sm:w-fit">
        {[
          { key: "news-cover", label: "뉴스형" },
          { key: "news-body", label: "본문형" },
          { key: "ranking-cover", label: "순위형" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setCaptureMode(item.key as "news-cover" | "news-body" | "ranking-cover")}
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
          {isCalendarReleaseMode ? (
              <ReleaseBoardControls
              selectedMoviesCount={selectedMovies.length}
              releaseBoardTitle={releaseBoardTitle}
              setReleaseBoardTitle={setReleaseBoardTitle}
              releaseBoardTitleSize={releaseBoardTitleSize}
              setReleaseBoardTitleSize={setReleaseBoardTitleSize}
              releaseBoardLabelColors={releaseBoardLabelColors}
              setReleaseBoardLabelColors={setReleaseBoardLabelColors}
              releaseBoardDates={releaseBoardDates}
              setReleaseBoardDates={setReleaseBoardDates}
              releaseBoardPlaceholders={releaseBoardSlots.map((movie) => getReleaseBoardAutoDate(movie) || "6/5")}
              footerLeft={footerLeft}
              setFooterLeft={setFooterLeft}
              footerRight={footerRight}
              setFooterRight={setFooterRight}
            />
          ) : isMovieMode ? (
          <>
            <MovieSlotsPanel
              isCalendarReleaseMode={isCalendarReleaseMode}
              isRankingMode={isRankingMode}
              isMovieListMode={isMovieListMode || isRankingMode}
              rankingCoverMovieId={rankingCoverMovieId}
              selectedMoviesCount={selectedMovies.length}
              movieSlotCount={movieSlotCount}
              movies={isCalendarReleaseMode ? releaseBoardSlots : slots}
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
              updateMovieYear={updateMovieYear}
              updateMovieImagePosition={updateMovieImagePosition}
              onSelectRankingCoverMovie={(id) => {
                setRankingCoverMovieId(id);
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
                필카 필터
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
              {titleFontMode === "gmarket" ? (
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
              {titleFontMode === "gmarket" ? (
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
          {(isNewsMode || isBodyMode || isRankingMode) ? (
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
          {isRankingMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Ranking Cover</p>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Photo Headline</span>
                <CaptureTextArea
                  value={rankingHeadline}
                  onChange={(event) => setRankingHeadline(event.target.value)}
                  rows={2}
                  placeholder="군체 500만 관객 돌파, 박스오피스 1위"
                />
              </label>
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
                      1��
                    </CaptureToggleButton>
                    <CaptureToggleButton type="button" active={movieListColumns === 2} onClick={() => setMovieListColumns(2)}>
                      2��
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
                        ���� ǥ��
                      </CaptureToggleButton>
                      <CaptureToggleButton
                        type="button"
                        active={movieListTwoColumnTextMode === "center"}
                        onClick={() => setMovieListTwoColumnTextMode("center")}
                      >
                        �߾� ����
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
                          {index + 1}��
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
                  {movieTextForCopy || "��ȭ�� �߰��ϸ� ����� �ؽ�Ʈ�� ǥ�õ˴ϴ�."}
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
                    �⺻
                  </CaptureToggleButton>
                  <CaptureToggleButton type="button" active={singlePreviewVariant === "spotlight"} onClick={() => setSinglePreviewVariant("spotlight")}>
                    ��������
                  </CaptureToggleButton>
                </div>
              </div>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                <CaptureTextArea
                  value={currentSingleMovie?.singlePreviewTitle ?? currentSingleMovie?.title ?? ""}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewTitle: event.target.value })}
                  placeholder={currentSingleMovie?.title ?? "����"}
                  rows={2}
                />
                <CaptureSizeControls value={singlePreviewTitleSize} defaultValue={28} onChange={setSinglePreviewTitleSize} step={2} min={16} max={48} />
              </label>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle</span>
                <input
                  value={currentSingleMovie?.singlePreviewSubtitle ?? currentSingleMovie?.original_title ?? currentSingleMovie?.title ?? ""}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewSubtitle: event.target.value })}
                  placeholder="����Ÿ��Ʋ"
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
                  value={currentSingleMovie?.singlePreviewBody ?? currentSingleMovie?.overview ?? "���⿡ ������ �����ּ���.\n�� �ٱ��� ǥ�õ˴ϴ�."}
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
          ) : (
            <>
              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Person</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedPersons.length}/{CAPTURE_PERSON_MAX_COUNT}</p>
                </div>
                <div className="flex flex-col gap-3">
                  {selectedPersons.length ? (
                    selectedPersons.map((person, index) => (
                      <div key={person.id} className="border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="flex items-start gap-3">
                          {person.profile_path ? (
                            <img
                              alt=""
                              src={getProfileThumbUrl(person.profile_path)}
                              className="h-20 w-14 shrink-0 object-cover"
                            />
                          ) : (
                            <div className="h-20 w-14 shrink-0 bg-slate-200 dark:bg-slate-800" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{person.name}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{person.known_for_department ?? "������ �̹����� ������ �� �ֽ��ϴ�"}</p>
                            <p className="mt-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">�ι� {index + 1}</p>
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
                        <label className="mt-3 block">
                          <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Custom image URL</span>
                          <input
                            value={person.profile_path?.startsWith("http") || person.profile_path?.startsWith("//") ? person.profile_path : ""}
                            onChange={(event) => updatePersonProfilePath(person.id, event.target.value.trim())}
                            placeholder="https://..."
                            className="h-9 w-full border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                          />
                        </label>
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
                      ��� �˻����� �ι��� �ִ� {CAPTURE_PERSON_MAX_COUNT}������ �߰��ϼ���
                    </div>
                  )}
                </div>
              </div>
              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Cover Text</p>
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                  <CaptureTextArea
                    value={personTitle}
                    onChange={(event) => setPersonTitle(event.target.value)}
                    rows={2}
                  />
                  <CaptureSizeControls value={personTitleSize} defaultValue={28} onChange={setPersonTitleSize} step={2} min={24} max={48} />
                </label>
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle</span>
                  <input
                    value={personSubtitle}
                    onChange={(event) => setPersonSubtitle(event.target.value)}
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
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Body</span>
                  <textarea
                    value={personBody}
                    onChange={(event) => setPersonBody(event.target.value)}
                    placeholder={selectedPerson?.biography ? "" : "�ι� ����"}
                    rows={2}
                    className="min-h-20 w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subbody</span>
                  <textarea
                    value={personSubbody}
                    onChange={(event) => setPersonSubbody(event.target.value)}
                    rows={2}
                    className="min-h-16 w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {[
                    { key: "title", label: "Title", checked: personShowTitle, setChecked: setPersonShowTitle },
                    { key: "subtitle", label: "Subtitle", checked: personShowSubtitle, setChecked: setPersonShowSubtitle },
                    { key: "subbody", label: "Subbody", checked: personShowSubbody, setChecked: setPersonShowSubbody },
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
              </div>
            </>
          )}
        </section>
        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[min(100%,390px)] sm:max-w-[420px]">
            <div
              ref={isCalendarReleaseMode ? calendarReleaseCaptureRef : captureMode === "person-cover" ? personCaptureRef : captureRef}
              className={[
                isCalendarReleaseMode ? "aspect-[4/5] w-full overflow-hidden bg-[#221f2e] text-white" : "aspect-[4/5] w-full overflow-hidden bg-slate-950 text-white",
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
                />
              ) : isCalendarReleaseMode ? (
                <CalendarReleaseBoardTemplate
                  movies={releaseBoardSlots}
                  title={releaseBoardTitle}
                  titleSize={releaseBoardTitleSize}
                  labelColors={releaseBoardLabelColors}
                  dateLabels={releaseBoardDateLabels}
                />
              ) : captureMode === "person-cover" ? (
                <PersonCoverTemplate
                  persons={selectedPersons}
                  headline={personTitle}
                  titleSize={personTitleSize}
                  kicker={personSubtitle}
                  subtitleChipClass={subtitleChipClass}
                  subbody={personSubbody}
                  body={personBody}
                  showTitle={personShowTitle}
                  showSubtitle={personShowSubtitle}
                  showSubbody={personShowSubbody}
                  showBody={personShowBody}
                  footerLeft={footerLeft}
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
            {(isMovieListMode || isNewsMode || isBodyMode || isRankingMode) && selectedMovies.length ? renderMovieListImagePicker() : null}
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
                    {selectedMovies.length ? "������ ��ȭ�� ������ �ɼ��� ������ ���� �����Ͱ� �״�� ���˴ϴ�." : "��ȭ�� �߰��ϸ� ������ ������ ǥ�õ˴ϴ�."}
                  </div>
                )}
                {currentReleaseBoardMovie ? (
                  <div className="m-4 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Provider Logo</p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {currentReleaseBoardProviderOptions.length}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      <button
                        type="button"
                        onClick={() => updateMovieProviderLogo(currentReleaseBoardMovie.id, "")}
                        className={[
                          "flex aspect-square items-center justify-center border text-[11px] font-bold transition",
                          !currentReleaseBoardMovie.providerLogoPath
                            ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                        ].join(" ")}
                      >
                        ����
                      </button>
                      {currentReleaseBoardProviderOptions.map((provider) => (
                        <button
                          key={`${provider.provider_id}-${provider.logo_path ?? "none"}`}
                          type="button"
                          onClick={() => updateMovieProviderLogo(currentReleaseBoardMovie.id, provider.logo_path ?? "", provider.provider_name)}
                          className={[
                            "aspect-square overflow-hidden border p-0.5 transition",
                            currentReleaseBoardMovie.providerLogoPath === provider.logo_path
                              ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20"
                              : "border-slate-200 dark:border-slate-800",
                          ].join(" ")}
                          title={provider.provider_name}
                          aria-label={`Select ${provider.provider_name} logo`}
                        >
                          <img
                            alt={provider.provider_name}
                            src={getProviderLogoUrl(provider.logo_path)}
                            className="h-full w-full rounded-md object-cover"
                            crossOrigin="anonymous"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
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
                    ��ȭ�� �߰��ϸ� ���� �̸����Ⱑ ǥ�õ˴ϴ�.
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

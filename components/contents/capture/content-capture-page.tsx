"use client";

import Title from "@/components/common/title";
import { CaptureTextArea, CaptureTextInput, CaptureToggleButton } from "@/components/contents/capture/content-capture-controls";
import { MovieSlotsPanel } from "@/components/contents/capture/content-capture-movie-controls";
import { CaptureMovie, CaptureMode, getCaptureMovieMaxCount, sanitizeSinglePreviewSubbody, useCaptureContent } from "@/context/CaptureContentContext";
import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getPosterThumbUrl,
  isExternalImageUrl,
  MovieCollageTemplate,
  MovieListTemplate,
  ReleaseBoardTemplate,
  RankingV2Template,
  RankingV3Template,
  type RankingV2TitleDisplay,
  type ReleaseBoardTextPlacement,
  type MovieListMetaMode,
  type MovieListTextSize,
  type MovieListTextStyle,
  formatYear,
} from "@/components/contents/capture/content-capture-templates";
import {
  NewsCoverTemplate,
  RankingCoverTemplate,
  type RankingCoverLayout,
  type RankingCoverRankLabelMode,
} from "@/components/contents/capture/content-capture-social-templates";
import { getBackdropUrl, getPosterUrl } from "@/components/contents/capture/content-capture-utils";
import { CAPTURE_TEXT } from "@/lib/capture-defaults";
import { FastAverageColor } from "fast-average-color";

function getYesterdayBoxOfficeDateLabel() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const date = String(yesterday.getDate()).padStart(2, "0");
  return `*${yesterday.getFullYear()}.${month}.${date}(${weekdays[yesterday.getDay()]}) 박스오피스 기준`;
}

function toReleaseLabelColor(rgb: [number, number, number]) {
  const [r, g, b] = rgb.map((value) => Math.round(value * 0.68));
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function toScaledHexColor(rgb: [number, number, number], scale: number) {
  const [r, g, b] = rgb.map((value) => Math.max(0, Math.min(255, Math.round(value * scale))));
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
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

const NEWS_HEADER_DEFAULT_SIZE = 22;
const POSTER_IMAGE_PICKER_PAGE_SIZE = 16;
const BACKDROP_IMAGE_PICKER_PAGE_SIZE = 10;

async function waitForCaptureImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map(async (image) => {
      if (!image.currentSrc && !image.src) return;
      if (!image.complete) {
        await new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      }

      if (typeof image.decode === "function") {
        try {
          await image.decode();
        } catch {
          // Broken fallback images should not block capture.
        }
      }
    }),
  );
}

function getMovieListCaptureStart(index: number, chunkSize: number) {
  return Math.max(0, Math.floor(index / chunkSize) * chunkSize);
}

export default function ContentCapturePage() {
  const {
    captureMode,
    setCaptureMode,
    selectedMovies,
    removeMovie,
    reorderMovie,
    updateMovieTitle,
    updateMovieRankingText,
    updateMovieRankingDailyAudience,
    updateMovieRankingDailyAudienceUnit,
    updateMovieRankingTotalAudience,
    updateMovieReleaseBadge,
    updateMovieYear,
    updateMovieImagePosition,
    updateMovieImagePositionX,
    updateMoviePoster,
    updateMovieBackdrop,
    updateMovieLogo,
    updateMovieSinglePreview,
    clearMovies,
  } = useCaptureContent();
  const captureRef = useRef<HTMLDivElement | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const previousMovieCountRef = useRef(0);
  const [movieListColumns, setMovieListColumns] = useState<1 | 2>(1);
  const [movieListTwoColumnTextMode, setMovieListTwoColumnTextMode] = useState<"corner" | "center">("corner");
  const [movieListMetaMode, setMovieListMetaMode] = useState<MovieListMetaMode>("year");
  const [showMovieListHeadline, setShowMovieListHeadline] = useState(false);
  const [movieListCenterTitles, setMovieListCenterTitles] = useState<string[]>([]);
  const [captureHeadline, setCaptureHeadline] = useState<string>(CAPTURE_TEXT.newsHeadline);
  const [captureSubText, setCaptureSubText] = useState<string>(getYesterdayBoxOfficeDateLabel);
  const [newsBottomTitle, setNewsBottomTitle] = useState("라라랜드 10주년\n재개봉 확정");
  const [newsBodyText, setNewsBodyText] = useState<string>(CAPTURE_TEXT.newsBodyText);
  const [newsDisplayMode, setNewsDisplayMode] = useState<"default" | "review" | "body">("default");
  const [newsBodySplitDirection, setNewsBodySplitDirection] = useState<"vertical" | "horizontal">("vertical");
  const [newsReviewRating, setNewsReviewRating] = useState("3.5");
  const [newsReviewText, setNewsReviewText] = useState("");
  const [rankingDailyAudienceLabel, setRankingDailyAudienceLabel] = useState("일일 관객");
  const [rankingTotalAudienceLabel, setRankingTotalAudienceLabel] = useState("누적 관객");
  const [rankingCoverLayout, setRankingCoverLayout] = useState<RankingCoverLayout>("default");
  const [rankingCoverRankLabelMode, setRankingCoverRankLabelMode] = useState<RankingCoverRankLabelMode>("rank");
  const [rankingV2TitleDisplay, setRankingV2TitleDisplay] = useState<RankingV2TitleDisplay>("title");
  const [rankingCoverAllRowsWhite, setRankingCoverAllRowsWhite] = useState(false);
  const [showRankingDailyAudience, setShowRankingDailyAudience] = useState(true);
  const [showRankingTotalAudience, setShowRankingTotalAudience] = useState(true);
  const [showRankingV2Ranks, setShowRankingV2Ranks] = useState(true);
  const [showRankingV2Images, setShowRankingV2Images] = useState(true);
  const [showRankingV2RowBackgrounds, setShowRankingV2RowBackgrounds] = useState(true);
  const [rankingV2BackgroundStart, setRankingV2BackgroundStart] = useState("#7a3f52");
  const [rankingV2BackgroundEnd, setRankingV2BackgroundEnd] = useState("#34384c");
  const [rankingV2RowBackgroundColors, setRankingV2RowBackgroundColors] = useState<string[]>([]);
  const [releaseBoardColumns, setReleaseBoardColumns] = useState(4);
  const [releaseBoardTextPlacement, setReleaseBoardTextPlacement] = useState<ReleaseBoardTextPlacement>("inside");
  const [releaseBoardShowLogos, setReleaseBoardShowLogos] = useState(true);
  const [isExtractingRankingRowColors, setIsExtractingRankingRowColors] = useState(false);
  const [footerLeft, setFooterLeft] = useState(CAPTURE_TEXT.footerLeft);
  const [footerRight, setFooterRight] = useState<string>(CAPTURE_TEXT.footerRight);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewMovieIndex, setPreviewMovieIndex] = useState(0);
  const [movieListCaptureChunkSize, setMovieListCaptureChunkSize] = useState(1);
  const [showMovieListBody, setShowMovieListBody] = useState(true);
  const [movieListTextStyle, setMovieListTextStyle] = useState<MovieListTextStyle>("box");
  const [movieListSubbodyTextSize, setMovieListSubbodyTextSize] = useState<MovieListTextSize>("large");
  const [movieListBodyTextSize, setMovieListBodyTextSize] = useState<MovieListTextSize>("small");
  const [movieListBaseYear, setMovieListBaseYear] = useState("");
  const [movieCollageBackgroundStart, setMovieCollageBackgroundStart] = useState("#07131a");
  const [movieCollageBackgroundEnd, setMovieCollageBackgroundEnd] = useState("#221f2e");
  const [isExtractingMovieCollageColors, setIsExtractingMovieCollageColors] = useState(false);
  const [movieListCaptureStartIndex, setMovieListCaptureStartIndex] = useState(0);
  const [rankingCoverMovieIds, setRankingCoverMovieIds] = useState<number[]>([]);
  const [rankingV2BackgroundMovieId, setRankingV2BackgroundMovieId] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [didCopyText, setDidCopyText] = useState(false);
  const [didCopyRankingText, setDidCopyRankingText] = useState(false);
  const [externalImageUrl, setExternalImageUrl] = useState("");
  const [externalImageError, setExternalImageError] = useState("");
  const [imagePickerImageTab, setImagePickerImageTab] = useState<"poster" | "backdrop">("poster");
  const [imagePickerPage, setImagePickerPage] = useState(0);
  const isNewsMode = captureMode === "news-cover";
  const isRankingMode = captureMode === "ranking-cover";
  const isRankingV2Mode = captureMode === "ranking-cover-v2";
  const isRankingV3Mode = captureMode === "ranking-cover-v3";
  const isRankingTextMode = isRankingMode || isRankingV2Mode || isRankingV3Mode;
  const isReleaseMode = captureMode === "release-board";
  const isMovieListMode = captureMode === "movie-list";
  const isMovieCollageMode = captureMode === "movie-collage";
  const isMovieMode = isNewsMode || isRankingTextMode || isReleaseMode || isMovieListMode || isMovieCollageMode;
  const movieMinCount = isNewsMode ? 1 : isMovieCollageMode ? 3 : isReleaseMode ? 8 : 2;
  const movieMaxCount = getCaptureMovieMaxCount(captureMode);
  const rankingSlotCount =
    isRankingMode && rankingCoverLayout === "vertical" ? Math.max(movieMinCount, Math.min(selectedMovies.length, movieMaxCount)) : isRankingV2Mode && selectedMovies.length > 10 ? 11 : 10;
  const releaseSlotCount = Math.max(selectedMovies.length, 8);
  const movieSlotCount = isRankingTextMode
    ? rankingSlotCount
    : isReleaseMode
    ? releaseSlotCount
    : Math.min(Math.max(selectedMovies.length, movieMinCount), movieMaxCount);
  const currentSingleMovie = selectedMovies[previewMovieIndex];
  const currentSingleMovieId = currentSingleMovie?.id ?? null;
  const rankingV2BackgroundMovie = rankingV2BackgroundMovieId
    ? selectedMovies.find((movie) => movie.id === rankingV2BackgroundMovieId)
    : undefined;
  const currentCoverMovie = isRankingV2Mode ? rankingV2BackgroundMovie : currentSingleMovie;
  const movieCollageColorImageUrl = getBackdropUrl(selectedMovies[0]) || getPosterUrl(selectedMovies[0]) || "";
  const captureHeadlinePlaceholder = isReleaseMode
    ? CAPTURE_TEXT.releaseBoardTitle
    : isRankingTextMode
      ? CAPTURE_TEXT.rankingHeadline
      : CAPTURE_TEXT.newsHeadline;
  const captureSubTextPlaceholder = isNewsMode
    ? currentSingleMovie?.singlePreviewSubtitle ?? ""
    : isRankingTextMode
      ? getYesterdayBoxOfficeDateLabel()
      : getYesterdayBoxOfficeDateLabel();
  const captureSubTextValue = captureSubText || captureSubTextPlaceholder;
  useEffect(() => {
    if (!selectedMovies.length) {
      setPreviewMovieIndex(0);
      setMovieListCaptureStartIndex(0);
      setRankingV2BackgroundMovieId(null);
      previousMovieCountRef.current = 0;
      return;
    }
    if (isMovieListMode && selectedMovies.length > previousMovieCountRef.current) {
      const nextIndex = selectedMovies.length - 1;
      setPreviewMovieIndex(nextIndex);
      setMovieListCaptureStartIndex(getMovieListCaptureStart(nextIndex, movieListCaptureChunkSize));
      previousMovieCountRef.current = selectedMovies.length;
      return;
    }
    setPreviewMovieIndex((current) => Math.min(current, selectedMovies.length - 1));
    setMovieListCaptureStartIndex((current) => Math.min(current, getMovieListCaptureStart(selectedMovies.length - 1, movieListCaptureChunkSize)));
    previousMovieCountRef.current = selectedMovies.length;
  }, [isMovieListMode, movieListCaptureChunkSize, selectedMovies.length]);
  useEffect(() => {
    if (!rankingV2BackgroundMovieId) return;
    if (selectedMovies.some((movie) => movie.id === rankingV2BackgroundMovieId)) return;
    setRankingV2BackgroundMovieId(null);
  }, [rankingV2BackgroundMovieId, selectedMovies]);

  const extractMovieCollageBackgroundColors = async (imageUrl = movieCollageColorImageUrl) => {
    if (!imageUrl) return;

    const averageColor = new FastAverageColor();
    setIsExtractingMovieCollageColors(true);

    try {
      const color = await averageColor.getColorAsync(imageUrl, { crossOrigin: "anonymous" });
      const rgb: [number, number, number] = [color.value[0], color.value[1], color.value[2]];
      setMovieCollageBackgroundStart(toScaledHexColor(rgb, 0.78));
      setMovieCollageBackgroundEnd(toScaledHexColor(rgb, 0.42));
    } catch {
      setMovieCollageBackgroundStart("#07131a");
      setMovieCollageBackgroundEnd("#221f2e");
    } finally {
      averageColor.destroy();
      setIsExtractingMovieCollageColors(false);
    }
  };

  useEffect(() => {
    if (!isMovieCollageMode || !movieCollageColorImageUrl) return;
    void extractMovieCollageBackgroundColors(movieCollageColorImageUrl);
  }, [isMovieCollageMode, movieCollageColorImageUrl]);
  useEffect(() => {
    setRankingCoverMovieIds((current) => current.filter((id) => selectedMovies.some((movie) => movie.id === id)).slice(0, 2));
  }, [selectedMovies]);
  useEffect(() => {
    setExternalImageUrl("");
    setExternalImageError("");
    setImagePickerPage(0);
  }, [currentSingleMovieId]);
  useEffect(() => {
    setImagePickerPage(0);
  }, [imagePickerImageTab]);
  const handleApplyExternalImageUrl = () => {
    const imageUrl = externalImageUrl.trim();
    if (!imageUrl) {
      setExternalImageError(CAPTURE_TEXT.externalImageRequired);
      return;
    }
    if (!isExternalImageUrl(imageUrl)) {
      setExternalImageError(CAPTURE_TEXT.externalImageInvalid);
      return;
    }
    const imagePickerMovie = isRankingTextMode ? currentCoverMovie : selectedMovies[previewMovieIndex];
    if (!imagePickerMovie) return;
    if (imagePickerImageTab === "backdrop") {
      updateMovieBackdrop(imagePickerMovie.id, imageUrl);
    } else {
      updateMoviePoster(imagePickerMovie.id, imageUrl);
    }
    setExternalImageUrl("");
    setExternalImageError("");
  };
  const handleCapture = async () => {
    const targetRef = captureRef;
    if (!targetRef.current || isCapturing) return;
    const captureElement = async () => {
      if (!targetRef.current) return "";
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await waitForCaptureImages(targetRef.current);
      const rect = targetRef.current.getBoundingClientRect();
      const captureWidth = Math.max(1, Math.round(rect.width));
      const captureHeight = Math.max(1, Math.round(rect.height));
      return toPng(targetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#111827",
        width: captureWidth,
        height: captureHeight,
        canvasWidth: captureWidth * 2,
        canvasHeight: captureHeight * 2,
      });
    };

    try {
      setIsCapturing(true);

      if (isMovieListMode) {
        const originalStartIndex = movieListCaptureStartIndex;
        try {
          for (let startIndex = 0; startIndex < selectedMovies.length; startIndex += movieListCaptureChunkSize) {
            setMovieListCaptureStartIndex(startIndex);
            const dataUrl = await captureElement();
            if (!dataUrl) continue;
            const chunkNumber = Math.floor(startIndex / movieListCaptureChunkSize) + 1;
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `tovie-movie-list-${String(chunkNumber).padStart(2, "0")}-${new Date().toISOString().slice(0, 10)}.png`;
            link.click();
            await new Promise((resolve) => window.setTimeout(resolve, 120));
          }
        } finally {
          setMovieListCaptureStartIndex(originalStartIndex);
        }
        return;
      }

      const dataUrl = await captureElement();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `tovie-${captureMode}-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } finally {
      setIsCapturing(false);
    }
  };
  const slots = Array.from({ length: movieSlotCount }, (_, index) => selectedMovies[index]);
  const movieListCaptureSlots = Array.from(
    { length: movieListCaptureChunkSize },
    (_, index) => selectedMovies[movieListCaptureStartIndex + index],
  );
  const movieListChunkCount = Math.max(1, Math.ceil(selectedMovies.length / movieListCaptureChunkSize));
  const movieListCurrentChunk = Math.floor(movieListCaptureStartIndex / movieListCaptureChunkSize);
  const movieListCaptureCenterTitles = [movieListCenterTitles[movieListCurrentChunk] ?? ""];
  const movieListCenterTitleDefaults = Array.from({ length: Math.ceil(slots.length / 2) }, (_, index) => {
    const left = slots[index * 2];
    const right = slots[index * 2 + 1];
    return [left?.title, right?.title].filter(Boolean).join(CAPTURE_TEXT.movieListPairSeparator) || CAPTURE_TEXT.movieListCenterTitleFallback;
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
    () => Array.from({ length: Math.min(rankingSlotCount, selectedMovies.length) }, (_, index) => `${index + 1}위 ${selectedMovies[index]?.title ?? ""}`).join("\n"),
    [rankingSlotCount, selectedMovies],
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
  const updateMovieListCaptureChunkSize = (nextSize: number) => {
    const clampedSize = Math.min(10, Math.max(1, nextSize));
    setMovieListCaptureChunkSize(clampedSize);
    setMovieListCaptureStartIndex((current) => getMovieListCaptureStart(current, clampedSize));
  };
  const handleSelectImagePickerMovie = (index: number) => {
    setPreviewMovieIndex(index);
    if (isMovieListMode) {
      setMovieListCaptureStartIndex(getMovieListCaptureStart(index, movieListCaptureChunkSize));
    }
  };
  const handleExtractRankingRowBackgroundColors = async () => {
    if (isExtractingRankingRowColors) return;

    const averageColor = new FastAverageColor();
    setIsExtractingRankingRowColors(true);

    try {
      const nextColors = await Promise.all(
        slots.slice(0, rankingSlotCount).map(async (movie, index) => {
          const imageUrl = getPosterUrl(movie) || getBackdropUrl(movie);
          if (!imageUrl) return rankingV2RowBackgroundColors[index] || "#221f2e";

          try {
            const color = await averageColor.getColorAsync(imageUrl, { crossOrigin: "anonymous" });
            return toReleaseLabelColor([color.value[0], color.value[1], color.value[2]]);
          } catch {
            return rankingV2RowBackgroundColors[index] || "#221f2e";
          }
        }),
      );

      setRankingV2RowBackgroundColors(nextColors);
    } finally {
      averageColor.destroy();
      setIsExtractingRankingRowColors(false);
    }
  };
  const renderMovieListImagePicker = () => {
    const imagePickerMovie = isRankingTextMode ? currentCoverMovie : currentSingleMovie;
    if (!(isMovieListMode || isNewsMode || isRankingTextMode || isReleaseMode) || !imagePickerMovie) return null;
    const imagePickerIndex = selectedMovies.findIndex((movie) => movie.id === imagePickerMovie.id);
    const imageOptions = imagePickerImageTab === "backdrop" ? imagePickerMovie.backdropOptions : imagePickerMovie.posterOptions;
    const selectedImagePath = imagePickerImageTab === "backdrop" ? imagePickerMovie.backdrop_path : imagePickerMovie.poster_path;
    const selectedImageCount = imageOptions?.length ?? 0;
    const imagePickerPageSize = imagePickerImageTab === "backdrop" ? BACKDROP_IMAGE_PICKER_PAGE_SIZE : POSTER_IMAGE_PICKER_PAGE_SIZE;
    const imagePageCount = Math.max(1, Math.ceil(selectedImageCount / imagePickerPageSize));
    const currentImagePage = Math.min(imagePickerPage, imagePageCount - 1);
    const pagedImageOptions = imageOptions?.slice(
      currentImagePage * imagePickerPageSize,
      (currentImagePage + 1) * imagePickerPageSize,
    );
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
                onClick={() => handleSelectImagePickerMovie(index)}
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
        <div className="mx-4 mb-3 flex border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900/70">
          {[
            { key: "poster", label: "포스터", count: imagePickerMovie.posterOptions?.length ?? 0 },
            { key: "backdrop", label: "배경사진", count: imagePickerMovie.backdropOptions?.length ?? 0 },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setImagePickerImageTab(item.key as "poster" | "backdrop")}
              className={[
                "flex-1 px-3 py-2 text-xs font-bold transition",
                imagePickerImageTab === item.key
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-100 dark:text-slate-950"
                  : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
              ].join(" ")}
            >
              {item.label} {item.count}
            </button>
          ))}
        </div>
        {pagedImageOptions?.length ? (
          <div className="m-4 mt-0 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Image</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {currentImagePage + 1}/{imagePageCount} · {selectedImageCount}
              </p>
            </div>
            <div className={imagePickerImageTab === "backdrop" ? "grid grid-cols-2 gap-2" : "grid grid-cols-4 gap-2 sm:grid-cols-5"}>
              {pagedImageOptions.map((imagePath) => (
                <button
                  key={imagePath}
                  type="button"
                  onClick={() => {
                    if (imagePickerImageTab === "backdrop") {
                      updateMovieBackdrop(imagePickerMovie.id, imagePath);
                    } else {
                      updateMoviePoster(imagePickerMovie.id, imagePath);
                    }
                  }}
                  className={[
                    imagePickerImageTab === "backdrop"
                      ? "aspect-video overflow-hidden border transition"
                      : "aspect-[4/5] overflow-hidden border transition",
                    selectedImagePath === imagePath
                      ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20"
                      : "border-slate-200 dark:border-slate-800",
                  ].join(" ")}
                  aria-label="Select cover image"
                >
                  <img alt="" src={getPosterThumbUrl(imagePath)} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            {imagePageCount > 1 ? (
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setImagePickerPage(0)}
                  disabled={currentImagePage === 0}
                  className="border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white dark:hover:text-white"
                >
                  처음
                </button>
                <button
                  type="button"
                  onClick={() => setImagePickerPage((current) => Math.max(0, current - 1))}
                  disabled={currentImagePage === 0}
                  className="border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white dark:hover:text-white"
                >
                  이전
                </button>
                <div className="flex min-w-0 flex-1 flex-wrap justify-center gap-1">
                  {Array.from({ length: imagePageCount }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setImagePickerPage(index)}
                      className={[
                        "h-7 min-w-7 border px-2 text-xs font-bold transition",
                        currentImagePage === index
                          ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                      ].join(" ")}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setImagePickerPage((current) => Math.min(imagePageCount - 1, current + 1))}
                  disabled={currentImagePage >= imagePageCount - 1}
                  className="border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white dark:hover:text-white"
                >
                  다음
                </button>
                <button
                  type="button"
                  onClick={() => setImagePickerPage(imagePageCount - 1)}
                  disabled={currentImagePage >= imagePageCount - 1}
                  className="border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white dark:hover:text-white"
                >
                  끝
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="m-4 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mb-3">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">External Image</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{CAPTURE_TEXT.externalImageHelp}</p>
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
              {CAPTURE_TEXT.apply}
            </button>
          </form>
          {externalImageUrl && isExternalImageUrl(externalImageUrl.trim()) ? (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
              <button
                type="button"
                onClick={handleApplyExternalImageUrl}
                className={[
                  "overflow-hidden border border-slate-200 transition hover:border-slate-950 dark:border-slate-800 dark:hover:border-white",
                  imagePickerImageTab === "backdrop" ? "aspect-video" : "aspect-[4/5]",
                ].join(" ")}
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
            className="inline-flex h-10 shrink-0 items-center justify-center border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Reset selected movies"
            title="Reset"
          >
            reset
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={isCapturing || !selectedMovies.length}
            className="inline-flex h-10 flex-1 items-center justify-center border border-slate-900 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-default disabled:opacity-45 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white sm:flex-none"
          >
            {isCapturing ? "capturing" : "download"}
          </button>
        </div>
      </div>
      <div className="flex w-full flex-wrap border border-slate-200 bg-white/72 p-1 dark:border-slate-800 dark:bg-slate-950/70 sm:inline-flex sm:w-fit">
        {[
          { key: "news-cover", label: "뉴스형" },
          { key: "ranking-cover", label: "순위형" },
          { key: "ranking-cover-v2", label: "순위형 V2" },
          { key: "ranking-cover-v3", label: "순위형 V3" },
          { key: "release-board", label: "릴리즈형" },
          { key: "movie-list", label: "목록형" },
          { key: "movie-collage", label: "콜라주형" },
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
              isMovieListCaptureMode={isMovieListMode}
              isMovieCollageMode={isMovieCollageMode}
              isRankingV2Mode={isRankingV2Mode || isRankingV3Mode}
              isReleaseMode={isReleaseMode}
              movieListMetaMode={movieListMetaMode}
              movieListBaseYear={movieListBaseYear}
              showRankingTotalAudience={showRankingTotalAudience}
              showImagePositionControls={isRankingV2Mode || isRankingV3Mode || isMovieCollageMode}
              rankingCoverMovieId={rankingV2BackgroundMovieId}
              rankingCoverMovieIds={isRankingV2Mode || isRankingV3Mode ? undefined : rankingCoverMovieIds}
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
              updateMovieRankingText={updateMovieRankingText}
              updateMovieRankingDailyAudience={updateMovieRankingDailyAudience}
              updateMovieRankingDailyAudienceUnit={updateMovieRankingDailyAudienceUnit}
              updateMovieRankingTotalAudience={updateMovieRankingTotalAudience}
              updateMovieReleaseBadge={updateMovieReleaseBadge}
              updateMovieYear={updateMovieYear}
              updateMovieImagePosition={updateMovieImagePosition}
              updateMovieImagePositionX={updateMovieImagePositionX}
              updateMovieLogo={updateMovieLogo}
              onSelectRankingCoverMovie={(id) => {
                if (isRankingV2Mode || isRankingV3Mode) {
                  setRankingV2BackgroundMovieId((current) => (current === id ? null : id));
                } else {
                  setRankingCoverMovieIds((current) => {
                    if (current.includes(id)) return current.filter((coverId) => coverId !== id);
                    return [...current, id].slice(-2);
                  });
                }
                const nextIndex = selectedMovies.findIndex((movie) => movie.id === id);
                if (nextIndex >= 0) setPreviewMovieIndex(nextIndex);
              }}
            />
          {(isNewsMode || isRankingTextMode || isReleaseMode || isMovieListMode || isMovieCollageMode) ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Cover Text</p>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Headline</span>
                <CaptureTextArea
                  value={captureHeadline}
                  onChange={(event) => setCaptureHeadline(event.target.value)}
                  rows={2}
                  placeholder={captureHeadlinePlaceholder}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Sub Text</span>
                <CaptureTextArea
                  value={captureSubText}
                  onChange={(event) => setCaptureSubText(event.target.value)}
                  rows={2}
                  placeholder={captureSubTextPlaceholder}
                />
              </label>
            </div>
          ) : null}
          {(isNewsMode || isRankingTextMode || isReleaseMode || isMovieCollageMode) ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Footer</p>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Text</span>
                <input
                  value={footerRight}
                  onChange={(event) => setFooterRight(event.target.value)}
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  placeholder={CAPTURE_TEXT.footerRight}
                />
              </label>
            </div>
          ) : null}
          {isReleaseMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Release Board</p>
              <div className="mb-3">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Text Position</span>
                <div className="grid grid-cols-3 gap-2">
                  <CaptureToggleButton
                    type="button"
                    active={releaseBoardTextPlacement === "inside"}
                    onClick={() => setReleaseBoardTextPlacement("inside")}
                  >
                    포스터 안
                  </CaptureToggleButton>
                  <CaptureToggleButton
                    type="button"
                    active={releaseBoardTextPlacement === "below"}
                    onClick={() => setReleaseBoardTextPlacement("below")}
                  >
                    포스터 밑
                  </CaptureToggleButton>
                  <CaptureToggleButton
                    type="button"
                    active={releaseBoardTextPlacement === "none"}
                    onClick={() => setReleaseBoardTextPlacement("none")}
                  >
                    없음
                  </CaptureToggleButton>
                </div>
              </div>
              <div className="mb-3">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">TMDB Logo</span>
                <CaptureToggleButton
                  type="button"
                  active={releaseBoardShowLogos}
                  onClick={() => setReleaseBoardShowLogos((current) => !current)}
                  className="w-full"
                >
                  로고 표시
                </CaptureToggleButton>
              </div>
              <div>
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Grid Columns</span>
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] gap-2">
                  <CaptureToggleButton
                    type="button"
                    active={false}
                    onClick={() => setReleaseBoardColumns((current) => Math.max(1, current - 1))}
                    aria-label="Decrease release grid columns"
                  >
                    -
                  </CaptureToggleButton>
                  <div className="flex h-8 items-center justify-center border border-slate-200 bg-white text-xs font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100">
                    {releaseBoardColumns}
                  </div>
                  <CaptureToggleButton
                      type="button"
                    active={false}
                    onClick={() => setReleaseBoardColumns((current) => Math.min(12, current + 1))}
                    aria-label="Increase release grid columns"
                  >
                    +
                  </CaptureToggleButton>
                </div>
              </div>
            </div>
          ) : null}
          {isMovieCollageMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Collage Cover</p>
              <div>
                <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Cover Background</span>
                <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] gap-2">
                  <div
                    className="h-9 border border-slate-200 dark:border-slate-800"
                    style={{ background: `linear-gradient(135deg, ${movieCollageBackgroundStart}, ${movieCollageBackgroundEnd})` }}
                  />
                  <CaptureToggleButton
                    type="button"
                    active={false}
                    onClick={() => void extractMovieCollageBackgroundColors()}
                    disabled={!movieCollageColorImageUrl || isExtractingMovieCollageColors}
                  >
                    {isExtractingMovieCollageColors ? "추출중" : "재추출"}
                  </CaptureToggleButton>
                </div>
              </div>
            </div>
          ) : null}
          {isNewsMode ? (
            <>
              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">News Cover</p>
                <div className="mb-3">
                  <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Type</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "default", label: "기본" },
                      { key: "review", label: "별점+한줄평" },
                      { key: "body", label: "본문형" },
                    ].map((item) => (
                      <CaptureToggleButton
                        key={item.key}
                        type="button"
                        active={newsDisplayMode === item.key}
                        onClick={() => setNewsDisplayMode(item.key as "default" | "review" | "body")}
                      >
                        {item.label}
                      </CaptureToggleButton>
                    ))}
                  </div>
                </div>
                {newsDisplayMode === "body" ? (
                  <>
                    {selectedMovies.length > 1 ? (
                      <div className="mb-3">
                        <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Photo Split</span>
                        <div className="grid grid-cols-2 gap-2">
                          <CaptureToggleButton
                            type="button"
                            active={newsBodySplitDirection === "vertical"}
                            onClick={() => setNewsBodySplitDirection("vertical")}
                          >
                            세로분할
                          </CaptureToggleButton>
                          <CaptureToggleButton
                            type="button"
                            active={newsBodySplitDirection === "horizontal"}
                            onClick={() => setNewsBodySplitDirection("horizontal")}
                          >
                            가로분할
                          </CaptureToggleButton>
                        </div>
                      </div>
                    ) : null}
                    <label className="mb-3 block">
                      <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Bottom Text</span>
                      <CaptureTextArea
                        value={newsBodyText}
                        onChange={(event) => setNewsBodyText(event.target.value)}
                        rows={4}
                        placeholder="하단에 들어갈 짧은 문구"
                      />
                    </label>
                  </>
                ) : null}
                {newsDisplayMode === "default" ? (
                  <label className="mb-3 block">
                    <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Bottom Title</span>
                    <CaptureTextArea
                      value={newsBottomTitle}
                      onChange={(event) => setNewsBottomTitle(event.target.value)}
                      rows={2}
                      placeholder="하단 제목을 입력하세요"
                    />
                  </label>
                ) : null}
                {newsDisplayMode === "review" ? (
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
          {isRankingTextMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Ranking Cover</p>
              {!isRankingV2Mode ? (
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Layout</span>
                  <div className="grid grid-cols-2 gap-2">
                    <CaptureToggleButton
                      type="button"
                      active={rankingCoverLayout === "default"}
                      onClick={() => setRankingCoverLayout("default")}
                    >
                      기본
                    </CaptureToggleButton>
                    <CaptureToggleButton
                      type="button"
                      active={rankingCoverLayout === "vertical"}
                      onClick={() => setRankingCoverLayout("vertical")}
                    >
                      세로분할
                    </CaptureToggleButton>
                  </div>
                </div>
              ) : null}
              {!isRankingV2Mode ? (
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Left Label</span>
                  <div className="grid grid-cols-2 gap-2">
                    <CaptureToggleButton
                      type="button"
                      active={rankingCoverRankLabelMode === "rank"}
                      onClick={() => setRankingCoverRankLabelMode("rank")}
                    >
                      순위
                    </CaptureToggleButton>
                    <CaptureToggleButton
                      type="button"
                      active={rankingCoverRankLabelMode === "year"}
                      onClick={() => setRankingCoverRankLabelMode("year")}
                    >
                      년도
                    </CaptureToggleButton>
                  </div>
                </div>
              ) : null}
              {!isRankingV2Mode ? (
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Text Color</span>
                  <CaptureToggleButton
                    type="button"
                    active={rankingCoverAllRowsWhite}
                    onClick={() => setRankingCoverAllRowsWhite((current) => !current)}
                    className="w-full"
                  >
                    전체 흰색
                  </CaptureToggleButton>
                </div>
              ) : null}
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
              {!isRankingV2Mode ? (
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Daily Label</span>
                    <CaptureTextInput
                      value={rankingDailyAudienceLabel}
                      onChange={(event) => setRankingDailyAudienceLabel(event.target.value)}
                      maxLength={8}
                      placeholder="일일 관객"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Total Label</span>
                    <CaptureTextInput
                      value={rankingTotalAudienceLabel}
                      onChange={(event) => setRankingTotalAudienceLabel(event.target.value)}
                      maxLength={8}
                      placeholder="누적 관객"
                    />
                  </label>
                </div>
              ) : null}
              {isRankingV2Mode || isRankingV3Mode ? (
                <>
                  <div className="mb-3">
                    <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Movie Label</span>
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <CaptureToggleButton
                        type="button"
                        active={rankingV2TitleDisplay === "title"}
                        onClick={() => setRankingV2TitleDisplay("title")}
                      >
                        제목
                      </CaptureToggleButton>
                      <CaptureToggleButton
                        type="button"
                        active={rankingV2TitleDisplay === "logo"}
                        onClick={() => setRankingV2TitleDisplay("logo")}
                      >
                        로고
                      </CaptureToggleButton>
                    </div>
                    <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Rank</span>
                    <CaptureToggleButton
                      type="button"
                      active={showRankingV2Ranks}
                      onClick={() => setShowRankingV2Ranks((current) => !current)}
                      className="mb-3 w-full"
                    >
                      순위 표시
                    </CaptureToggleButton>
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
                    <CaptureToggleButton
                      type="button"
                      active={false}
                      onClick={handleExtractRankingRowBackgroundColors}
                      className="mt-2 w-full"
                      disabled={isExtractingRankingRowColors}
                    >
                      {isExtractingRankingRowColors ? "추출 중..." : "행 배경 포스터색"}
                    </CaptureToggleButton>
                  </div>
                </>
              ) : null}
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
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Headline</span>
                  <div className="grid grid-cols-2 gap-2">
                    <CaptureToggleButton type="button" active={showMovieListHeadline} onClick={() => setShowMovieListHeadline(true)}>
                      표시
                    </CaptureToggleButton>
                    <CaptureToggleButton type="button" active={!showMovieListHeadline} onClick={() => setShowMovieListHeadline(false)}>
                      숨김
                    </CaptureToggleButton>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Split</span>
                  <div className="grid grid-cols-[40px_1fr_40px] gap-2">
                    <CaptureToggleButton type="button" active={false} onClick={() => updateMovieListCaptureChunkSize(movieListCaptureChunkSize - 1)}>
                      ←
                    </CaptureToggleButton>
                    <div className="flex h-8 items-center justify-center border border-slate-200 bg-white text-xs font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                      {movieListCaptureChunkSize}개씩
                    </div>
                    <CaptureToggleButton type="button" active={false} onClick={() => updateMovieListCaptureChunkSize(movieListCaptureChunkSize + 1)}>
                      →
                    </CaptureToggleButton>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">1~10개까지 조절</p>
                </div>
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Body</span>
                  <div className="grid grid-cols-3 gap-2">
                    <CaptureToggleButton
                      type="button"
                      active={showMovieListBody && movieListTextStyle === "box"}
                      onClick={() => {
                        setShowMovieListBody(true);
                        setMovieListTextStyle("box");
                      }}
                    >
                      상자
                    </CaptureToggleButton>
                    <CaptureToggleButton
                      type="button"
                      active={showMovieListBody && movieListTextStyle === "plain"}
                      onClick={() => {
                        setShowMovieListBody(true);
                        setMovieListTextStyle("plain");
                      }}
                    >
                      흰글자
                    </CaptureToggleButton>
                    <CaptureToggleButton type="button" active={!showMovieListBody} onClick={() => setShowMovieListBody(false)}>
                      끄기
                    </CaptureToggleButton>
                  </div>
                </div>
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">기준연도</span>
                  <input
                    value={movieListBaseYear}
                    onChange={(event) => setMovieListBaseYear(event.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                    placeholder="예: 2002"
                    inputMode="numeric"
                    className="h-8 w-full border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subbody Size</span>
                  <div className="grid grid-cols-2 gap-2">
                    <CaptureToggleButton type="button" active={movieListSubbodyTextSize === "small"} onClick={() => setMovieListSubbodyTextSize("small")}>
                      작게
                    </CaptureToggleButton>
                    <CaptureToggleButton type="button" active={movieListSubbodyTextSize === "large"} onClick={() => setMovieListSubbodyTextSize("large")}>
                      크게
                    </CaptureToggleButton>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Body Size</span>
                  <div className="grid grid-cols-2 gap-2">
                    <CaptureToggleButton type="button" active={movieListBodyTextSize === "small"} onClick={() => setMovieListBodyTextSize("small")}>
                      작게
                    </CaptureToggleButton>
                    <CaptureToggleButton type="button" active={movieListBodyTextSize === "large"} onClick={() => setMovieListBodyTextSize("large")}>
                      크게
                    </CaptureToggleButton>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Capture Page</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: movieListChunkCount }, (_, index) => {
                      const start = index * movieListCaptureChunkSize;
                      const end = Math.min(start + movieListCaptureChunkSize, selectedMovies.length || movieListCaptureChunkSize);

                      return (
                        <button
                          key={`movie-list-page-${index}`}
                          type="button"
                          onClick={() => setMovieListCaptureStartIndex(start)}
                          className={[
                            "h-8 border px-2 text-[11px] font-bold transition",
                            movieListCurrentChunk === index
                              ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                          ].join(" ")}
                        >
                          {start + 1}-{end}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Columns</span>
                  <div className="grid grid-cols-2 gap-2">
                    <CaptureToggleButton type="button" active={movieListColumns === 1} onClick={() => setMovieListColumns(1)}>
                      {CAPTURE_TEXT.oneColumnJoinLabel}
                    </CaptureToggleButton>
                    <CaptureToggleButton type="button" active={movieListColumns === 2} onClick={() => setMovieListColumns(2)}>
                      {CAPTURE_TEXT.twoColumnJoinLabel}
                    </CaptureToggleButton>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Meta Text</span>
                  <div className="grid grid-cols-2 gap-2">
                    <CaptureToggleButton type="button" active={movieListMetaMode === "year"} onClick={() => setMovieListMetaMode("year")}>
                      연도
                    </CaptureToggleButton>
                    <CaptureToggleButton type="button" active={movieListMetaMode === "release-date"} onClick={() => setMovieListMetaMode("release-date")}>
                      개봉날짜
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
                        {CAPTURE_TEXT.textModeCorner}
                      </CaptureToggleButton>
                      <CaptureToggleButton
                        type="button"
                        active={movieListTwoColumnTextMode === "center"}
                        onClick={() => setMovieListTwoColumnTextMode("center")}
                      >
                        {CAPTURE_TEXT.textModeCenter}
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
                          {index + 1}{CAPTURE_TEXT.rowLabelSuffix}
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
                  {movieTextForCopy || CAPTURE_TEXT.movieCopyEmpty}
                </pre>
              </div>
            </>
          ) : null}
          {isMovieListMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Movie Text</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {selectedMovies.length ? `${previewMovieIndex + 1}/${selectedMovies.length}` : "empty"}
                </p>
              </div>
              {selectedMovies.length ? (
                <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                  {selectedMovies.map((movie, index) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => handleSelectImagePickerMovie(index)}
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
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subbody</span>
                <textarea
                  value={sanitizeSinglePreviewSubbody(currentSingleMovie?.singlePreviewSubbody)}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewSubbody: event.target.value })}
                  rows={2}
                  className="w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Body</span>
                <textarea
                  value={currentSingleMovie?.singlePreviewBody ?? currentSingleMovie?.overview ?? CAPTURE_TEXT.singlePreviewBody}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewBody: event.target.value })}
                  rows={4}
                  className="w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
            </div>
          ) : null}
          </>
          ) : null}
        </section>
        <section className="flex w-full justify-start overflow-x-auto pb-2 sm:justify-center lg:justify-end">
          <div className="w-[420px] max-w-none shrink-0">
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
                  secondaryMovie={newsDisplayMode === "body" ? selectedMovies.find((_, index) => index !== previewMovieIndex) : undefined}
                  headline={captureHeadline}
                  subText={captureSubTextValue}
                  titleSize={NEWS_HEADER_DEFAULT_SIZE}
                  bodyCard={newsDisplayMode === "body"}
                  bodySplitDirection={newsBodySplitDirection}
                  bottomTitle={newsDisplayMode === "default" ? newsBottomTitle : undefined}
                  bodyText={newsDisplayMode === "body" ? newsBodyText : undefined}
                  reviewRating={newsDisplayMode === "review" ? Number(newsReviewRating) : undefined}
                  reviewText={newsDisplayMode === "review" ? newsReviewText : undefined}
                  footerRight={footerRight}
                />
              ) : isRankingMode ? (
                <RankingCoverTemplate
                  movies={slots}
                  headline={captureHeadline}
                  titleSize={NEWS_HEADER_DEFAULT_SIZE}
                  footerRight={footerRight}
                  coverMovieId={currentCoverMovie?.id}
                  coverMovieIds={rankingCoverMovieIds}
                  dateLabel={captureSubTextValue}
                  dailyAudienceLabel={rankingDailyAudienceLabel}
                  totalAudienceLabel={rankingTotalAudienceLabel}
                  showDailyAudience={showRankingDailyAudience}
                  showTotalAudience={showRankingTotalAudience}
                  layout={rankingCoverLayout}
                  rankLabelMode={rankingCoverRankLabelMode}
                  allRowsWhite={rankingCoverAllRowsWhite}
                  rowCount={rankingSlotCount}
                  isCapturing={isCapturing}
                />
              ) : isRankingV2Mode ? (
                <RankingV2Template
                  movies={slots}
                  title={captureHeadline}
                  titleSize={NEWS_HEADER_DEFAULT_SIZE}
                  footerRight={footerRight}
                  dateLabel={captureSubTextValue}
                  backgroundStart={rankingV2BackgroundStart}
                  backgroundEnd={rankingV2BackgroundEnd}
                  rowBackgroundColors={rankingV2RowBackgroundColors}
                  backgroundMovie={rankingV2BackgroundMovie}
                  showDailyAudience={showRankingDailyAudience}
                  showTotalAudience={showRankingTotalAudience}
                  showRanks={showRankingV2Ranks}
                  showImages={showRankingV2Images}
                  showRowBackgrounds={showRankingV2RowBackgrounds}
                  titleDisplay={rankingV2TitleDisplay}
                />
              ) : isRankingV3Mode ? (
                <RankingV3Template
                  movies={slots}
                  title={captureHeadline}
                  titleSize={NEWS_HEADER_DEFAULT_SIZE}
                  footerRight={footerRight}
                  dateLabel={captureSubTextValue}
                  backgroundStart={rankingV2BackgroundStart}
                  backgroundEnd={rankingV2BackgroundEnd}
                  backgroundMovie={rankingV2BackgroundMovie}
                  showDailyAudience={showRankingDailyAudience}
                  showTotalAudience={showRankingTotalAudience}
                  showRanks={showRankingV2Ranks}
                  showImages={showRankingV2Images}
                  titleDisplay={rankingV2TitleDisplay}
                />
              ) : isMovieCollageMode ? (
                <MovieCollageTemplate
                  movies={slots}
                  title={captureHeadline}
                  subtitle={captureSubTextValue}
                  titleSize={NEWS_HEADER_DEFAULT_SIZE}
                  footerRight={footerRight}
                  backgroundStart={movieCollageBackgroundStart}
                  backgroundEnd={movieCollageBackgroundEnd}
                />
              ) : isReleaseMode ? (
                <ReleaseBoardTemplate
                  movies={slots}
                  title={captureHeadline}
                  subtitle={captureSubTextValue}
                  titleSize={NEWS_HEADER_DEFAULT_SIZE}
                  columns={releaseBoardColumns}
                  textPlacement={releaseBoardTextPlacement}
                  showLogos={releaseBoardShowLogos}
                  footerRight={footerRight}
                />
              ) : (
              <MovieListTemplate
                slots={movieListCaptureSlots}
                headline={captureHeadline}
                subtitle={captureSubTextValue}
                titleSize={NEWS_HEADER_DEFAULT_SIZE}
                showHeadline={showMovieListHeadline}
                columns={movieListColumns}
                twoColumnTextMode={movieListTwoColumnTextMode}
                centerTitles={movieListCaptureCenterTitles}
                metaMode={movieListMetaMode}
                baseYear={movieListBaseYear}
                showBody={showMovieListBody}
                textStyle={movieListTextStyle}
                subbodyTextSize={movieListSubbodyTextSize}
                bodyTextSize={movieListBodyTextSize}
                footerLeft={footerLeft}
                footerRight={footerRight}
              />
              )}
            </div>
            {(isMovieListMode || isNewsMode || isRankingTextMode || isReleaseMode || isMovieCollageMode) && selectedMovies.length ? renderMovieListImagePicker() : null}
          </div>
        </section>
      </div>
    </div>
  );
}

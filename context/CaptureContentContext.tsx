"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { CAPTURE_TEXT } from "@/lib/capture-defaults";

export type CaptureMovie = {
  id: number;
  media_type?: "movie" | "tv";
  title: string;
  original_title?: string;
  overview?: string;
  release_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  note?: string;
  rankingText?: string;
  rankingDailyAudience?: string;
  rankingDailyAudienceUnit?: string;
  rankingTotalAudience?: string;
  releaseBadge?: boolean;
  imagePositionX?: number;
  imagePosition?: number;
  posterOptions?: string[];
  singlePreviewTitle?: string;
  singlePreviewSubtitle?: string;
  singlePreviewSubbody?: string;
  singlePreviewBody?: string;
  singlePreviewTextPosition?: "top" | "center" | "bottom";
  singlePreviewShowTitle?: boolean;
  singlePreviewShowSubtitle?: boolean;
  singlePreviewShowSubbody?: boolean;
  singlePreviewShowBody?: boolean;
};

export type CaptureMode = "news-cover" | "ranking-cover" | "ranking-cover-v2" | "release-board" | "movie-list";

export function getCaptureMovieMaxCount(captureMode: CaptureMode) {
  if (captureMode === "release-board") return Infinity;
  if (captureMode === "ranking-cover") return 10;
  if (captureMode === "ranking-cover-v2") return 11;
  if (captureMode === "movie-list") return 24;
  return 5;
}

type CaptureContentContextValue = {
  captureMode: CaptureMode;
  setCaptureMode: (mode: CaptureMode) => void;
  selectedMovies: CaptureMovie[];
  addMovie: (movie: CaptureMovie) => boolean;
  removeMovie: (id: number) => void;
  moveMovie: (id: number, direction: "up" | "down") => void;
  reorderMovie: (fromIndex: number, toIndex: number) => void;
  updateMovieTitle: (id: number, title: string) => void;
  updateMovieRankingText: (id: number, value: string) => void;
  updateMovieRankingDailyAudience: (id: number, value: string) => void;
  updateMovieRankingDailyAudienceUnit: (id: number, value: string) => void;
  updateMovieRankingTotalAudience: (id: number, value: string) => void;
  updateMovieReleaseBadge: (id: number, value: boolean) => void;
  updateMovieYear: (id: number, year: string) => void;
  updateMovieImagePosition: (id: number, imagePosition: number) => void;
  updateMovieImagePositionX: (id: number, imagePositionX: number) => void;
  updateMoviePoster: (id: number, posterPath: string) => void;
  updateMovieSinglePreview: (
    id: number,
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
  ) => void;
  clearMovies: () => void;
  hasMovie: (id: number, mediaType?: CaptureMovie["media_type"]) => boolean;
};

const CaptureContentContext = createContext<CaptureContentContextValue | undefined>(undefined);
export function sanitizeSinglePreviewSubbody(value: string | undefined) {
  let hasMetaLine = false;

  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (/^감독\s*[:|]/.test(line)) return false;
      if (/^출연\s*[:|]/.test(line)) return false;
      if (!hasMetaLine) {
        hasMetaLine = true;
        return true;
      }
      return false;
    })
    .join("\n");
}

function normalizeMovie(movie: any): CaptureMovie | null {
  const id = Number(movie?.id);
  const title = movie?.title || movie?.name;
  const mediaType = movie?.media_type === "tv" ? "tv" : "movie";

  if (!Number.isFinite(id) || !title) {
    return null;
  }

  return {
    id,
    media_type: mediaType,
    title,
    original_title: movie.original_title || movie.original_name,
    overview: movie.overview,
    release_date: movie.release_date || movie.first_air_date,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average,
    note: movie.note,
    rankingText: movie.rankingText,
    rankingDailyAudience: movie.rankingDailyAudience ?? "1,000",
    rankingDailyAudienceUnit: movie.rankingDailyAudienceUnit,
    rankingTotalAudience: movie.rankingTotalAudience,
    releaseBadge: Boolean(movie.releaseBadge),
    imagePositionX: typeof movie.imagePositionX === "number" ? movie.imagePositionX : 50,
    imagePosition: typeof movie.imagePosition === "number" ? movie.imagePosition : 20,
    posterOptions: movie.posterOptions,
    singlePreviewTitle: movie.singlePreviewTitle ?? title,
    singlePreviewSubtitle: movie.singlePreviewSubtitle ?? (movie.original_title || movie.original_name || title),
    singlePreviewSubbody: sanitizeSinglePreviewSubbody(movie.singlePreviewSubbody),
    singlePreviewBody: movie.singlePreviewBody ?? movie.overview ?? CAPTURE_TEXT.singlePreviewBody,
    singlePreviewTextPosition: movie.singlePreviewTextPosition ?? "center",
    singlePreviewShowTitle: movie.singlePreviewShowTitle ?? true,
    singlePreviewShowSubtitle: movie.singlePreviewShowSubtitle ?? false,
    singlePreviewShowBody: movie.singlePreviewShowBody ?? true,
  };
}

export function CaptureContentProvider({ children }: { children: React.ReactNode }) {
  const [captureMode, setCaptureMode] = useState<CaptureMode>("news-cover");
  const [selectedMovies, setSelectedMovies] = useState<CaptureMovie[]>([]);

  const addMovie = (movie: CaptureMovie) => {
    const normalizedMovie = normalizeMovie(movie);
    if (!normalizedMovie) return false;
    const maxMovies = getCaptureMovieMaxCount(captureMode);
    let didAdd = false;

    setSelectedMovies((current) => {
      if (current.some((item) => item.id === normalizedMovie.id && item.media_type === normalizedMovie.media_type) || current.length >= maxMovies) {
        return current;
      }
      didAdd = true;
      return [...current, normalizedMovie];
    });
    return didAdd;
  };

  const removeMovie = (id: number) => {
    setSelectedMovies((current) => current.filter((movie) => movie.id !== id));
  };

  const moveMovie = (id: number, direction: "up" | "down") => {
    setSelectedMovies((current) => {
      const currentIndex = current.findIndex((movie) => movie.id === id);
      if (currentIndex < 0) return current;

      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const nextMovies = [...current];
      const [movie] = nextMovies.splice(currentIndex, 1);
      nextMovies.splice(nextIndex, 0, movie);
      return nextMovies;
    });
  };

  const reorderMovie = (fromIndex: number, toIndex: number) => {
    setSelectedMovies((current) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= current.length || toIndex >= current.length) {
        return current;
      }

      const nextMovies = [...current];
      const [movie] = nextMovies.splice(fromIndex, 1);
      nextMovies.splice(toIndex, 0, movie);
      return nextMovies;
    });
  };

  const updateMovieTitle = (id: number, title: string) => {
    setSelectedMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? {
              ...movie,
              title,
              singlePreviewTitle:
                !movie.singlePreviewTitle || movie.singlePreviewTitle === movie.title
                  ? title
                  : movie.singlePreviewTitle,
            }
          : movie,
      ),
    );
  };

  const updateMovieRankingText = (id: number, value: string) => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, rankingText: value.trim() } : movie)),
    );
  };

  const updateMovieRankingDailyAudience = (id: number, value: string) => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, rankingDailyAudience: value.trim() } : movie)),
    );
  };

  const updateMovieRankingDailyAudienceUnit = (id: number, value: string) => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, rankingDailyAudienceUnit: value.trim() } : movie)),
    );
  };

  const updateMovieRankingTotalAudience = (id: number, value: string) => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, rankingTotalAudience: value.trim() } : movie)),
    );
  };

  const updateMovieReleaseBadge = (id: number, value: boolean) => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, releaseBadge: value } : movie)),
    );
  };

  const updateMovieYear = (id: number, year: string) => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, release_date: year } : movie)),
    );
  };

  const updateMovieImagePosition = (id: number, imagePosition: number) => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, imagePosition: Math.max(0, Math.min(100, imagePosition)) } : movie)),
    );
  };

  const updateMovieImagePositionX = (id: number, imagePositionX: number) => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, imagePositionX: Math.max(0, Math.min(100, imagePositionX)) } : movie)),
    );
  };

  const updateMoviePoster = (id: number, posterPath: string) => {
    setSelectedMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? {
              ...movie,
              poster_path: posterPath,
              backdrop_path: posterPath,
              posterOptions: posterPath
                ? Array.from(new Set([...(movie.posterOptions ?? []), posterPath]))
                : movie.posterOptions,
            }
          : movie,
      ),
    );
  };

  const updateMovieSinglePreview = (
    id: number,
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
    const nextPatch =
      "singlePreviewSubbody" in patch
        ? {
            ...patch,
            singlePreviewSubbody: sanitizeSinglePreviewSubbody(patch.singlePreviewSubbody),
          }
        : patch;

    setSelectedMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? {
              ...movie,
              ...nextPatch,
            }
          : movie,
      ),
    );
  };

  const clearMovies = () => {
    setSelectedMovies([]);
  };

  const hasMovie = (id: number, mediaType: CaptureMovie["media_type"] = "movie") =>
    selectedMovies.some((movie) => movie.id === id && movie.media_type === mediaType);

  const value = useMemo(
    () => ({
      captureMode,
      setCaptureMode,
      selectedMovies,
      addMovie,
      removeMovie,
      moveMovie,
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
      updateMovieSinglePreview,
      clearMovies,
      hasMovie,
    }),
    [captureMode, selectedMovies],
  );

  return <CaptureContentContext.Provider value={value}>{children}</CaptureContentContext.Provider>;
}

export function useCaptureContent() {
  const context = useContext(CaptureContentContext);

  if (!context) {
    throw new Error("useCaptureContent must be used within CaptureContentProvider");
  }

  return context;
}

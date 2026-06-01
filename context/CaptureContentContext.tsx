"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type CaptureMovie = {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  release_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  note?: string;
  noteMode?: "custom" | "rotten";
  posterOptions?: string[];
  rottenTomatometer?: string | null;
  rottenPopcornmeter?: string | null;
  rottenTomatoesUrl?: string | null;
  singlePreviewTitle?: string;
  singlePreviewSubtitle?: string;
  singlePreviewBody?: string;
  singlePreviewTextPosition?: "top" | "center" | "bottom";
  singlePreviewShowTitle?: boolean;
  singlePreviewShowSubtitle?: boolean;
  singlePreviewShowBody?: boolean;
};

export type CaptureMode = "movie-list" | "movie-cover" | "person-cover" | "calendar";

export type CapturePerson = {
  id: number;
  name: string;
  profile_path?: string;
  known_for_department?: string;
  birthday?: string;
  place_of_birth?: string;
  biography?: string;
  profileOptions?: string[];
};

type CaptureContentContextValue = {
  captureMode: CaptureMode;
  setCaptureMode: (mode: CaptureMode) => void;
  selectedMovies: CaptureMovie[];
  selectedPerson: CapturePerson | null;
  addMovie: (movie: CaptureMovie) => boolean;
  setPerson: (person: CapturePerson) => void;
  removeMovie: (id: number) => void;
  moveMovie: (id: number, direction: "up" | "down") => void;
  reorderMovie: (fromIndex: number, toIndex: number) => void;
  updateMovieNote: (id: number, note: string) => void;
  updateMovieNoteMode: (id: number, noteMode: "custom" | "rotten") => void;
  updateMoviePoster: (id: number, posterPath: string) => void;
  updateMovieRottenScore: (
    id: number,
    patch: {
      rottenTomatometer?: string | null;
      rottenPopcornmeter?: string | null;
      rottenTomatoesUrl?: string | null;
    },
  ) => void;
  updateMovieSinglePreview: (
    id: number,
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
  ) => void;
  updatePersonProfilePath: (profilePath: string) => void;
  clearMovies: () => void;
  clearPerson: () => void;
  hasMovie: (id: number) => boolean;
};

const CaptureContentContext = createContext<CaptureContentContextValue | undefined>(undefined);

function normalizeMovie(movie: any): CaptureMovie | null {
  const id = Number(movie?.id);
  const title = movie?.title || movie?.name;

  if (!Number.isFinite(id) || !title) {
    return null;
  }

  return {
    id,
    title,
    original_title: movie.original_title,
    overview: movie.overview,
    release_date: movie.release_date,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average,
    note: movie.note,
    noteMode: movie.noteMode === "rotten" ? "rotten" : "custom",
    posterOptions: movie.posterOptions,
    rottenTomatometer: movie.rottenTomatometer ?? null,
    rottenPopcornmeter: movie.rottenPopcornmeter ?? null,
    rottenTomatoesUrl: movie.rottenTomatoesUrl ?? null,
    singlePreviewTitle: movie.singlePreviewTitle ?? title,
    singlePreviewSubtitle: movie.singlePreviewSubtitle ?? (movie.original_title || title),
    singlePreviewBody: movie.singlePreviewBody ?? "여기에 설명을 적어주세요.\n두 줄까지 표시됩니다.",
    singlePreviewTextPosition: movie.singlePreviewTextPosition ?? "center",
    singlePreviewShowTitle: movie.singlePreviewShowTitle ?? true,
    singlePreviewShowSubtitle: movie.singlePreviewShowSubtitle ?? true,
    singlePreviewShowBody: movie.singlePreviewShowBody ?? true,
  };
}

export function CaptureContentProvider({ children }: { children: React.ReactNode }) {
  const [captureMode, setCaptureMode] = useState<CaptureMode>("person-cover");
  const [selectedMovies, setSelectedMovies] = useState<CaptureMovie[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<CapturePerson | null>(null);

  const addMovie = (movie: CaptureMovie) => {
    const normalizedMovie = normalizeMovie(movie);
    if (!normalizedMovie) return false;

    if (selectedMovies.some((item) => item.id === normalizedMovie.id) || selectedMovies.length >= 5) {
      return false;
    }

    setSelectedMovies((current) => [...current, normalizedMovie]);
    return true;
  };

  const setPerson = (person: CapturePerson) => {
    setSelectedPerson(person);
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

  const updateMovieNote = (id: number, note: string) => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, note } : movie)),
    );
  };

  const updateMovieNoteMode = (id: number, noteMode: "custom" | "rotten") => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, noteMode } : movie)),
    );
  };

  const updateMoviePoster = (id: number, posterPath: string) => {
    setSelectedMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? {
              ...movie,
              poster_path: posterPath,
            }
          : movie,
      ),
    );
  };

  const updateMovieRottenScore = (
    id: number,
    patch: {
      rottenTomatometer?: string | null;
      rottenPopcornmeter?: string | null;
      rottenTomatoesUrl?: string | null;
    },
  ) => {
    setSelectedMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? {
              ...movie,
              ...patch,
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
        | "singlePreviewBody"
        | "singlePreviewTextPosition"
        | "singlePreviewShowTitle"
        | "singlePreviewShowSubtitle"
        | "singlePreviewShowBody"
      >
    >,
  ) => {
    setSelectedMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? {
              ...movie,
              ...patch,
            }
          : movie,
      ),
    );
  };

  const updatePersonProfilePath = (profilePath: string) => {
    setSelectedPerson((current) => (current ? { ...current, profile_path: profilePath } : current));
  };

  const clearMovies = () => {
    setSelectedMovies([]);
  };

  const clearPerson = () => {
    setSelectedPerson(null);
  };

  const hasMovie = (id: number) => selectedMovies.some((movie) => movie.id === id);

  const value = useMemo(
    () => ({
      captureMode,
      setCaptureMode,
      selectedMovies,
      selectedPerson,
      addMovie,
      setPerson,
      removeMovie,
      moveMovie,
      reorderMovie,
      updateMovieNote,
      updateMovieNoteMode,
      updateMoviePoster,
      updateMovieRottenScore,
      updateMovieSinglePreview,
      updatePersonProfilePath,
      clearMovies,
      clearPerson,
      hasMovie,
    }),
    [captureMode, selectedMovies, selectedPerson],
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

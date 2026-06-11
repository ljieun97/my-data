"use client";

import { createContext, useContext, useMemo, useState } from "react";

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
  imagePosition?: number;
  providerLogoPath?: string;
  providerLogoName?: string;
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

export type CaptureMode = "movie-list" | "movie-cover" | "person-cover" | "calendar" | "calendar-release";

export function getCaptureMovieMaxCount(captureMode: CaptureMode) {
  return captureMode === "calendar-release" ? 8 : captureMode === "movie-list" ? 10 : 5;
}

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
  selectedPersons: CapturePerson[];
  addMovie: (movie: CaptureMovie) => boolean;
  setPerson: (person: CapturePerson) => void;
  removePerson: (id: number) => void;
  removeMovie: (id: number) => void;
  moveMovie: (id: number, direction: "up" | "down") => void;
  reorderMovie: (fromIndex: number, toIndex: number) => void;
  updateMovieTitle: (id: number, title: string) => void;
  updateMovieNote: (id: number, note: string) => void;
  updateMovieImagePosition: (id: number, imagePosition: number) => void;
  updateMovieProviderLogo: (id: number, providerLogoPath: string, providerLogoName?: string) => void;
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
  updatePersonProfilePath: (id: number, profilePath: string) => void;
  clearMovies: () => void;
  clearPerson: () => void;
  hasMovie: (id: number, mediaType?: CaptureMovie["media_type"]) => boolean;
};

const CaptureContentContext = createContext<CaptureContentContextValue | undefined>(undefined);

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
    imagePosition: typeof movie.imagePosition === "number" ? movie.imagePosition : 20,
    providerLogoPath: movie.providerLogoPath,
    providerLogoName: movie.providerLogoName,
    posterOptions: movie.posterOptions,
    singlePreviewTitle: movie.singlePreviewTitle ?? title,
    singlePreviewSubtitle: movie.singlePreviewSubtitle ?? (movie.original_title || movie.original_name || title),
    singlePreviewBody: movie.singlePreviewBody ?? movie.overview ?? "여기에 설명을 적어주세요.\n두 줄까지 표시됩니다.",
    singlePreviewTextPosition: movie.singlePreviewTextPosition ?? "center",
    singlePreviewShowTitle: movie.singlePreviewShowTitle ?? true,
    singlePreviewShowSubtitle: movie.singlePreviewShowSubtitle ?? false,
    singlePreviewShowBody: movie.singlePreviewShowBody ?? true,
  };
}

export function CaptureContentProvider({ children }: { children: React.ReactNode }) {
  const [captureMode, setCaptureMode] = useState<CaptureMode>("person-cover");
  const [selectedMovies, setSelectedMovies] = useState<CaptureMovie[]>([]);
  const [selectedPersons, setSelectedPersons] = useState<CapturePerson[]>([]);
  const selectedPerson = selectedPersons[0] ?? null;

  const addMovie = (movie: CaptureMovie) => {
    const normalizedMovie = normalizeMovie(movie);
    if (!normalizedMovie) return false;
    const maxMovies = getCaptureMovieMaxCount(captureMode);

    if (selectedMovies.some((item) => item.id === normalizedMovie.id && item.media_type === normalizedMovie.media_type) || selectedMovies.length >= maxMovies) {
      return false;
    }

    setSelectedMovies((current) => [...current, normalizedMovie]);
    return true;
  };

  const setPerson = (person: CapturePerson) => {
    setSelectedPersons((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === person.id);
      if (existingIndex >= 0) {
        return current.map((entry, index) => (index === existingIndex ? person : entry));
      }
      if (current.length >= 2) {
        return current;
      }
      return [...current, person];
    });
  };

  const removePerson = (id: number) => {
    setSelectedPersons((current) => current.filter((person) => person.id !== id));
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

  const updateMovieNote = (id: number, note: string) => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, note } : movie)),
    );
  };

  const updateMovieImagePosition = (id: number, imagePosition: number) => {
    setSelectedMovies((current) =>
      current.map((movie) => (movie.id === id ? { ...movie, imagePosition: Math.max(0, Math.min(100, imagePosition)) } : movie)),
    );
  };

  const updateMovieProviderLogo = (id: number, providerLogoPath: string, providerLogoName?: string) => {
    setSelectedMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? {
              ...movie,
              providerLogoPath: providerLogoPath || undefined,
              providerLogoName: providerLogoPath ? providerLogoName || movie.providerLogoName : undefined,
            }
          : movie,
      ),
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

  const updatePersonProfilePath = (id: number, profilePath: string) => {
    setSelectedPersons((current) =>
      current.map((person) =>
        person.id === id
          ? {
              ...person,
              profile_path: profilePath,
            }
          : person,
      ),
    );
  };

  const clearMovies = () => {
    setSelectedMovies([]);
  };

  const clearPerson = () => {
    setSelectedPersons([]);
  };

  const hasMovie = (id: number, mediaType: CaptureMovie["media_type"] = "movie") =>
    selectedMovies.some((movie) => movie.id === id && movie.media_type === mediaType);

  const value = useMemo(
    () => ({
      captureMode,
      setCaptureMode,
      selectedMovies,
      selectedPerson,
      selectedPersons,
      addMovie,
      setPerson,
      removePerson,
      removeMovie,
      moveMovie,
      reorderMovie,
      updateMovieTitle,
      updateMovieNote,
      updateMovieImagePosition,
      updateMovieProviderLogo,
      updateMoviePoster,
      updateMovieSinglePreview,
      updatePersonProfilePath,
      clearMovies,
      clearPerson,
      hasMovie,
    }),
    [captureMode, selectedMovies, selectedPerson, selectedPersons],
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

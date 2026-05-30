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
};

export type CaptureMode = "movie-list" | "person-cover" | "follow-card";

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

export type CaptureFollowMovie = CaptureMovie & {
  posterOptions?: string[];
};

type CaptureContentContextValue = {
  captureMode: CaptureMode;
  setCaptureMode: (mode: CaptureMode) => void;
  selectedMovies: CaptureMovie[];
  selectedFollowMovie: CaptureFollowMovie | null;
  selectedPerson: CapturePerson | null;
  addMovie: (movie: CaptureMovie) => boolean;
  setFollowMovie: (movie: CaptureFollowMovie) => void;
  setPerson: (person: CapturePerson) => void;
  removeMovie: (id: number) => void;
  moveMovie: (id: number, direction: "up" | "down") => void;
  reorderMovie: (fromIndex: number, toIndex: number) => void;
  updateMovieNote: (id: number, note: string) => void;
  updateFollowMoviePoster: (posterPath: string) => void;
  updatePersonProfilePath: (profilePath: string) => void;
  clearMovies: () => void;
  clearFollowMovie: () => void;
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
  };
}

export function CaptureContentProvider({ children }: { children: React.ReactNode }) {
  const [captureMode, setCaptureMode] = useState<CaptureMode>("person-cover");
  const [selectedMovies, setSelectedMovies] = useState<CaptureMovie[]>([]);
  const [selectedFollowMovie, setSelectedFollowMovie] = useState<CaptureFollowMovie | null>(null);
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

  const setFollowMovie = (movie: CaptureFollowMovie) => {
    setSelectedFollowMovie(movie);
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

  const updateFollowMoviePoster = (posterPath: string) => {
    setSelectedFollowMovie((current) => (current ? { ...current, poster_path: posterPath } : current));
  };

  const updatePersonProfilePath = (profilePath: string) => {
    setSelectedPerson((current) => (current ? { ...current, profile_path: profilePath } : current));
  };

  const clearMovies = () => {
    setSelectedMovies([]);
  };

  const clearFollowMovie = () => {
    setSelectedFollowMovie(null);
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
      selectedFollowMovie,
      selectedPerson,
      addMovie,
      setFollowMovie,
      setPerson,
      removeMovie,
      moveMovie,
      reorderMovie,
      updateMovieNote,
      updateFollowMoviePoster,
      updatePersonProfilePath,
      clearMovies,
      clearFollowMovie,
      clearPerson,
      hasMovie,
    }),
    [captureMode, selectedFollowMovie, selectedMovies, selectedPerson],
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

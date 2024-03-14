'use client'

import MovieCard from "./movie-card";
import { useEffect, useState } from "react";

export default function TodayMovies() {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    (async () => {
      const response = await fetch('/api/tm-movie/today')
      const { results } = await response.json()
      setMovies(results)
    })()
  }, [])

  return (
    <>
      <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies?.map((movie: any) => (
          <MovieCard key={movie.id} movie={movie} ></MovieCard>
        ))}
      </div>
    </>
  )
}
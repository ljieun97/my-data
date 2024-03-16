'use client'

import MovieCard from "./movie-card";
import { useEffect, useState } from "react";

export default function TodaySeries() {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    (async () => {
      const response = await fetch('/api/tm-series/today')
      const { results } = await response.json()
      setMovies(results)
    })()
  }, [])

  return (
    <>
      <div className="gap-3 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {movies.map((movie: any) => (
          <MovieCard key={movie.id} movie={movie} ></MovieCard>
        ))}
      </div>
    </>
  )
}
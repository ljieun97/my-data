'use client'

import MovieCard from "./movie-card";
import { useEffect, useState } from "react";

export default function AcademyMovies() {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    (async () => {
      //오펜하이머 가여운것들 바비 그어살 추락의해부 
      const results = [
        await (await fetch('/api/tm-movie/detail/872585')).json(),
        await (await fetch('/api/tm-movie/detail/792307')).json(),
        await (await fetch('/api/tm-movie/detail/346698')).json(),
        await (await fetch('/api/tm-movie/detail/508883')).json(),
        await (await fetch('/api/tm-movie/detail/840430')).json(),
        await (await fetch('/api/tm-movie/detail/915935')).json(),
      ]
      setMovies(movies.concat(...results))
    })()
  }, [])

  return (
    <>
      <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie: any) => (
          <MovieCard key={movie.id} movie={movie} ></MovieCard>
        ))}
      </div>
    </>
  )
}
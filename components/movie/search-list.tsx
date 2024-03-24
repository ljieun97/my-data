'use client'

import { getSearchList } from "@/lib/themoviedb/api";
import MovieCard from "./movie-card";
import { useEffect, useState } from "react";

export default function SearchList(props: any) {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    (async () => {
      const list = await getSearchList(props.keyword)
      console.log(list)
      setMovies(list)
    })()
  }, [])

  return (
    <>
      <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies && movies.map((movie: { id: string, title: string, name: string, image: string, poster_path: string, media_type: string }) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </>
  )
}
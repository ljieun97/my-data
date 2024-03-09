'use client'

import { useEffect, useState } from "react";
import MovieCard from "./movie-card";

const SearchMovie = ({ id }: { id: string }) => {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    (async () => {
      const response = await fetch(`/api/tm-search/${id}`)
      const {results} = await response.json()      
      setMovies(results.filter((e: any) => e.media_type!="person"))
    })()
  }, [id])
  return (
    <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie: { id: string, title: string, name: string, image: string, poster_path: string, media_type: string }) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default SearchMovie
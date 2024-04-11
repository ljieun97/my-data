'use client'

import { GetMovies } from "@/lib/mongo/movie"
import InfiniteImages from "../common/infinite-images"
import { useEffect, useState } from "react"
import MovieCard from "./movie-card"
import { getMovieDetail, getSeriseDetail } from "@/lib/themoviedb/api"
import GetMovie from "./get-movie"

export default function LikeMovies() {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    (async () => {
      const movies = await GetMovies()
      setMovies(movies)
    })()
  }, [])

  return (
    <>
      {/* {JSON.stringify(movies)} */}
      <InfiniteImages contents={movies} />
      {/* <div className="gap-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {movies?.map((movie: any, index: number) => (
          <GetMovie key={index} movie={movie} ></GetMovie>
        ))}
      </div> */}
    </>
  )
}
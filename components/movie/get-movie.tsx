'use client'

import { useEffect, useState } from "react"
import MovieCard from "./movie-card"
import { getMovieDetail, getSeriseDetail } from "@/lib/themoviedb/api"

export default function GetMovie({ movie }: { movie: any }) {
  const [movieDetail, setMovieDetail] = useState([])
  useEffect(() => {
    (async () => {
      setMovieDetail(movie.title ? await getMovieDetail(movie.id) : await getSeriseDetail(movie.id))
    })()
  }, [])

  return (
    <>
      <MovieCard movie={movieDetail} ></MovieCard>
    </>
  )
}
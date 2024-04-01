'use client'

import { GetMovies } from "@/lib/mongo/movie"
import InfiniteImages from "../common/infinite-images"
import { useEffect, useState } from "react"

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
      <InfiniteImages movies={movies} />
    </>
  )
}
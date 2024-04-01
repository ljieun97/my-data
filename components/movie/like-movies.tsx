'use client'

import { GetMovies } from "@/lib/mongo/movie"
import InfiniteImages from "../common/infinite-images"
import { useEffect, useState } from "react"

export default function LikeMovies() {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    (async () => {
      // const movies = await GetMovies()
      // setMovies(movies)
      const response = await fetch(`/api/movie`, {
        method: "GET"
      })
      const result = await response.json()
      setMovies(result)
    })()
  }, [])
  return (
    <>
      <InfiniteImages movies={movies} />
    </>
  )
}
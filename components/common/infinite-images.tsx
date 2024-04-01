"use client"

import MovieCard from "../movie/movie-card"

export default function InfiniteImages(props: any) {
  return (
    <>
      <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {props.movies?.map((movie: any, index: number) => (
          <MovieCard key={index} movie={movie} ></MovieCard>
        ))}
      </div>
    </>
  )
}
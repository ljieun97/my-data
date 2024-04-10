"use client"

import MovieCard from "../movie/movie-card"

export default function InfiniteImages(props: any) {
  return (
    <>
      <div className="gap-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {props.contents?.map((movie: any, index: number) => (
          <MovieCard key={index} movie={movie}  ></MovieCard>
        ))}
      </div>
    </>
  )
}
"use client"

import { useSearchParams } from "next/navigation";
import Title from "../common/title";
import MovieCard from "./movie-card";
import { useEffect, useState } from "react";
import SearchList from "./search-list";

export default function SearchPage () {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || " "
  // const [keyword, setKeword] = useState("")


  // useEffect(() => {
  //   setKeword(searchParams.get('keyword') || " ")
  // }, [keyword])


  return (
    <>
      <Title title={`"${keyword}" 검색결과`} />
      <SearchList keyword={keyword} />
      {/* <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie: { id: string, title: string, name: string, image: string, poster_path: string, media_type: string }) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div> */}
    </>
  )
}
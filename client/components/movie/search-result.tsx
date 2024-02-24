"use client"

import SearchMovies from "@/components/movie/search-movies";
import { useSearchParams } from "next/navigation";
import Title from "../common/title";

const SearchResult = () => {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || " "
  return (
    <>
      <Title title={`"${keyword}" 검색결과`} />
      <SearchMovies id={keyword} />
    </>
  )
}

export default SearchResult

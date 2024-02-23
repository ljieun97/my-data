"use client"

import SearchMovies from "@/components/movie/search-movies";
import { useSearchParams } from "next/navigation";

const TEST = process.env.TEST

const SearchResult = () => {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ""
  return (
    <>
      <h4>"{keyword}" 검색결과</h4>
      {TEST}
      <SearchMovies id={keyword} />
    </>
  )
}

export default SearchResult

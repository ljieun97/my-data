

import SearchMovies from "@/components/movie/search-movies";
import { useSearchParams } from "next/navigation";

const SearchResult = () => {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ""
  return (
    <>
      <h4>"{keyword}" 검색결과</h4>
      <SearchMovies id={keyword} />
    </>
  )
}

export default SearchResult
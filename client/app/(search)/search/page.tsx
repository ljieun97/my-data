import SearchResult from "@/components/movie/search-result";
import { Suspense } from "react";

const Search = () => {
  return (
    <Suspense fallback={<h1>Loading</h1>}>
      <SearchResult />
    </Suspense>
  )
}

export default Search

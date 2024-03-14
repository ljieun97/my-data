import SearchMovies from "@/components/movie/search-movies";
import { Spinner } from "@nextui-org/react";
import { Suspense } from "react";

const Search = () => {
  return (
    <Suspense fallback={
      <div className="flex gap-4">
        <Spinner color="default" />
      </div>
    }>
      <SearchMovies />
    </Suspense>
  )
}

export default Search

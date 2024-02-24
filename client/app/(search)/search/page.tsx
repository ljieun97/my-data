import SearchResult from "@/components/movie/search-result";
import { Spinner } from "@nextui-org/react";
import { Suspense } from "react";

const Search = () => {
  return (
    <Suspense fallback={
      <div className="flex gap-4">
        <Spinner color="default" />
      </div>
    }>
      <SearchResult />
    </Suspense>
  )
}

export default Search

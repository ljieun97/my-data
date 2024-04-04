import { getSearchList } from "@/lib/themoviedb/api";
import InfiniteImages from "../common/infinite-images"

export default async function SearchList(props: any) {
  const movies = await getSearchList(props?.keyword)
  return (
    <>
      <InfiniteImages movies={movies}/>
    </>
  )
}
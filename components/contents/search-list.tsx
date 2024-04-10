import { getSearchList } from "@/lib/themoviedb/api";
import { getSearchWebtoons } from "@/lib/themoviedb/webtoon";
import InfiniteImages from "../common/infinite-images"

export default async function SearchList(props: any) {
  const movies = await getSearchList(props?.keyword)
  const webtoon = await getSearchWebtoons(props?.keyword)
  return (
    <>
      <h2>영화 및 시리즈</h2>
      <InfiniteImages contents={movies} />
      <h2>웹툰</h2>
      <InfiniteImages contents={webtoon} />
    </>
  )
}
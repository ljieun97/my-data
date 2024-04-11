import { getSearchList } from "@/lib/themoviedb/api";
import { getSearchWebtoons } from "@/lib/themoviedb/webtoon";
import InfiniteImages from "../common/infinite-images"
import { getSearchBooks } from "@/lib/themoviedb/naver_book";

export default async function SearchList(props: any) {
  const movies = await getSearchList(props?.keyword)
  const webtoon = await getSearchWebtoons(props?.keyword)
  const books = await getSearchBooks(props?.keyword)
  console.log(books)
  return (
    <>
      <h2>영화 및 시리즈</h2>
      <InfiniteImages contents={movies} />
      <h2>웹툰</h2>
      <InfiniteImages contents={webtoon} />
    </>
  )
}
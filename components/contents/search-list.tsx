import { getSearchList } from "@/lib/themoviedb/api";
import { getSearchWebtoons } from "@/lib/themoviedb/webtoon";
import InfiniteImages from "../common/infinite-images"
import { getSearchBooks } from "@/lib/themoviedb/naver_book";
import Title from "../common/title";
import { Divider } from "@nextui-org/react";

export default async function SearchList(props: any) {
  const movies = await getSearchList(props?.keyword)
  const webtoons = await getSearchWebtoons(props?.keyword)
  const books = await getSearchBooks(props?.keyword)
  return (
    <>
      <Title title={'영화 및 시리즈'} />
      <InfiniteImages contents={movies} />
      <Divider className="my-4" />

      <Title title={'웹툰 (2자 이상 검색)'} />
      <InfiniteImages contents={webtoons} />
      <Divider className="my-4" />

      <Title title={'도서'} />
      <InfiniteImages contents={books} />
    </>
  )
}
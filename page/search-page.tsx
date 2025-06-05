"use client"

import { useSearchParams } from "next/navigation"
import Title from "../components/common/title"
import { Spacer } from "@heroui/react"
import { RefObject, useEffect, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import InfiniteImages from "@/components/common/infinite-images";
import { getSearchMulti } from "@/lib/open-api/tmdb-client"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ''

  //필터로 영화/시리즈/장르 등등 나누기
  const [hasMoreMovies, setHasMoreMovies] = useState(false)
  let movies = useAsyncList({
    async load({ signal, cursor }) {
      const { results, page, total_pages, total_results } = cursor ?
        await getSearchMulti(keyword, Number(cursor)) :
        await getSearchMulti(keyword, 1)
      setHasMoreMovies(page < total_pages)
      return {
        items: results,
        cursor: page + 1,
      }
    }
  })
  const [loaderRefMovies, scrollerRefMovies] = useInfiniteScroll({
    hasMore: hasMoreMovies,
    onLoadMore: movies.loadMore
  }) as unknown as RefObject<HTMLDivElement>[]

  useEffect(() => {
    (async () => {
      movies.reload()
    })()
  }, [keyword])

  return (
    <>
      <Title
        title={`"${keyword}"`}
        sub={"에 대한 검색결과"}
      />
      <Spacer y={4} />
      <div className="overflow-auto border-2 rounded-md h-full p-2" ref={scrollerRefMovies}>
        <InfiniteImages contents={movies.items} type="info" />
        {hasMoreMovies ? (
          <div className="flex w-full justify-center" ref={loaderRefMovies}>
          </div>
        ) : null}
      </div>
    </>
  )
}
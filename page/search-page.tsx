"use client"

import { useSearchParams } from "next/navigation"
import Title from "../components/common/title"
import { RefObject, useEffect, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import InfiniteImages from "@/components/common/infinite-images";
import { getSearchMulti } from "@/lib/open-api/tmdb-client"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get("keyword") || ""

  const [hasMoreMovies, setHasMoreMovies] = useState(false)
  let movies = useAsyncList({
    async load({ cursor }) {
      const { results, page, total_pages } = cursor ?
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
    movies.reload()
  }, [keyword])

  return (
    <div className="content-panel">
      <Title
        title={`"${keyword}"`}
        sub="Search results"
      />
      <div className="content-grid-shell overflow-auto rounded-[24px] border p-3" style={{ minHeight: "60vh" }} ref={scrollerRefMovies}>
        <InfiniteImages contents={movies.items} type="info" />
        {hasMoreMovies ? (
          <div className="flex w-full justify-center" ref={loaderRefMovies}></div>
        ) : null}
      </div>
    </div>
  )
}

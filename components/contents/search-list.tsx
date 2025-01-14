'use client'

import { getSearchMovies, getSearchSeries, getSearchMulti } from "@/lib/themoviedb/api";
import InfiniteImages from "../common/infinite-images"
import { Accordion, AccordionItem, Divider, Spinner } from "@nextui-org/react";
import { RefObject, useEffect, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";

export default function SearchList(props: any) {
  const [totalMovie, setTotalMovie] = useState(0)
  const [totalSeries, setTotalSeries] = useState(0)

  //검색결과 인피니티 - 배우는 이름으로 다시 검색해서 결과에 포함하기
  //처음검색은 무조건 멀티
  //필터로 영화/시리즈/장르 등등 나누기
  const [hasMoreMovies, setHasMoreMovies] = useState(false)
  let movies = useAsyncList({
    async load({ signal, cursor }) {
      const { results, page, total_pages, total_results } = cursor ?
        await getSearchMulti(props?.keyword, Number(cursor)) :
        await getSearchMulti(props?.keyword, 1)
      setTotalMovie(total_results)
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

  //시리즈 인피니티
  const [hasMoreSeries, setHasMoreSeries] = useState(false)
  let series = useAsyncList({
    async load({ signal, cursor }) {
      const { results, page, total_pages, total_results } = cursor ?
        await getSearchSeries(props?.keyword, Number(cursor)) :
        await getSearchSeries(props?.keyword, 1)
      setTotalSeries(total_results)
      setHasMoreSeries(page < total_pages)
      return {
        items: results,
        cursor: page + 1,
      }
    }
  })
  const [loaderRefSeries, scrollerRefSeries] = useInfiniteScroll({
    hasMore: hasMoreSeries,
    onLoadMore: series.loadMore
  }) as unknown as RefObject<HTMLDivElement>[]

  useEffect(() => {
    (async () => {
      movies.reload()
      series.reload()
    })()
  }, [props])

  return (
    <>
      <div className="max-h-[540px] overflow-scroll" ref={scrollerRefMovies}>
        <InfiniteImages contents={movies.items} type="info" />
        {hasMoreMovies ? (
          <div className="flex w-full justify-center" ref={loaderRefMovies}>
          </div>
        ) : null}
      </div>
    </>
  )
}
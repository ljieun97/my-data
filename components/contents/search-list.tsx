'use client'

import { getSearchMovies, getSearchSeries } from "@/lib/themoviedb/api";
import { getSearchWebtoons } from "@/lib/themoviedb/webtoon";
import InfiniteImages from "../common/infinite-images"
import { getSearchBooks } from "@/lib/themoviedb/naver_book";
import { Accordion, AccordionItem, Divider, Spinner } from "@nextui-org/react";
import { RefObject, useEffect, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";

export default function SearchList(props: any) {
  const [webtoons, setWebtoons] = useState([])
  const [totalMovie, setTotalMovie] = useState(0)
  const [totalSeries, setTotalSeries] = useState(0)
  const [totalWebtoon, setTotalWebtoon] = useState(0)
  const [totalBook, setTotalBook] = useState(0)

  //영화 인피니티
  const [hasMoreMovies, setHasMoreMovies] = useState(false)
  let movies = useAsyncList({
    async load({ signal, cursor }) {
      const { results, page, total_pages, total_results } = cursor ?
        await getSearchMovies(props?.keyword, Number(cursor)) :
        await getSearchMovies(props?.keyword, 1)
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
  }) as RefObject<HTMLDivElement>[]

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
  }) as RefObject<HTMLDivElement>[]

  //도서 인피니티
  const [hasMoreBooks, setHasMoreBooks] = useState(false)
  let books = useAsyncList({
    async load({ signal, cursor }) {
      const { items, total, total_pages } = cursor ?
        await getSearchBooks(props?.keyword, Number(cursor)) :
        await getSearchBooks(props?.keyword, 1)
      setTotalBook(total)
      setHasMoreBooks(Number(cursor) < total_pages)
      return {
        items: items,
        cursor: `${Number(cursor) + 1}`,
      }
    }
  })
  const [loaderRefBooks, scrollerRefBooks] = useInfiniteScroll({
    hasMore: hasMoreBooks,
    onLoadMore: books.loadMore
  }) as RefObject<HTMLDivElement>[]

  useEffect(() => {
    (async () => {
      movies.reload()
      series.reload()
      books.reload()
      const results = await getSearchWebtoons(props?.keyword)
      setWebtoons(results)
      setTotalWebtoon(results.length)
    })()
  }, [props])

  return (
    <>
      <Accordion
        variant="splitted"
        defaultExpandedKeys={["1"]}
        onSelectionChange={() => {
          movies.reload()
          series.reload()
          books.reload()
        }}
      >
        <AccordionItem
          key="1"
          aria-label="Accordion 1"
          title={`영화 ${totalMovie}건`}
        >
          <div className="max-h-[540px] overflow-scroll" ref={scrollerRefMovies}>
            <InfiniteImages contents={movies.items} />
            {hasMoreMovies ? (
              <div className="flex w-full justify-center" ref={loaderRefMovies}>
                {/* <Spinner ref={loaderRefMovies} color="white" /> */}
              </div>
            ) : null}
          </div>
        </AccordionItem>
        <AccordionItem
          key="2"
          aria-label="Accordion 2"
          title={`시리즈 ${totalSeries}건`}
        >
          <div className="max-h-[540px] overflow-scroll" ref={scrollerRefSeries}>
            <InfiniteImages contents={series.items} />
            {hasMoreSeries ? (
              <div className="flex w-full justify-center" ref={loaderRefSeries}>
                {/* <Spinner color="white" /> */}
              </div>
            ) : null}
          </div>
        </AccordionItem>
        <AccordionItem
          key="3"
          aria-label="Accordion 3"
          title={`웹툰 ${totalWebtoon}건`}
        >
          <div className="max-h-[540px] overflow-scroll">
            <InfiniteImages contents={webtoons} />
          </div>
        </AccordionItem>
        <AccordionItem
          key="4"
          aria-label="Accordion 4"
          title={`도서 ${totalBook}건`}
        >
          <div className="max-h-[540px] overflow-scroll" ref={scrollerRefBooks}>
            <InfiniteImages contents={books.items} />
            {hasMoreBooks ? (
              <div className="flex w-full justify-center" ref={loaderRefBooks}>
                {/* <Spinner ref={loaderRefBooks} color="white" /> */}
              </div>
            ) : null}
          </div>
        </AccordionItem>
      </Accordion>
    </>
  )
}
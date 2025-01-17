"use client"

import { getFilterMovies } from "@/lib/themoviedb/api"
import InfiniteImages from "../components/common/infinite-images"
import { Spacer, Spinner } from "@nextui-org/react"
import { RefObject, useCallback, useEffect, useRef, useState } from "react"
import { getLocalTimeZone, today } from "@internationalized/date";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";

import SelectFilter from "../components/common/select-filter"
import Title from "../components/common/title"
import InfiniteImagesSkel from "../components/common/infinite-images-skel"

export default function FilterPage({ type }: { type: string }) {
  const [totalContents, setTotalContents] = useState('')
  const [country, setCountries] = useState('')
  // const [flatforms, setFlatforms] = useState(new Set([]))
  const [flatforms, setFlatforms] = useState('')
  const [genres, setGenres] = useState('')
  const [date, setDate] = useState('')

  const [hasMore, setHasMore] = useState(false)
  let list = useAsyncList({
    async load({ signal, cursor }) {

      const { results, page, total_pages, total_results } = await getFilterMovies(type, country, flatforms, date, genres, cursor ? cursor : 1)
      setTotalContents(total_results)
      // setHasMore(page < total_pages)
      setHasMore(true)

      return {
        items: results,
        cursor: page + 1,
      }
    }
  })
  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: list.loadMore
  }) as unknown as RefObject<HTMLDivElement>[]

  useEffect(() => {
    list.reload()
  }, [country])

  useEffect(() => {
    list.reload()
  }, [date])

  useEffect(() => {
    list.reload()
  }, [flatforms])

  useEffect(() => {
    list.reload()
  }, [genres])

  const countryDatas = [
    { label: '한국', value: 'KR' },
    { label: '미국', value: 'US' },
    { label: '영국', value: 'GB' },
    { label: '일본', value: 'JP' },
  ]

  const flatformDatas = [
    { label: '구글', value: 3 },
    { label: '넷플릭스', value: 8 },
    { label: '아마존', value: 119 },
    { label: '네이버', value: 96 },
    { label: '왓챠', value: 97 },
    { label: '디즈니플러스', value: 337 },
    { label: '애플TV', value: 350 },
    { label: '웨이브', value: 356 },
  ]

  const genreDatas = [
    {
      value: 28,
      label: "액션"
    },
    {
      value: 12,
      label: "모험"
    },
    {
      value: 16,
      label: "애니메이션"
    },
    {
      value: 35,
      label: "코미디"
    },
    {
      value: 80,
      label: "범죄"
    },
    {
      value: 99,
      label: "다큐멘터리"
    },
    {
      value: 18,
      label: "드라마"
    },
    {
      value: 10751,
      label: "가족"
    },
    {
      value: 14,
      label: "판타지"
    },
    {
      value: 36,
      label: "역사"
    },
    {
      value: 27,
      label: "공포"
    },
    {
      value: 10402,
      label: "음악"
    },
    {
      value: 9648,
      label: "미스터리"
    },
    // {
    //   value: 10749,
    //   label: "로맨스"
    // },
    {
      value: 878,
      label: "SF"
    },
    {
      value: 10770,
      label: "TV 영화"
    },
    {
      value: 53,
      label: "스릴러"
    },
    {
      value: 10752,
      label: "전쟁"
    },
    {
      value: 37,
      label: "서부"
    }
  ]

  const yearDatas = []
  for (let i = 2025; i >= 1980; i--) {
    yearDatas.push({ label: `${i}`, value: i })
  }

  const onChangeSelect = (e: any, type: string) => {
    switch (type) {
      case '연도':
        setDate(e.target.value)
        break
      case '국가':
        setCountries(e.target.value)
        break
      case '제공사':
        setFlatforms(e.target.value)
        break
      case '장르':
        setGenres(e.target.value)
        break
    }
  }

  return (
    <div className="">
      {/* <div className="flex items-center pt-8 pb-4">
        <Title
          title={type === "movie" ? "영화" : "시리즈"}
          sub={
            <>
              <span className="pr-1">검색결과</span>
              {totalContents ? Number(totalContents).toLocaleString() : <Spinner size="sm" color="success" />}
              건
            </>
          }
        />
      </div> */}

      <div className="flex flex-row gap-2 py-4">
        <SelectFilter type={'연도'} items={yearDatas} onChangeSelect={onChangeSelect} />
        <SelectFilter type={'제공사'} items={flatformDatas} onChangeSelect={onChangeSelect} />
        <SelectFilter type={'국가'} items={countryDatas} onChangeSelect={onChangeSelect} />
        <SelectFilter type={'장르'} items={genreDatas} onChangeSelect={onChangeSelect} />
      </div>
      <div className="max-h-[650px] overflow-scroll" ref={scrollerRef}>
        {/* {totalContents ?
          <InfiniteImages type="info" contents={list.items} /> : <InfiniteImagesSkel />
        } */}
          <InfiniteImages type="info" contents={list.items} />
        {hasMore ? (
          <div className="flex w-full justify-center" ref={loaderRef}>
            {/* <Spinner ref={loaderRef} color="white" /> */}
          </div>
        ) : null}
      </div>
    </div>
  )
}


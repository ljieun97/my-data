"use client"

import { getFilterMovies } from "@/lib/themoviedb/api"
import InfiniteImages from "../common/infinite-images"
import { DateRangePicker, Select, SelectItem, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, User, getKeyValue } from "@nextui-org/react"
import { RefObject, useCallback, useEffect, useRef, useState } from "react"
import { getLocalTimeZone, today } from "@internationalized/date";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";
import CardThumb from "../contents/card-thumb"

export default function MovieList({type}: {type: string}) {
  const [country, setCountries] = useState('')
  // const [flatforms, setFlatforms] = useState(new Set([]))
  const [flatforms, setFlatforms] = useState('')
  const [genres, setGenres] = useState('')
  // const [date, setDate] = useState({
  //   start: today(getLocalTimeZone()).subtract({ years: 1 }),
  //   end: today(getLocalTimeZone()),
  // })
  const [date, setDate] = useState('')

  const [hasMore, setHasMore] = useState(false)
  let list = useAsyncList({
    async load({ signal, cursor }) {
      const { results, page, total_pages } = cursor ? await getFilterMovies(type, country, flatforms, date, genres, cursor) : await getFilterMovies(type, country, flatforms, date, genres, 1)
      setHasMore(page < total_pages)
      return {
        items: results,
        cursor: page + 1,
      }
    }
  })
  const [loaderRef, scrollerRef] = useInfiniteScroll({ hasMore, onLoadMore: list.loadMore }) as RefObject<HTMLDivElement>[]

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
    { label: '일본', value: 'JP' },
    { label: '미국', value: 'US' },
    { label: '영국', value: 'GB' },
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
  for (let i = 2024; i >= 1980; i--) {
    yearDatas.push({ label: `${i}`, value: i })
  }

  const handleCountryChange = (e: any) => {
    setCountries(e.target.value)
  }

  const handleSelectionChange = (e: any) => {
    // setFlatforms(new Set(e.target.value.split(",")))
    setFlatforms(e.target.value)
  }

  const handleGenreChange = (e: any) => {
    setGenres(e.target.value)
  }

  const handleYearChange = (e: any) => {
    setDate(e.target.value)
  }

  return (
    <>
      <div className="h-[720px] overflow-auto" ref={scrollerRef}>
        <div className="flex flex-row gap-2 pb-4">
          {/* <DateRangePicker
            aria-label="date"
            label="날짜"
            value={date}
            onChange={setDate}
          /> */}
          <Select
            items={yearDatas}
            label="연도"
            placeholder="전체"
            className="max-w-xs"
            onChange={handleYearChange}
            showScrollIndicators={false}
          >
            {(item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>}
          </Select>
          <Select
            items={flatformDatas}
            label="제공사"
            placeholder="전체"
            className="max-w-xs"
            // selectionMode="multiple"
            onChange={handleSelectionChange}
            showScrollIndicators={false}
          >
            {(item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>}
          </Select>
          <Select
            items={countryDatas}
            label="국가"
            placeholder="전체"
            className="max-w-xs"
            onChange={handleCountryChange}
            showScrollIndicators={false}
          >
            {(item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>}
          </Select>
          <Select
            items={genreDatas}
            label="장르"
            placeholder="전체"
            className="max-w-xs"
            onChange={handleGenreChange}
            showScrollIndicators={false}
          >
            {(item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>}
          </Select>
        </div>

        <InfiniteImages contents={list.items} />
        {hasMore ? (
          <div className="flex w-full justify-center">
            <Spinner ref={loaderRef} color="white" />
          </div>
        ) : null}
      </div>
    </>
  )
}


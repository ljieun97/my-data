'use client'

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, User, Spinner, Card, CardBody, Input, Tabs, Tab, CardFooter, Switch, RadioGroup, Radio, Spacer } from "@nextui-org/react"
import MyLikes from "./my-likes"
import { RefObject, useCallback, useEffect, useState } from "react"
import { GetMovies, DeleteMovie, UpdateMovie, GetMovieCount } from "@/lib/mongo/movie"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faList, faBorderAll, faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import InfiniteImages from "../common/infinite-images"
import SelectFilter from "../common/select-filter"
import { useAsyncList } from "@react-stately/data"
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll"
import Title from "../common/title"

const MyPage = () => {
  const [contentCounts, setContentCounts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalSearch, setTotalSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [type, setType] = useState('')
  const [rating, setRating] = useState('')
  const [date, setDate] = useState('')
  const [sort, setSort] = useState('user_date')
  const [asc, setAsc] = useState(-1)
  const [viewType, setViewType] = useState('list')
  // const [nextId, setNextId] = useState('')

  const columns = [
    {
      key: "title",
      label: "TITLE",
    },
    {
      key: "user_date",
      label: "DATE",
    },
    {
      key: "user_rating",
      label: "RATING",
    },
    {
      key: "action",
      label: "ACTION",
    },
  ]

  const typeDatas = [
    { label: '영화', value: '영화' },
    { label: 'TV', value: 'TV' },
    { label: '웹툰', value: '웹툰' },
    { label: '도서', value: '도서' },
  ]

  const ratingDatas = [
    { label: '최고다 최고', value: 5 },
    { label: '볼만해요', value: 3 },
    { label: '별로예요', value: 1 },
  ]

  const yearDatas = []
  for (let i = 2024; i >= 1980; i--) {
    yearDatas.push({ label: `${i}`, value: i })
  }

  const [hasMore, setHasMore] = useState(false)
  let list = useAsyncList({
    async load({ signal, cursor }) {
      const page = cursor ? Number(cursor) : 0
      //정렬 userdate는 되는데 rating은 중복뜸
      const response = await GetMovies(page, date, type, rating, sort, asc)
      const { results, total, total_page } = await response.json()
      console.log(page, total_page)

      setTotalSearch(total)
      // setHasMore(page+1 < total_page)
      setHasMore(true)

      return {
        items: results,
        cursor: `${page + 1}`,
      }
    }
  })
  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: list.loadMore
  }) as RefObject<HTMLDivElement>[] as any

  useEffect(() => {
    (async () => {
      await setCount()
    })()
  }, [])

  useEffect(() => {

    list.reload()

  }, [date])

  useEffect(() => {

    list.reload()
  }, [type])

  useEffect(() => {
    list.reload()
  }, [rating])

  useEffect(() => {
    list.reload()
  }, [asc])

  const setCount = async () => {
    const getContentCounts = await GetMovieCount()
    setContentCounts(getContentCounts)
    setTotalCount(() => {
      let total = 0
      getContentCounts.forEach((item: any) => {
        total += item.count
      })
      return total
    })
  }

  const clickUpdate = (id: any) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    // await UpdateMovie(id, e.target.value)

    list.reload()
  }

  const clickDelete = async (id: any) => {
    await DeleteMovie(id)
    await setCount()

    list.reload()
  }

  const onChangeSelect = (e: any, type: string) => {
    switch (type) {
      case '연도':
        setDate(e.target.value)
        break
      case '유형':
        setType(e.target.value)
        break
      case '평가':
        setRating(e.target.value)
        break
    }
  }

  const onChangeSort = (e: any) => {
    setSort(e.column)
    setAsc(asc * (-1))
  }

  const getKeyValue = useCallback((item: any, columnKey: any) => {
    const cellValue = item[columnKey]
    switch (columnKey) {
      case "title":
        let img = ''
        if (item.webtoonId) {
          img = item.img
        } else if (item.isbn) {
          img = item.image
        } else {
          img = `https://image.tmdb.org/t/p/w500/${item.poster_path}`
        }

        return (
          <User
            avatarProps={{ radius: "lg", src: img }}
            description={item.type}
            name={item.title}
          />
        )
      case "user_date":
        // return item.my_date.substr(0, 10)
        return (
          <Input isReadOnly type='date' size={'sm'} variant={'bordered'} value={item.user_date.substr(0, 10)} />
        )
      case "user_rating":
        let rating = item.user_rating
        let icon = faFaceLaughSquint
        if (rating == 3) icon = faFaceSmileBeam
        else if (rating == 1) icon = faFaceFrownOpen
        return (
          <FontAwesomeIcon icon={icon} className="size-7" />
        )
      case "action":
        return (
          <Tooltip color="danger" content="Delete Contents">
            <span onClick={() => clickDelete(item._id)} className="text-danger cursor-pointer">
              <FontAwesomeIcon icon={faTrashCan} className="size-6" />
            </span>
          </Tooltip>
        )
      default:
        return cellValue
    }
  }, [])

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <Spacer y={16} />
      <div className="flex items-center pt-8 pb-4 justify-between">
        <Title
          title={"마이페이지"}
          sub={
            <>
              <span className="pr-1">검색결과</span>
              {totalSearch ? Number(totalSearch).toLocaleString() : <Spinner size="sm" color="success" />}
              건
            </>
          }
        />
        <RadioGroup
          orientation="horizontal"
          value={viewType}
          onValueChange={setViewType}
        >
          <Radio value="list">리스트</Radio>
          <Radio value="gallery">갤러리</Radio>
        </RadioGroup>
      </div>

      <Card>
        <CardFooter className="justify-center gap-5">
          <div className="flex gap-1">
            <p className="">총</p>
            <p className="font-semibold">{totalCount}</p>
          </div>
          {contentCounts?.map((contentCount: any, index: number) => (
            <div className="flex gap-1" key={index}>
              <p className="">{contentCount._id}</p>
              <p className="font-semibold">{contentCount.count}</p>
            </div>
          ))}
        </CardFooter>
      </Card>

      <div className="flex gap-2 py-2">
        <SelectFilter type={'유형'} items={typeDatas} onChangeSelect={onChangeSelect} />
        <SelectFilter type={'연도'} items={yearDatas} onChangeSelect={onChangeSelect} />
        <SelectFilter type={'평가'} items={ratingDatas} onChangeSelect={onChangeSelect} />
      </div>

      {viewType == 'list' &&
        <Table
          // removeWrapper
          // hideHeader
          // isHeaderSticky
          sortDescriptor={list.sortDescriptor}
          onSortChange={onChangeSort}
          aria-label="Example table with dynamic content"
          classNames={{
            base: "max-h-[620px] overflow-scroll",
            table: "max-h-[620px]",
          }}
          baseRef={scrollerRef}
          bottomContent={
            hasMore ? (
              <div className="flex w-full justify-center" ref={loaderRef}>
                {/* <Spinner ref={loaderRef} color="white" /> */}
              </div>
            ) : null
          }
        >
          <TableHeader>
            <TableColumn key="title" className="w-1/2" allowsSorting>
              TITLE
            </TableColumn>
            <TableColumn key="user_date" allowsSorting>
              DATE
            </TableColumn>
            <TableColumn key="user_rating">
              {null}
            </TableColumn>
            <TableColumn key="action">
              {null}
            </TableColumn>
          </TableHeader>
          <TableBody
            items={list.items}
          >
            {(item: any) => (
              <TableRow key={item._id}>
                {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      }

      {viewType == 'gallery' &&
        <div className="max-h-[620px] overflow-scroll" ref={scrollerRef}>
          <InfiniteImages contents={list.items} />
          {hasMore ? (
            <div className="flex w-full justify-center" ref={loaderRef}>
              {/* <Spinner ref={loaderRef} color="white" /> */}
            </div>
          ) : null}
        </div >
      }
    </div>
  )
}

export default MyPage
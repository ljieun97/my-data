'use client'

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, User, Spinner, Card, CardBody, Input, Tabs, Tab, CardFooter } from "@nextui-org/react"
import MyLikes from "./my-likes"
import { RefObject, useCallback, useEffect, useState } from "react"
import { GetMovies, DeleteMovie, UpdateMovie, GetMovieCount } from "@/lib/mongo/movie"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faList, faBorderAll, faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import InfiniteImages from "../common/infinite-images"
import SelectFilter from "../common/select-filter"
import { useAsyncList } from "@react-stately/data"
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll"

const MyPage = () => {
  const [contentCounts, setContentCounts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [contents, setContents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [type, setType] = useState('')
  const [rating, setRating] = useState('')
  const [date, setDate] = useState('')
  // const [nextId, setNextId] = useState('')

  const columns = [
    {
      key: "title",
      label: "TITLE",
    },
    {
      key: "date",
      label: "DATE",
    },
    {
      key: "rating",
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
      const response = cursor ?
        await GetMovies(Number(cursor), date, type, rating) :
        await GetMovies(0, date, type, rating)
      const { results, total_page } = await response.json()
      console.log(Number(cursor), total_page)
      setHasMore(Number(cursor) + 1 <= total_page)

      return {
        items: results,
        cursor: `${Number(cursor) + 1}`,
      }
    }
  })
  const [loaderRef, scrollerRef] = useInfiniteScroll({ hasMore, onLoadMore: list.loadMore }) as RefObject<HTMLDivElement>[]

  useEffect(() => {
    (async () => {
      await updateMypage()
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

  const updateMypage = async () => {
    const getContentCounts = await GetMovieCount()
    setContentCounts(getContentCounts)
    setTotalCount(() => {
      let total = 0
      getContentCounts.forEach((item: any) => {
        total += item.count
      })
      return total
    })
    const response = await GetMovies(0, date, type, rating)
    const { results } = await response.json()
    setContents(results)
  }

  const clickUpdate = (id: any) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    await UpdateMovie(id, e.target.value)
    list.reload()
    // const response = await GetMovies(0, date, type, rating)
    // const { results } = await response.json()
    // setContents(results)
  }

  const clickDelete = async (id: any) => {
    await DeleteMovie(id)
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

  const getKeyValue = useCallback((item: any, columnKey: any) => {
    const cellValue = item[columnKey]
    switch (columnKey) {
      case "title":
        let title = ''
        let img = ''
        if (item.webtoonId) {
          title = item.title
          img = item.img
        } else if (item.isbn) {
          title = item.title
          img = item.image
        } else {
          title = item.title ? item.title : item.name
          img = `https://image.tmdb.org/t/p/w500/${item.poster_path}`
        }

        return (
          <User
            avatarProps={{ radius: "lg", src: img }}
            description={item.type}
            name={title}
          />
        )
      case "date":
        // return item.my_date.substr(0, 10)
        return (
          <Input type='date' size={'sm'} variant={'bordered'} value={item.user_date.substr(0, 10)} onChange={clickUpdate(item._id)} />
        )
      case "rating":
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
    <>
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

      <div className="flex flex-row gap-2 py-2">
        <SelectFilter type={'연도'} items={yearDatas} onChangeSelect={onChangeSelect} />
        <SelectFilter type={'유형'} items={typeDatas} onChangeSelect={onChangeSelect} />
        <SelectFilter type={'평가'} items={ratingDatas} onChangeSelect={onChangeSelect} />
      </div>

      {/* <Tabs aria-label="Tabs" className="py-2 justify-right">
        <Tab
          key="rating"
          title={
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faList} />
              <span>리스트</span>
            </div>
          }
        > */}
          <Table
            // removeWrapper
            // hideHeader
            // isHeaderSticky
            aria-label="Example table with dynamic content"
            classNames={{
              base: "max-h-[540px] overflow-scroll",
              table: "max-h-[540px]",
            }}
            baseRef={scrollerRef}
            bottomContent={
              hasMore ? (
                <div className="flex w-full justify-center">
                  <Spinner ref={loaderRef} color="white" />
                </div>
              ) : null
            }
          >
            <TableHeader columns={columns}>
              {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
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
        {/* </Tab>
        <Tab
          key="like"
          title={
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faBorderAll} />
              <span>갤러리</span>
            </div>
          }
        >
          <div className="max-h-[540px] overflow-scroll">
            <InfiniteImages contents={list.items} />
          </div >
        </Tab>
      </Tabs> */}
    </>
  )
}

export default MyPage
"use client"

import { useEffect, useState, useCallback } from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, User, Spinner, Card, CardBody, Input } from "@nextui-org/react"
import { GetMovies, DeleteMovie, UpdateMovie, GetMovieCount } from "@/lib/mongo/movie"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughBeam, faFaceMeh, faFaceAngry, faTrashCan } from "@fortawesome/free-solid-svg-icons"

export default function MyContents() {
  const [contents, setContents] = useState([])
  const [contentCounts, setContentCounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    (async () => {
      setContents(await GetMovies())
      setContentCounts(await GetMovieCount())
      setIsLoading(false)
    })()
  }, [])


  const clickUpdate = (id: any) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    await UpdateMovie(id, e.target.value)
    const contents = await GetMovies()
    setContents(contents)
  }

  const clickDelete = async (id: any) => {
    await DeleteMovie(id)
    const contents = await GetMovies()
    setContents(contents)
  }

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
        let icon = faFaceLaughBeam
        if (rating == 3) icon = faFaceMeh
        else if (rating == 1) icon = faFaceAngry
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
      {/* {JSON.stringify(movieCount)} */}
      <Card>
        <CardBody>
          <div className="flex gap-3 items-center" >
            {contentCounts?.map((contentCount: any, index: number) => (
              <div className="flex gap-1" key={index}>
                <p className="text-small">{contentCount._id}</p>
                <p className="font-semibold text-small">{contentCount.count}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Table
        removeWrapper
        hideHeader
        aria-label="Example table with dynamic content"
        classNames={{
          base: "max-h-[700px] overflow-scroll",
          table: "max-h-[700px]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody
          items={contents}
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item: any) => (
            <TableRow key={item._id}>
              {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )
}
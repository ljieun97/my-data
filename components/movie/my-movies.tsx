"use client"

import React, { useEffect, useState } from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Link, Tooltip, User, Spinner } from "@nextui-org/react"
import { Rating } from 'react-custom-rating-component'
import { GetMovies, DeleteMovie, UpdateMovie } from "@/lib/mongo/movie"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCirclePlus, faFaceLaughBeam, faFaceMeh, faFaceAngry, faCircleCheck } from "@fortawesome/free-solid-svg-icons"

export default function MyMovies() {
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    (async () => {
      const movies = await GetMovies()
      setIsLoading(false)
      setMovies(movies)
    })()
  }, [])


  const clickUpdate = (id: any) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    await UpdateMovie(id, e.target.value)
    const movies = await GetMovies()
    setMovies(movies)
  }

  const clickDelete = async (id: any) => {
    await DeleteMovie(id)
    const movies = await GetMovies()
    setMovies(movies)
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
  const getKeyValue = React.useCallback((item: any, columnKey: any) => {
    const cellValue = item[columnKey]
    switch (columnKey) {
      case "title":
        // return item.title ? item.title : item.name
        let title = item.title ? item.title : item.name
        return (
          <User
            avatarProps={{ radius: "lg", src: `https://image.tmdb.org/t/p/w500/${item.backdrop_path}` }}
            description={title}
            name={title}
          />
        )
      case "date":
        // return item.my_date.substr(0, 10)
        return (
          <input type='date' value={item.my_date.substr(0, 10)} onChange={clickUpdate(item._id)} />
        )
      case "rating":
        let rating = item.my_rating
        let icon = faFaceLaughBeam
        if (rating == 3) icon = faFaceMeh
        else if (rating == 1) icon = faFaceAngry
        return (
          <FontAwesomeIcon icon={icon} className="size-8" />
        )
      case "action":
        return (
          <Tooltip color="danger" content="Delete Contents">
            <span onClick={() => clickDelete(item._id)} className="text-lg text-danger cursor-pointer active:opacity-50">
              삭제
            </span>
          </Tooltip>
        )
      default:
        return cellValue
    }
  }, [])

  return (
    <>
      {/* {JSON.stringify(movies)} */}
      <Table
        hideHeader
        aria-label="Example table with dynamic content"
        classNames={{
          base: "max-h-[520px] overflow-scroll",
          table: "min-h-[520px]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          items={movies}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item: { _id: string, title: string, date: string, rating: number, info: { id: string, image: string, media_type: string } }) => (
            <TableRow key={item._id}>
              {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )
}
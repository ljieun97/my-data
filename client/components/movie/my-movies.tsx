"use client"

import React, { useEffect, useState } from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Link, Tooltip } from "@nextui-org/react"
import { GetMovies, DeleteMovie } from "@/lib/mongo/movie"
import { Rating } from 'react-custom-rating-component'

export default function MyMovies() {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    (async () => {
      const response = await fetch('/api/movie')
      setMovies(await response.json())
    })()
  }, [movies])

  const clickDelete = (id: any) => {
    DeleteMovie(id)
  }
 
  const columns = [
    {
      key: "date",
      label: "DATE",
    },
    {
      key: "title",
      label: "TITLE",
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
      case "rating":
        return (
          <Rating
            defaultValue={item.rating}
            precision={0.5}
            size='20px'
            spacing='4px'
            activeColor='yellow'
          />
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
      <Table aria-label="Example table with dynamic content">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={movies}>
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
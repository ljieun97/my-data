"use client"

import React, { useEffect, useState } from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Link, Tooltip } from "@nextui-org/react"
import { Rating } from 'react-custom-rating-component'
import { UpdateMovie } from "@/lib/mongo/movie"

export default function MyMovies() {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    (async () => {
      const response = await fetch('/api/movie')
      setMovies(await response.json())
    })()
  }, [])

  const clickDelete = (id: any) => {
    (async () => {
      await fetch(`/api/movie/${id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        },
      })
      const response = await fetch('/api/movie')
      setMovies(await response.json())
    })()
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
    const handleRating = async (rating: number) => {
      // UpdateMovie(item, rating)
    }
    switch (columnKey) {
      case "date":
        return item.date.substr(0, 10)
      case "rating":
        return (
          <Rating
            defaultValue={item.rating}
            precision={0.5}
            size='20px'
            spacing='4px'
            activeColor='yellow'
            onChange={handleRating}
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
"use client"

import React, { useState } from "react"
import ReactStars from 'react-stars'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Link, Tooltip } from "@nextui-org/react"
import { deleteMovie } from "@/lib/mongo/movie"

const MyMovies = ({ movies }: { movies: any }) => {
  const clickDelete = (id: any) => {
    deleteMovie(id)
  }
  const handleRating = (rate: number) => {
    // update movie
    console.log(rate)
  }
  const [rows, setRows] = useState(movies)
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
          <ReactStars
            value={item.rating}
            onChange={handleRating}
            count={5}
            size={16}
            color2={'#ffd700'}
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
        <TableBody items={rows}>
          {(item: { _id: string, title: string, date: string, rating: number, info: { id: string, image: string, media_type: string } }) => (
            <TableRow key={item._id}>
              {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* <table style={{ backgroundColor: '', width: '100%' }}>
          <tbody>
            {movies?.map((movie: {_id: string, title: string, date: string, rating: number, info: {id: string, image: string, media_type: string}}) => (
              <tr key={movie._id}>
                <td width="10%">
                  <input
                    type="date"
                    defaultValue={movie.date}
                  />
                </td>
                <td>
                  <Link href={`/movie/${movie.info.id}`}>{movie.title}</Link>
                </td>
                <td width="15%" >
                {movie.rating}
                </td>
                <td width="10%">
                  <DeleteMovie id={movie._id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table> */}
    </>
  )
}

export default MyMovies





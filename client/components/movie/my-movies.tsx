"use client"

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue, Link } from "@nextui-org/react";

const MyMovies = async ({ movies }: { movies: any }) => {
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
  ];
  const rows = movies
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





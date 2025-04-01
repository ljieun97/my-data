'use client'

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  User,
} from "@heroui/react"
import { useCallback } from "react";
import { PopupList } from "./popup-list";

export const InfiniteTable = ({ columns, rows }: { columns: any[], rows: any[] }) => {

  const renderCell = useCallback((user: any, columnKey: any) => {
    const cellValue = user[columnKey];
    const { likedMovies, likedSeries } = (user.contents ?? []).reduce((acc: any, content: any) => {
      if (content.liked) {
        content.movie ? acc.likedMovies.push(content) : acc.likedSeries.push(content);
      }
      return acc;
    }, { likedMovies: [], likedSeries: [] });

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.avatar }}
            description={`${user.gender} | ${user.year}`}
            name={cellValue}
          >
          </User>
        );
      case "movie":
        return (
          <PopupList type="movie" list={likedMovies}/>
        );
      case "tv":
        return (
          <PopupList type="tv" list={likedSeries}/>
        );
      case "contents":
        return (
          <>
            {cellValue?.length | 0}
          </>
        );
      default:
        return cellValue;
    }
  }, []);


  return (
    <>
      <Table aria-label="Example table with dynamic content">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={rows}>
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )
}
'use client'

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  User,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip
} from "@heroui/react"
import { useCallback } from "react";
import { TooltipDetail } from "./tooltip-detail";
import { useRouter } from "next/navigation";

export const InfiniteTable = ({ columns, rows }: { columns: any[], rows: any[] }) => {
  const router = useRouter()
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
            description={`${cellValue} | ${user.year}`}
            name={user.id}
          >
          </User>
        );
      case "movie":
        return (
          PopoverByType("movie", likedMovies)
        );
      case "tv":
        return (
          PopoverByType("tv", likedSeries)
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

  const PopoverByType = (type: string, list: []) => {
    return (
      <>
        <Popover placement="right" classNames={{
          content: ["cursor-pointer"]
        }}>
          <PopoverTrigger>
            <Button variant="flat" isDisabled={!list.length}>{list?.length}</Button>
          </PopoverTrigger>
          <PopoverContent>
            {list.map((e: any) => (
              <div key={e.id} className="w-full">
                <Tooltip placement="right-start" closeDelay={100} className="p-2 w-[308px]" content={<TooltipDetail id={e.id} type={type} />}>
                  <div onClick={() => {
                    router.push(`/${type}/${e.id}`)
                  }}>{e.title}</div>
                </Tooltip>
              </div>
            ))}
          </PopoverContent>
        </Popover >
      </>
    )
  }

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
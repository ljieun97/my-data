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
  Image,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip
} from "@heroui/react"
import { useState, useEffect, useCallback } from "react";
import { TooltipDetail } from "./tooltip-detail";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
          <>
            <Popover placement="right" classNames={{
              content: [
                // "flex-row gap-2"
                "cursor-pointer"
              ]
            }}>
              <PopoverTrigger>
                <Button variant="flat" isDisabled={!likedMovies.length}>{likedMovies?.length}</Button>
              </PopoverTrigger>
              <PopoverContent>
                {likedMovies.map((e: any) => (
                  <div key={e.id} className="w-full">
                    <Tooltip placement="right-start" closeDelay={100} className="p-2 w-[308px]" content={<TooltipDetail id={e.id} />}>
                      {/* <Image
                        alt="Poster Image"
                        src={e.src}
                        width={50}
                      /> */}
                      <div onClick={() => {
                        router.push(`/${"movie"}/${e.id}`)
                      }}>{e.title}</div>
                    </Tooltip>
                  </div>
                ))}
              </PopoverContent>
            </Popover >
          </>
        );
      case "tv":
        return (
          <>
            {likedSeries?.length}
          </>
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
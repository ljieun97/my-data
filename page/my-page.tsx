'use client'

import { useEffect, useState } from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, User, Spinner, Card, CardBody, Input, Tabs, Tab, CardFooter, Switch, RadioGroup, Radio, Spacer, Button } from "@nextui-org/react"
import { getDetail } from "@/lib/themoviedb/api"
import InfiniteImages from "../components/common/infinite-images"
import Title from "../components/common/title"
import { useSearchParams } from "next/navigation"

export default function MyPage(props: any) {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')

  const [list, setList] = useState([]) as any
  useEffect(() => {
    (async () => {
      if(!type) return
      let listStr
      if (type == "movie") {
        listStr = localStorage.getItem("m_list")
      } else {
        listStr = localStorage.getItem("s_list")
      }
      let listArr = listStr ? JSON.parse(listStr) : []
      let list = await Promise.all(
        listArr?.map(async (e: any) => {
          return await getDetail(type, e)
        }))
      setList(list)
    })()
  }, [])

  return (
    <>
      <Tabs classNames={{panel: "p-0", base: "py-4"}} aria-label="Options" selectedKey={type}>
        <Tab key="movie" title="영화" href="/mypage?type=movie">
          <InfiniteImages type="thumb" contents={list} />
        </Tab>
        <Tab key="tv" title="시리즈" href="/mypage?type=tv">
          <InfiniteImages type="thumb" contents={list} />
        </Tab>
      </Tabs>
    </>
  )
}
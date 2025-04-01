'use client'

import { useEffect, useState } from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, User, Spinner, Card, CardBody, Input, Tabs, Tab, CardFooter, Switch, RadioGroup, Radio, Spacer, Button } from "@heroui/react"
import { getDetail } from "@/lib/themoviedb/api"
import InfiniteImages from "../components/common/infinite-images"
import Title from "../components/common/title"
import { useSearchParams } from "next/navigation"
import CardCol from "@/components/contents/card-col"

export default function MyPage({ data }: { data: any }) {
  // const searchParams = useSearchParams()
  // const type = searchParams.get('type')

  // const [list, setList] = useState([]) as any
  // useEffect(() => {
  // (async () => {
  //   if (!type) return
  //   let listStr
  //   if (type == "movie") {
  //     listStr = localStorage.getItem("m_list")
  //   } else {
  //     listStr = localStorage.getItem("s_list")
  //   }
  //   let listArr = listStr ? JSON.parse(listStr) : []
  //   let list = await Promise.all(
  //     listArr?.map(async (e: any) => {
  //       return await getDetail(type, e)
  //     }))
  //   setList(list)
  // })()
  // }, [])

  return (
    <>
      <Spacer y={16} />
      <div className="gap-4 grid grid-cols-48 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-8">
        {data.results.map((content: any, index: number) => (
          <CardCol key={index} content={content}></CardCol>
        ))}
      </div>
      {/* <Tabs classNames={{ panel: "p-0", base: "py-4" }} aria-label="Options" selectedKey={type}>
        <Tab key="movie" title="영화" href="/mypage?type=movie">
          {!list.length && <span className="text-default-500">보관함이 비어있습니다.</span>}
          <div className="gap-4 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {list.map((content: any, index: number) => (
              <CardCol key={index} content={content}></CardCol>
            ))}
          </div>
        </Tab>
        <Tab key="tv" title="시리즈" href="/mypage?type=tv">
          {!list.length && <span className="text-default-500">보관함이 비어있습니다.</span>}
          <div className="gap-4 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {list.map((content: any, index: number) => (
              <CardCol key={index} content={content}></CardCol>
            ))}
          </div>
        </Tab>
      </Tabs> */}
    </>
  )
}
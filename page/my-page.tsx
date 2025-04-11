'use client'

import { useEffect, useState } from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, User, Spinner, Card, CardBody, Input, Tabs, Tab, CardFooter, Switch, RadioGroup, Radio, Spacer, Button, Accordion, AccordionItem } from "@heroui/react"
import Title from "../components/common/title"
import { usePathname, useSearchParams } from "next/navigation"
import AccordionCards from "@/components/common/accordion-cards"

export default function MyPage({ counts }: { counts: any[] }) {
  const [isSelectedProvider, setIsSelectedProvider] = useState(false)
  const path = usePathname()
  const pathParts = path.split('/')
  const uid = pathParts[2]

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
      <Title title="마이페이지" sub="" />
      <div className="flex justify-end pb-2">
        <Switch isSelected={isSelectedProvider} onValueChange={setIsSelectedProvider}>
          제공사
        </Switch>
      </div>
  
      <div className="overflow-auto border-2 rounded-md px-2" style={{ height: "calc(100% - 12px)" }}> 
        <Accordion selectionMode="multiple" defaultExpandedKeys={["0"]}>
          {counts.map((count: any, index: number) => (
            // <AccordionItem key={index} aria-label={count._id} title={`${count._id}년 (${count.count})`}>
            <AccordionItem key={index} aria-label={count._id} title={`${count._id}년`}>
              <AccordionCards uid={uid} count={count} isProvider={isSelectedProvider} />
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  )
}
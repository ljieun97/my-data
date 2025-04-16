'use client'

import { useEffect, useState } from "react"
import { Switch, Accordion, AccordionItem } from "@heroui/react"
import Title from "../components/common/title"
import { usePathname } from "next/navigation"
import CardCol from "@/components/contents/card-col"
import { useUser } from "@/context/UserContext"

export default function MyPage({ counts }: { counts: any[] }) {
  const [isSelectedProvider, setIsSelectedProvider] = useState(false)
  const { uid } = useUser()
  // const path = usePathname()
  // const pathParts = path.split('/')
  // const uid = pathParts[2]

  const [contentsByYear, setContentsByYear] = useState<Record<string, [key: string]>>({})
  useEffect(() => {
    getContentsByYear("2025")
  }, [])

  const getContentsByYear = async (year: string) => {
    if (!uid) return
    const response = await fetch(`/api/mypage/content/by-year/${year}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': uid,
      },
    })
    const results = await response.json()
    setContentsByYear(prev => ({ ...prev, [year]: results }))
  }

  const handleDelete = async (year: string, cid: string) => {
    if (!uid) return
    const res = await fetch(`/api/mypage/content/${cid}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': uid,
      },
    })

    if (res.ok) {
      getContentsByYear(year)
    }
  }


  return (
    <>
      <Title title="마이페이지" sub="" />
      <div className="flex justify-end pb-2">
        <Switch isSelected={isSelectedProvider} onValueChange={setIsSelectedProvider}>
          제공사
        </Switch>
      </div>

      <div className="overflow-auto border-2 rounded-md px-2" style={{ height: "calc(100% - 12px)" }}>
        <Accordion selectionMode="multiple" defaultExpandedKeys={["2025"]} onSelectionChange={(key: any) => getContentsByYear(key.currentKey)}>
          {counts.map((count: any, index: number) => (
            // <AccordionItem key={index} aria-label={count._id} title={`${count._id}년 (${count.count})`}>
            <AccordionItem key={count._id} aria-label={count._id} title={`${count._id}년`}>
              {/* <AccordionCards uid={uid} count={count} isProvider={isSelectedProvider} /> */}
              {contentsByYear[count._id] ?
                <div className="gap-1 grid grid-cols-4 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-8">
                  {contentsByYear[count._id]?.map((content: any, index: number) => (
                    <CardCol key={index} thisYear={count._id} content={content} isProvider={isSelectedProvider} onUpdate={getContentsByYear} onDelete={handleDelete}></CardCol>
                  ))}
                </div>
                :
                <div className="h-[180px]">
                  loading...
                </div>
              }
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  )
}
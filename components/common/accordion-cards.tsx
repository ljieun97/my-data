"use client"

import { useEffect, useState } from "react";
import CardCol from "../contents/card-col";

export default function AccordionCards({ uid, count, isProvider }: { uid: string, count: any, isProvider: boolean }) {
  const [data, setData] = useState([])
  useEffect(() => {
    getContentsByYear(count._id)
  }, [count])

  const getContentsByYear = async (year: string) => {
    const response = await fetch(`/api/user/${uid}/content/by-year/${year}`, {
      method: "GET",
    })
    const results = await response.json()
    setData(results)
  }

  const handleDelete = async (cid: string) => {
    const res = await fetch(`/api/user/${uid}/content/${cid}`, {
      method: "DELETE"
    })
  
    if (res.ok) {
      setData(prev => prev.filter((item: any) => item._id !== cid))
    }
  }

  return (
    <div className="gap-1 grid grid-cols-4 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-8">
      {data.map((content: any, index: number) => (
        <CardCol key={index} content={content} isProvider={isProvider} onDelete={handleDelete}></CardCol>
      ))}
    </div>
  )
}
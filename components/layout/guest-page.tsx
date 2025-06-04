"use client"

import MylistYear from "@/components/mylist-year"
import { useEffect, useState } from "react"


export default function GuestPage() {

  
  const [list, setList] = useState([])
  useEffect(() => {
    const stored = localStorage.getItem("movies")
    const list = stored ? JSON.parse(stored) : []
    console.log(list)
    setList(list)
  }, [])

  return (
    <>
      <MylistYear year={"2025"} list={list} counts={[]} />
    </>
  )
}
"use client"

import MylistPage from "@/page/mylist-page"
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
      <MylistPage year={"2025"} list={list} counts={[]} />
    </>
  )
}
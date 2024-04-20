'use client'

import { GetMovies } from "@/lib/mongo/movie"
import InfiniteImages from "../common/infinite-images"
import { useEffect, useState } from "react"

export default function MyLikes() {
  const [contents, setContents] = useState([])
  useEffect(() => {
    (async () => {
      const contents = await GetMovies()
      setContents(contents)
    })()
  }, [])

  return (
    <>
      {/* {JSON.stringify(movies)} */}
      <div className="max-h-[600px] overflow-scroll" >
        <InfiniteImages contents={contents} />
      </div >
    </>
  )
}
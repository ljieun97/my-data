'use client'

import {
  Image,
} from "@heroui/react"
import { useState, useEffect } from "react";
import { getDetail } from "@/lib/themoviedb/api";

export const TooltipDetail = ({ id }: { id: any }) => {
  const [popcontent, setPopcontent] = useState({ title: "", original_title: "", release_date: "", backdrop_path: "", genres: [] }) as any

  useEffect(() => {
    (async () => {
      const results = await getDetail("movie", id)
      console.log(results)
      setPopcontent(results)
    })()
  }, [id])

  return (
    <>
      {popcontent.backdrop_path ?
        <>
          <Image
            className="brightness-125"
            alt="Detail Image"
            src={`https://image.tmdb.org/t/p/original${popcontent.backdrop_path}`}
            width={300}
            // radius="none"
          />
          <div className="pt-2 text-tiny"><b>{popcontent.title}</b>({popcontent.original_title})는 {popcontent.release_date} 공개된 {popcontent.genres.map((e: any) => e.name).join('·')} 장르 영화이다.</div>
        </>
        : <>Image Loading...</>
      }
    </>
  )
}
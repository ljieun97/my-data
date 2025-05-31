'use client'

import {
  Image,
  Skeleton,
} from "@heroui/react"
import { useState, useEffect } from "react";
import { getDetail } from "@/lib/themoviedb/api";

export const TooltipDetail = ({ id, type }: { id: any, type: string }) => {
  const [popcontent, setPopcontent] = useState({
    title: "", original_title: "", release_date: "",
    name: "", original_name: "", first_air_date: "",
    backdrop_path: "", genres: []
  }) as any

  useEffect(() => {
    (async () => {
      const results = await getDetail(type, id)
      setPopcontent(results)
    })()
  }, [id])

  return (
    <>
      {popcontent.backdrop_path ?
        <Image
          className="brightness-125"
          alt="Detail Image"
          src={`https://image.tmdb.org/t/p/original${popcontent.backdrop_path}`}
          width={300}
          height={168}
        />
        :
        <Skeleton className="rounded-lg w-[300px] h-[168px]"></Skeleton>
      }
      <div className="pt-2 text-tiny">
        {type == "movie" ?
          <>
            <b>{popcontent.title}</b>{popcontent.title!=popcontent.original_title && `(${popcontent.original_title})`}는 {popcontent.release_date} 공개된 {popcontent.genres?.map((e: any) => e.name).join('·')} 장르의 영화이다.
          </>
          :
          <>
            <b>{popcontent.name}</b>{popcontent.name!=popcontent.original_name && `(${popcontent.original_name})`}는 { popcontent.first_air_date} 공개된 {popcontent.genres?.map((e: any) => e.name).join('·')} 장르의 시리즈이다.
          </>
        }
      </div>
    </>
  )
}
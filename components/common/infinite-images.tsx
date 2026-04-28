"use client"

import { useEffect, useMemo, useState } from "react"
import CardInfo from "@/components/cards/info-media-card"
import PersonMediaCard from "@/components/cards/person-media-card"
import CardThumb from "@/components/cards/thumb-media-card"
import { useUser } from "@/context/UserContext"

type RatingUpdate = {
  id: number
  type?: string
  rating: number
}

function getContentType(content: any) {
  return content?.media_type || (content?.title ? "movie" : "tv")
}

function getRatingKey(content: any) {
  return `${getContentType(content)}:${Number(content?.id)}`
}

export default function InfiniteImages(props: any) {
  const { uid } = useUser()
  const [ratingsByKey, setRatingsByKey] = useState<Map<string, number>>(new Map())
  const contents = useMemo(() => props.contents ?? [], [props.contents])
  const sortedContents = useMemo(() => {
    if (!props.prioritizeRated) {
      return contents
    }

    return [...contents].sort((a: any, b: any) => {
      const aRating = ratingsByKey.get(getRatingKey(a)) ?? 0
      const bRating = ratingsByKey.get(getRatingKey(b)) ?? 0
      const aRated = aRating > 0 ? 1 : 0
      const bRated = bRating > 0 ? 1 : 0

      return bRated - aRated
    })
  }, [contents, props.prioritizeRated, ratingsByKey])

  useEffect(() => {
    let cancelled = false

    const loadRatings = async () => {
      const items = contents
        .map((content: any) => ({
          id: Number(content?.id),
          type: getContentType(content),
        }))
        .filter((item: { id: number; type: string }) => Number.isFinite(item.id) && item.type)

      if (!uid || !items.length) {
        setRatingsByKey(new Map())
        return
      }

      try {
        const response = await fetch("/api/mypage/ratings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: uid,
          },
          body: JSON.stringify({ items }),
        })

        if (!response.ok) {
          throw new Error(`Failed to load saved ratings: ${response.status}`)
        }

        const payload = (await response.json()) as RatingUpdate[]
        const nextRatingsByKey = new Map(
          payload
            .filter((item) => Number.isFinite(item.id) && Number.isFinite(item.rating) && item.rating > 0)
            .map((item) => [`${item.type || "movie"}:${item.id}`, item.rating]),
        )

        if (!cancelled) {
          setRatingsByKey(nextRatingsByKey)
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setRatingsByKey(new Map())
        }
      }
    }

    void loadRatings()

    return () => {
      cancelled = true
    }
  }, [contents, uid])

  let style
  if (props.type == "person")
    style = "media-recommendation-grid media-recommendation-grid--info grid gap-2.5"
  else if (props.type == "info")
    style = "media-recommendation-grid media-recommendation-grid--info grid gap-4"
  else
    style = "media-recommendation-grid grid gap-4"
  return (
    <>
      <div className={style}>
        {sortedContents.map((content: any, index: number) => {
          const contentWithRating = {
            ...content,
            userRating: ratingsByKey.get(getRatingKey(content)) ?? null,
          }

          return props.type == "person" ? (
            <PersonMediaCard key={index} content={contentWithRating}></PersonMediaCard>
          ) : props.type == "info" ? (
            <CardInfo key={index} content={contentWithRating}></CardInfo>
          ) : (
            <CardThumb key={index} content={contentWithRating}></CardThumb>
          )
        })}
      </div>
    </>
  )
}

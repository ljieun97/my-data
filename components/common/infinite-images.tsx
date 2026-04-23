import { useEffect, useMemo, useState } from "react"
import CardInfo from "../contents/card-info"
import CardThumb from "../contents/card-thumb"
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
  if (props.type == "info")
    style = "media-recommendation-grid media-recommendation-grid--info grid gap-4"
  else
    style = "media-recommendation-grid grid gap-4"
  return (
    <>
      <div className={style}>
        {contents.map((content: any, index: number) => {
          const contentWithRating = {
            ...content,
            userRating: ratingsByKey.get(getRatingKey(content)) ?? null,
          }

          return props.type == "info" ? (
            <CardInfo key={index} content={contentWithRating}></CardInfo>
          ) : (
            <CardThumb key={index} content={contentWithRating}></CardThumb>
          )
        })}
      </div>
    </>
  )
}

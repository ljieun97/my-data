"use client"

import Flatrates from "./flatrates"
import { Card, Image, CardHeader, CardBody, Button, addToast } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleInfo, faPlus, faEye, faStar } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { saveContent } from "@/lib/actions/content";

export default function CardInfo({ content }: { content: any }) {
  const { uid } = useUser()
  const router = useRouter()

  let type = ""
  let id = ""
  let img = ""

  if (content.title) {
    type = "movie"
    id = content.id
  } else if (content.name) {
    type = "tv"
    id = content.id
  }

  if (content.poster_path) img = `https://image.tmdb.org/t/p/w500/${content.poster_path}`
  else img = "/images/no-image.jpg"

  const title = content.title ? content.title : content.name
  const releaseDate = type === "movie" ? content.release_date : content.first_air_date
  const voteAverage = content.vote_average ? Number(content.vote_average).toFixed(1) : "-"
  const voteCount = content.vote_count ? Number(content.vote_count).toLocaleString() : "0"

  const handleClick = async (content: any, rating: number) => {
    saveContent({
      uid,
      id,
      content,
      rating,
      addToast,
    })
  }

  const goDetailpage = () => {
    router.push(`/${type}/${id}`)
  }

  return (
    <Card
      isBlurred={false}
      className="browse-card group/footer overflow-hidden rounded-[24px] border shadow-none"
    >
      <CardHeader className="absolute inset-x-0 top-0 z-20 flex items-start justify-end p-3">
        <Flatrates type={type} provider={content.id} />
      </CardHeader>

      <CardBody className="p-0">
        <div className="flex items-start gap-3 p-3 pb-2">
          <Image
            radius="lg"
            alt="poster"
            src={img}
            className="h-[6.8rem] w-[4.7rem] shrink-0 object-cover shadow-[0_12px_24px_rgba(15,23,42,0.16)]"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
            <div>
              <h3 className="browse-card__title line-clamp-2 text-base font-semibold leading-6 tracking-[-0.03em]">
                {title}
              </h3>
              <p className="browse-card__meta text-sm">
                {releaseDate || "Release date unavailable"}
              </p>
            </div>

            <p className="browse-card__overview line-clamp-2 text-[13px] leading-[1.35rem]">
              {content.overview || "No summary is available for this title yet."}
            </p>
          </div>
        </div>

        <div className="browse-card__footer flex items-center justify-between gap-2 border-t px-3 py-2">
          <div className="flex flex-wrap gap-2">
            <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
              <FontAwesomeIcon icon={faStar} className="mr-1.5" />
              {voteAverage}
            </span>
            <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
              <FontAwesomeIcon icon={faEye} className="mr-1.5" />
              {voteCount}
            </span>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button isIconOnly radius="full" variant="flat" size="sm" className="browse-card__action" onPress={() => handleClick(content, 1)}>
              <FontAwesomeIcon icon={faPlus} />
            </Button>
            <Button isIconOnly radius="full" variant="flat" size="sm" className="browse-card__detail" onPress={() => goDetailpage()}>
              <FontAwesomeIcon icon={faCircleInfo} />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

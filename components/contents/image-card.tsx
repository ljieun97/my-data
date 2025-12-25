"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, addToast } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faCircleInfo, faPlus, faEye } from "@fortawesome/free-solid-svg-icons"
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { saveContent } from "@/lib/actions/content";

export default function ImageCard({ content, desc }: { content: any, desc: String }) {
  const { uid } = useUser()
  const router = useRouter()

  let type = ''
  let id = ''
  let img = ''
  let adult = false

  if (content.title) {
    type = 'movie'
    adult = content.adult
    id = content.id
  } else if (content.name) {
    type = 'tv'
    adult = content.adult
    id = content.id
  }
  // if (content.backdrop_path) img = `https://image.tmdb.org/t/p/w500/${content.backdrop_path}`
  // else img = '/images/no-image.jpg'
  if (content.backdrop_path) img = `https://image.tmdb.org/t/p/w1280/${content.backdrop_path}`
  else img = '/images/no-image.jpg'

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
    // 이미 모달창이면 내용만 바꾸기
    router.push(`/${type}/${id}`)
  }

  return (
    <>
      <Card
        className="group/footer"
      >
        <Image
          removeWrapper
          alt="Card background"
          className="z-0 w-full h-40 object-cover"
          src={img}
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <CardHeader className="absolute justify-between z-30">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-4 w-1 rounded bg-white" />
            <h3 className="text-lg font-semibold leading-tight text-white drop-shadow">
              {content.title}{desc && <> · {desc}</>}
            </h3>
          </div>
          <div className="flex gap-2">
            <Flatrates type={type} provider={content.id} />
          </div>
        </CardHeader>
        {/* <CardBody>

          <div className="flex gap-2">
            <div className="flex flex-col justify-between">
              <div>
                <div className="max-w-[200px] break-keep">{content.title ? content.title : content.name}</div>
                <div className="text-gray-500">{type === "movie" ? content.release_date : content.first_air_date}</div>
              </div>

            </div>
          </div>
        </CardBody> */}
        <CardFooter className="gap-2 justify-end items-end invisible absolute group-hover/footer:visible bg-black/50 border-white/50 border-1 rounded-large shadow-small z-10 h-full">
          <Button isIconOnly size="lg" variant="faded" onPress={() => handleClick(content, 1)}><FontAwesomeIcon icon={faPlus} /></Button>
          <Button isIconOnly size="lg" variant="faded" onPress={() => goDetailpage()}><FontAwesomeIcon icon={faCircleInfo} /></Button>
        </CardFooter>
      </Card>
    </>
  )
}
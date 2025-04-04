"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreateMovie } from "@/lib/mongo/movie";
import { useUser } from "@/context/UserContext";

export default function CardThumb({ content }: { content: any }) {
  const { userId } = useUser()
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
  if (content.backdrop_path) img = `https://image.tmdb.org/t/p/w500/${content.backdrop_path}`
  else img = '/images/no-image.jpg'
  // if (content.poster_path) img = `https://image.tmdb.org/t/p/w500/${content.poster_path}`
  // else img = '/images/no-image.jpg'

  const clickCreate = async (content: any, rating: number) => {
    //영화 시리즈 구분하기
    await fetch(`/api/user/${userId}/content/${id}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, rating })
    })
  }

  const goDetailpage = () => {
    router.push(`/${type}/${id}`)
  }

  return (
    <>
      <Card
        radius="sm"
        className="group/footer mx-[2px]"
        isFooterBlurred
        isBlurred
        shadow="none"
      >
        <Image
          radius="sm"
          alt="poster"
          src={img}
          fallbackSrc="/images/no-image.jpg"
          className="w-full h-full object-cover"
        />
        <CardHeader className="absolute justify-end z-20">
          <div className="flex gap-2">
            <Flatrates type={type} provider={content.id} />
          </div>
        </CardHeader>
        <CardFooter className="justify-between items-end invisible absolute group-hover/footer:visible bg-black/25 border-white/0 border-1 rounded-small shadow-small z-10 h-full w-full">
          <div className="text-white text-sm font-bold text-pretty line-clamp-3">
            {content.title ? content.title : content.name}
          </div>
          <div className="flex flex-nowrap gap-1">
            <Button isIconOnly size="sm" variant="faded" onPress={() => clickCreate(content, 1)}><FontAwesomeIcon icon={faPlus} /></Button>
            <Button isIconOnly size="sm" variant="faded" onPress={() => goDetailpage()}><FontAwesomeIcon icon={faCircleInfo} /></Button>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
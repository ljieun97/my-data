"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, addToast } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faCircleInfo, faPlus, faEye } from "@fortawesome/free-solid-svg-icons"
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function CardInfo({ content }: { content: any }) {
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
  if (content.poster_path) img = `https://image.tmdb.org/t/p/w500/${content.poster_path}`
  else img = '/images/no-image.jpg'

  const clickCreate = async (content: any, rating: number) => {
    if (uid) {
      const res = await fetch(`/api/mypage/content/${id}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: uid, content, rating })
      })

      if (res.ok) addToast({
        title: "저장 되었습니다",
      })
    } else {
      //localstorage
      const stored = localStorage.getItem("movies")
      const list = stored ? JSON.parse(stored) : []
      list.push(content.poster_path)
      localStorage.setItem("movies", JSON.stringify(list))
      addToast({
        title: "저장 되었습니다 (게스트)",
      })
    }
  }

  const goDetailpage = () => {
    // 이미 모달창이면 내용만 바꾸기
    router.push(`/${type}/${id}`)
  }

  return (
    <>
      <Card
        isBlurred={false}
        className="group/footer"
      // shadow="sm"
      >
        <CardHeader className="absolute justify-end z-20">
          <div className="flex gap-2">
            <Flatrates type={type} provider={content.id} />
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex gap-2">
            <Image
              radius="none"
              alt="poster"
              src={img}
              className="object-cover"
              height={100}
              width={70}
            />
            <div className="flex flex-col justify-between">
              <div>
                <div className="max-w-[200px] break-keep">{content.title ? content.title : content.name}</div>
                <div className="text-gray-500">{type === "movie" ? content.release_date : content.first_air_date}</div>
              </div>
              <div className="text-gray-500">
                <FontAwesomeIcon icon={faEye} /> {content.vote_count}
              </div>
            </div>
          </div>
        </CardBody>
        <CardFooter className="gap-2 justify-end items-end invisible absolute group-hover/footer:visible bg-black/50 border-white/50 border-1 rounded-large shadow-small z-10 h-full">
          <Button isIconOnly size="lg" variant="faded" onPress={() => clickCreate(content, 1)}><FontAwesomeIcon icon={faPlus} /></Button>
          <Button isIconOnly size="lg" variant="faded" onPress={() => goDetailpage()}><FontAwesomeIcon icon={faCircleInfo} /></Button>
        </CardFooter>
      </Card>
    </>
  )
}
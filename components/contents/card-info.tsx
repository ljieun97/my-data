"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faCircleInfo, faPlus, faEye } from "@fortawesome/free-solid-svg-icons"
import { useRouter, useSearchParams } from "next/navigation";

export default function CardInfo({ content }: { content: any }) {
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
    //영화 시리즈 구분하기
    if (type == "movie") {
      let listStr = localStorage.getItem("m_list")
      let listArr = listStr ? JSON.parse(listStr) : []
      listArr.push(content.id)
      localStorage.setItem("m_list", JSON.stringify(listArr))
    } else {
      let listStr = localStorage.getItem("s_list")
      let listArr = listStr ? JSON.parse(listStr) : []
      listArr.push(content.id)
      localStorage.setItem("s_list", JSON.stringify(listArr))
    }
  }

  const goDetailpage = () => {
    // 이미 모달창이면 내용만 바꾸기
    router.push(`/${type}/${id}`)
  }

  return (
    <>
      <Card
        // isBlurred
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
          {/* TODO 추가 시 알림 추가하기 */}
          <Button isIconOnly size="lg" variant="faded" onPress={() => clickCreate(content, 1)}><FontAwesomeIcon icon={faPlus} /></Button>
          <Button isIconOnly size="lg" variant="faded" onPress={() => goDetailpage()}><FontAwesomeIcon icon={faCircleInfo} /></Button>
        </CardFooter>
      </Card>
    </>
  )
}
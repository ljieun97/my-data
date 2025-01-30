"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CardThumb({ content }: { content: any }) {
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
    router.push(`/${type}/${id}`)
  }

  return (
    <>
      <Card
        radius="sm"
        className="group/footer"
        isFooterBlurred
        isBlurred
      >
        <Image
          radius="sm"
          alt="poster"
          src={img}
          className="w-full h-full object-cover"
        />
        <CardHeader className="absolute justify-end z-20">
          <div className="flex gap-2">
            <Flatrates type={type} provider={content.id} />
          </div>
        </CardHeader>
        {/* {!content.backdrop_path &&
          <CardBody className="absolute z-20">
            <h4 className="text-white text-lg font-bold tracking-tight">
              {content.title ? content.title : content.name}
            </h4>
          </CardBody>
        } */}
        <CardFooter className="justify-between items-end invisible absolute group-hover/footer:visible bg-black/25 border-white/50 border-1 rounded-small shadow-small z-10 h-full w-full">
          {/* TODO 추가 시 알림 추가하기 */}
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
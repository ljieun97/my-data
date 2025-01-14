"use client"

import Flatrates from "../movie/flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faArrowUpRightFromSquare, faPlus } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation";

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
      {/* <Card
        radius="none"
        // className="border-none group/footer col-span-4 lg:col-span-2  md:col-span-3 sm:col-span-3"
        className="border-none group/footer items-center h-full"
        isFooterBlurred
        isBlurred
      > */}
        <Image
          radius="sm"
          alt="poster"
          src={img}
          // className="w-[210px] h-[250px] sm:h-[270px] md:h-[290px] lg:h-[290px] object-cover"
          className="h-full object-cover"
        />

        {/* <CardHeader className="absolute justify-end">
          <div className="flex gap-2">
            <Flatrates type={type} provider={content.id} />
          </div>
        </CardHeader> */}
        {/* {!img &&
          <CardBody className="absolute bottom-1/3 z-10">
            <h4 className="text-white text-lg font-bold tracking-tight text-center">
              {content.title ? content.title : content.name}
            </h4>
          </CardBody>
        } */}
        {/* <CardFooter className="justify-between invisible absolute group-hover/footer:visible bg-black/50 border-white/50 border-1 py-1 mx-1 rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small z-10">
          <h4 className="text-white text-sm font-bold ">
            {content.title ? content.title : content.name}
          </h4>
          <div>
            <Button isIconOnly onPress={() => clickCreate(content, 1)}><FontAwesomeIcon icon={faPlus} /></Button>
            <Button isIconOnly onPress={() => goDetailpage()}><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></Button>
          </div>
        </CardFooter> */}
      {/* </Card> */}
    </>
  )
}
"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation";
import { CreateMovie } from "@/lib/mongo/movie";
import { useUser } from "@/context/UserContext";

export default function CardCol({ content, isProvider }: { content: any, isProvider: boolean }) {
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
  // if (content.backdrop_path) img = `https://image.tmdb.org/t/p/w500/${content.backdrop_path}`
  // else img = '/images/no-image.jpg'
  if (content.poster_path) img = `https://image.tmdb.org/t/p/w500/${content.poster_path}`
  else img = '/images/no-image.jpg'

  const clickCreate = async (content: any, rating: number) => {
    //영화 시리즈 구분하기
    // if (type == "movie") {
    //   let listStr = localStorage.getItem("m_list")
    //   let listArr = listStr ? JSON.parse(listStr) : []
    //   listArr.push(content.id)
    //   localStorage.setItem("m_list", JSON.stringify(listArr))
    // } else {
    //   let listStr = localStorage.getItem("s_list")
    //   let listArr = listStr ? JSON.parse(listStr) : []
    //   listArr.push(content.id)
    //   localStorage.setItem("s_list", JSON.stringify(listArr))
    // }

    // await CreateMovie(content, rating)

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
        className="group/footer w-full aspect-[26/37]"
        isFooterBlurred
        isBlurred
        shadow="none"
      >
        <Image
          radius="sm"
          alt="poster"
          src={img}
          className="w-full h-full object-cover"
        />
        {isProvider &&
          <CardHeader className="absolute justify-end z-20">
            <div className="flex gap-2">
              <Flatrates type={type} provider={content.id} />
            </div>
          </CardHeader>
        }
        {/* {!content.poster_path &&
          <CardBody className="absolute z-20">
            <h4 className="text-white text-lg font-bold tracking-tight">
              {content.title ? content.title : content.name}
            </h4>
          </CardBody>
        } */}
      </Card>
    </>
  )
}
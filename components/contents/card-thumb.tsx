"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Skeleton, addToast } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { saveContent } from "@/lib/actions/content";

export default function CardThumb({ content }: { content: any }) {
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
  if (content.backdrop_path) img = `https://image.tmdb.org/t/p/w500/${content.backdrop_path}`
  else img = '/images/no-image.jpg'
  // if (content.poster_path) img = `https://image.tmdb.org/t/p/w500/${content.poster_path}`
  // else img = '/images/no-image.jpg'

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
          fallbackSrc={<Skeleton className="w-full h-full rounded-sm"></Skeleton>}
        // className="w-[240px] h-[140px] object-cover"
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
            <Button isIconOnly size="sm" variant="faded" onPress={() => handleClick(content, 1)}><FontAwesomeIcon icon={faPlus} /></Button>
            <Button isIconOnly size="sm" variant="faded" onPress={() => goDetailpage()}><FontAwesomeIcon icon={faCircleInfo} /></Button>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faCircleInfo } from "@fortawesome/free-solid-svg-icons"
import { CreateMovie } from "@/lib/mongo/movie";
import { useRouter } from "next/navigation";

export default function CardThumb({ content }: { content: any }) {
  const router = useRouter()

  let type = ''
  let id = ''
  let img = ''
  let adult = false

  if (content.webtoonId) {
    type = 'webtoon' //웹툰엔 title도 있음
    img = content.img
    id = img.split('/')[4]
  } else if (content.isbn) {
    type = 'book'
    img = content.image
    id = content.isbn
  } else if (content.type) { //db
    type = content.type == "영화" ? 'movie' : 'tv'
    adult = content.adult
    id = content.id
  } else if (content.title) {
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

  const clickCreate = async (content: any, rating: number) => {
    await CreateMovie(content, rating)
  }

  const goDetailpage = () => {
    switch (type) {
      case 'movie':
      case 'tv':
        router.push(`/${type}/${id}`)
      case 'webtoon':
        if (content.service != 'naver') return
        router.push(`/${type}/${id}`)
    }
  }

  return (
    <div>
      <Card
        radius="none"
        // className="border-none group/footer col-span-4 lg:col-span-2  md:col-span-3 sm:col-span-3"
        className="border-none group/footer items-center h-full"
        isFooterBlurred
        isBlurred
      >
        <Image
          radius="sm"
          alt="poster"
          src={img}
          // className="w-[210px] h-[250px] sm:h-[270px] md:h-[290px] lg:h-[290px] object-cover"
          className="object-cover"
        />

        <CardHeader className="absolute justify-end">
          <div className="flex gap-2">
            {(type == 'movie' || type == 'tv') &&
              <Flatrates type={type} provider={content.id} />
            }
            {type == 'webtoon' &&
              <Flatrates type={type} provider={content.service} />
            }
          </div>
        </CardHeader>
        {!img &&
          <CardBody className="absolute bottom-1/3 z-10">
            <h4 className="text-white text-lg font-bold tracking-tight text-center">
              {content.title ? content.title : content.name}
            </h4>
          </CardBody>
        }
        <CardFooter className="invisible absolute group-hover/footer:visible justify-between bg-black/50 border-white/50 border-1 py-1 mx-1 rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small z-10">
          <h4 className="text-white text-sm font-bold ">
            {content.title ? content.title : content.name}
          </h4>
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
              >
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-labelledby="Static Actions" disabledKeys={["ing", "like"]}>
              <DropdownSection title={content.title ? content.title : content.name} showDivider>
                <DropdownItem
                  key="great"
                  onPress={() => clickCreate(content, 5)}
                  startContent={<FontAwesomeIcon icon={faFaceLaughSquint} />}
                >
                  최고다 최고
                </DropdownItem>
                <DropdownItem
                  key="good"
                  onPress={() => clickCreate(content, 3)}
                  startContent={<FontAwesomeIcon icon={faFaceSmileBeam} />}
                >
                  볼만해요
                </DropdownItem>
                <DropdownItem
                  key="bad"
                  onPress={() => clickCreate(content, 1)}
                  startContent={<FontAwesomeIcon icon={faFaceFrownOpen} />}
                >
                  별로예요
                </DropdownItem>
              </DropdownSection>
              <DropdownItem key="ing">보는중</DropdownItem>
              <DropdownItem key="like">찜하기</DropdownItem>
              <DropdownItem
                key="detail"
                // onPress={() => router.push(`/${type}/${id}`)}
                onPress={() => goDetailpage()}
              // endContent={<FontAwesomeIcon icon={faCircleInfo} />}
              >
                상세정보
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardFooter>
      </Card>
    </div>
  )
}
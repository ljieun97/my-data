"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"
import { CreateMovie } from "@/lib/mongo/movie";
import { useRouter } from "next/navigation";

const MovieCard = ({ content }: { content: any }) => {
  const router = useRouter()

  let type = ''
  let id = ''
  let img = ''
  let adult = false

  if (content.webtoonId) {
    type = 'webtoon' //웹툰엔 title도 있음
    img = content.img
    id = img.split('/')[4]
    console.log(id)
  } else if (content.isbn) {
    type = 'book'
    img = content.image
    id = content.isbn
  } else if (content.title) {
    type = 'movie'
    adult = content.adult
    id = content.id
  } else if (content.name) {
    type = 'tv'
    adult = content.adult
    id = content.id
  }
  if (content.poster_path) img = `https://image.tmdb.org/t/p/w500/${content.poster_path}`

  const clickCreate = async (content: any, rating: number) => {
    await CreateMovie(content, rating)
  }

  return (
    <>
      <Card
        // radius="sm"
        className="border-none group/footer"
        isFooterBlurred

      >
        {adult ? (
          <Image
            alt="poster"
            className="object-cover h-[240px] blur-md"
            width="100%"
            // height="100%"
            src={img}
          />
        ) : (
          <Image
            alt="poster"
            className="object-cover h-[240px]"
            width="100%"
            // height="100%"
            src={img}
          />
        )}
        <CardHeader className="absolute w-[calc(100%_-_8px)] justify-start">
          <div className="flex gap-3">
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
        <CardFooter className="invisible absolute group-hover/footer:visible justify-between bg-black/50 border-white/50 border-1 py-1 ml-1 rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small z-10">
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
                  onClick={() => clickCreate(content, 5)}
                  startContent={<FontAwesomeIcon icon={faFaceLaughSquint} />}
                >
                  최고다 최고
                </DropdownItem>
                <DropdownItem
                  key="good"
                  onClick={() => clickCreate(content, 3)}
                  startContent={<FontAwesomeIcon icon={faFaceSmileBeam} />}
                >
                  볼만해요
                </DropdownItem>
                <DropdownItem
                  key="bad"
                  onClick={() => clickCreate(content, 1)}
                  startContent={<FontAwesomeIcon icon={faFaceFrownOpen} />}
                >
                  별로예요
                </DropdownItem>
              </DropdownSection>
              <DropdownItem key="ing">보는중</DropdownItem>
              <DropdownItem key="like">찜하기</DropdownItem>
              <DropdownItem
                key="info"
                onClick={() => router.push(`/${type}/${id}`)}
                endContent={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}
              >
                상세정보
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardFooter>
      </Card>
    </>
  )
}

export default MovieCard
"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Link, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@nextui-org/react";
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faCircleCheck, faEllipsisVertical, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"
import { CreateMovie } from "@/lib/mongo/movie";
import MovieInfo from "./movie-info";
import { getMovieDetail, getProviders, getSeriseDetail } from "@/lib/themoviedb/api";
import { useRouter } from "next/navigation";

const MovieCard = ({ content }: { content: any }) => {
  const router = useRouter()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [contentDetail, setContentDetail] = useState()
  const [isHoverableCard, setIsHoverableCard] = useState(false)
  const [isHoverableCheck, setIsHoverableCheck] = useState(false)

  let type = ''
  let img = ''
  let adult = false

  if (content.webtoonId) {
    type = 'webtoon' //웹툰엔 title도 있음
    img = content.img
  } else if (content.isbn) {
    type = 'book'
    img = content.image
  } else if (content.title) {
    type = 'movie'
    adult = content.adult
  } else if (content.name) {
    type = 'tv'
    adult = content.adult
  }
  if (content.poster_path) img = `https://image.tmdb.org/t/p/w500/${content.poster_path}`

  const onMouseEnterCard = () => {
    setIsHoverableCard(true)
  }
  const onMouseLeaveCard = () => {
    setIsHoverableCard(false)
  }
  const onMouseEnterCheck = () => {
    setIsHoverableCheck(true)
  }
  const onMouseLeaveCheck = () => {
    setIsHoverableCheck(false)
  }

  const clickCreate = async (content: any, rating: number) => {
    await CreateMovie(content, rating)
  }

  const onClickInfo = async (id: string) => {
    switch (type) {
      case 'movie':
        setContentDetail(await getMovieDetail(id))
        break
      case 'tv':
        setContentDetail(await getSeriseDetail(id))
        break
    }
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
        {/* {isHoverableCard && */}
        {/* <CardFooter className="bg-black/70 absolute bottom-0 z-10 invisible group-hover/footer:visible"> */}
        <CardFooter className="invisible absolute group-hover/footer:visible justify-between bg-black/50 border-white/50 border-1 py-1 ml-1 rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small z-10">
          {/* <div className="flex w-full" > */}
          <h4 className="text-white text-sm font-bold ">
            {content.title ? content.title : content.name}
          </h4>
          {/* <p>{movie.tagline}</p> */}
          {/* <div className="flex justify-between">
              <div className="flex gap-1 items-center">
                <Tooltip content={"찜하기"}>
                  <FontAwesomeIcon icon={faCirclePlus} style={{ color: 'white' }} className="cursor-pointer size-8" />
                </Tooltip>
                <div className="flex gap-1" onMouseLeave={() => onMouseLeaveCheck()}>
                  {isHoverableCheck ?
                    <>
                      <Tooltip content={"재밌어요"}>
                        <FontAwesomeIcon icon={faFaceLaughSquint} style={{ color: 'white' }} className="cursor-pointer size-8" onClick={() => clickCreate(content, 5)} />
                      </Tooltip>
                      <Tooltip content={"볼만해요"}>
                        <FontAwesomeIcon icon={faFaceSmileBeam} style={{ color: 'white' }} className="cursor-pointer size-8" onClick={() => clickCreate(content, 3)} />
                      </Tooltip>
                      <Tooltip content={"별로예요"}>
                        <FontAwesomeIcon icon={faFaceAngry} style={{ color: 'white' }} className="cursor-pointer size-8" onClick={() => clickCreate(content, 1)} />
                      </Tooltip>
                    </> :
                    <FontAwesomeIcon icon={faCircleCheck} style={{ color: 'white' }} className="size-8" onMouseEnter={() => onMouseEnterCheck()}
                    />
                  }
                </div>
              </div> */}

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
                  onPress={onOpen}
                  onClick={() => onClickInfo(content.id)}
                  endContent={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}
                >
                  상세정보
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {/* <Button onClick={()=>router.push(`/info`)}>상세정보</Button> */}
            {/* {JSON.stringify(content)} */}

            {/* </div> */}
            {/* </div> */}

        </CardFooter>
      </Card>
      {contentDetail &&
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}
          size='4xl'
          scrollBehavior="inside"
          placement='center'
          classNames={{
            base: "bg-black text-white"
          }}
          motionProps={{
            variants: {
              enter: {
                // y: 0,
                // opacity: 1,
                // transition: {
                //   duration: 0.3,
                //   ease: "easeOut",
                // },
              },
              // exit: {
              //   y: -20,
              //   opacity: 0,
              //   transition: {
              //     duration: 0.2,
              //     ease: "easeIn",
              //   },
              // },
            }
          }}
        >
          <ModalContent>
            <MovieInfo content={contentDetail} />
          </ModalContent>
        </Modal>
      }
    </>
  )
}

export default MovieCard
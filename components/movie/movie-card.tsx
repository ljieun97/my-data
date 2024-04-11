"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Link } from "@nextui-org/react";
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCirclePlus, faFaceLaughBeam, faFaceMeh, faFaceAngry, faCircleCheck } from "@fortawesome/free-solid-svg-icons"
import { CreateMovie } from "@/lib/mongo/movie";
import MovieInfo from "./movie-info";
import { getMovieDetail, getProviders, getSeriseDetail } from "@/lib/themoviedb/api";
import { useRouter } from "next/navigation";

const MovieCard = ({ movie }: { movie: any }) => {
  const router = useRouter()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [content, setContent] = useState()
  const [isHoverableCard, setIsHoverableCard] = useState(false)
  const [isHoverableCheck, setIsHoverableCheck] = useState(false)

  let type = ''
  let img = ''

  if (movie.webtoonId) {
    type = 'webtoon' //웹툰엔 title도 있음
    img = movie.img
  } else if (movie.isbn) {
    type = 'book'
    img = movie.image
  } else if (movie.title) {
    type = 'movie'
  } else if (movie.name) {
    type = 'tv'
  }
  if (movie.poster_path) img = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`

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

  const clickCreate = async (movie: any, rating: number) => {
    await CreateMovie(movie, rating)
  }

  const onClickInfo = async (id: string) => {
    switch (type) {
      case 'movie':
        setContent(await getMovieDetail(id))
        break
      case 'tv':
        setContent(await getSeriseDetail(id))
        break
    }
  }

  return (
    <>
      <Card
        // radius="sm"
        className="border-none group/footer"
        isFooterBlurred
        isHoverable
      >
        <Image
          alt="poster"
          className="object-cover h-[240px]"
          width="100%"
          // height="100%"
          src={img}
        />
        <CardHeader className="absolute w-[calc(100%_-_8px)] justify-start">
          <div className="flex gap-3">
            {(type == 'movie' || type == 'tv') &&
              <Flatrates type={type} provider={movie.id} />
            }
            {type == 'webtoon' &&
              <Flatrates type={type} provider={movie.service} />
            }
          </div>
        </CardHeader>
        {!img &&
          <CardBody className="absolute bottom-1/3 z-10">
            <h4 className="text-white text-lg font-bold tracking-tight text-center">
              {movie.title ? movie.title : movie.name}
            </h4>
          </CardBody>
        }
        {/* {isHoverableCard && */}
        <CardFooter className="bg-black/70 absolute bottom-0 z-10 invisible group-hover/footer:visible">
          <div className="flex flex-col w-full" >
            <h4 className="text-white font-bold tracking-tight">
              {/* {(movie.title ? movie.title : movie.name).split('-')[0]} */}
              {movie.title ? movie.title : movie.name}
            </h4>
            {/* <p>{movie.tagline}</p> */}
            <div className="flex justify-between">
              <div className="flex gap-1 items-center">
                <Tooltip content={"찜하기"}>
                  <FontAwesomeIcon icon={faCirclePlus} style={{ color: 'white' }} className="cursor-pointer size-8" />
                </Tooltip>
                <div className="flex gap-1" onMouseLeave={() => onMouseLeaveCheck()}>
                  {!isHoverableCheck &&
                    <FontAwesomeIcon icon={faCircleCheck} style={{ color: 'white' }} className="size-8" onMouseEnter={() => onMouseEnterCheck()}
                    />
                  }
                  {isHoverableCheck &&
                    <>
                      <Tooltip content={"재밌어요"}>
                        <FontAwesomeIcon icon={faFaceLaughBeam} style={{ color: 'white' }} className="cursor-pointer size-8" onClick={() => clickCreate(movie, 5)} />
                      </Tooltip>
                      <Tooltip content={"볼만해요"}>
                        <FontAwesomeIcon icon={faFaceMeh} style={{ color: 'white' }} className="cursor-pointer size-8" onClick={() => clickCreate(movie, 3)} />
                      </Tooltip>
                      <Tooltip content={"화나요"}>
                        <FontAwesomeIcon icon={faFaceAngry} style={{ color: 'white' }} className="cursor-pointer size-8" onClick={() => clickCreate(movie, 1)} />
                      </Tooltip>
                    </>
                  }
                </div>
              </div>
              <div className="flex items-center">
                {(type == 'movie' || type == 'tv') &&
                  <Button onPress={onOpen} onClick={() => onClickInfo(movie.id)}>상세정보</Button>
                }
                {/* <Button onClick={()=>router.push(`/info`)}>상세정보</Button> */}
                {/* {JSON.stringify(content)} */}
                {content &&
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
                      <MovieInfo content={content} />
                    </ModalContent>
                  </Modal>
                }
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

export default MovieCard
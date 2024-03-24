"use client"

import Flatrates from "./flatrates"
import { Card, CardFooter, Image, CardHeader, CardBody, Button, Tooltip } from "@nextui-org/react";
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCirclePlus, faFaceLaughBeam, faFaceMeh, faFaceAngry, faCircleCheck } from "@fortawesome/free-solid-svg-icons"

const MovieCard = ({ movie }: { movie: any }) => {

  //아이콘이랑 사진이랑 따로 로딩도게 (로딩빠른거 먼저 보여주기)

  const [isHoverableCard, setIsHoverableCard] = useState(false)
  const [isHoverableCheck, setIsHoverableCheck] = useState(false)

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

  return (
    <Card
      radius="sm"
      //className="border-none group/item hover:bg-slate-100"
      // fullWidth

      isFooterBlurred
      isHoverable
    // onMouseEnter={() => onMouseEnterCard()}
    // onMouseLeave={() => onMouseLeaveCard()}
    >
      <Image
        
        alt="poster"
        className="object-cover"
        src={movie.backdrop_path ? `https://image.tmdb.org/t/p/w500/${movie.backdrop_path}` : '/images/no-image.jpg'}
      />
      <CardHeader className="absolute w-[calc(100%_-_8px)] justify-start">
        <div className="flex gap-3">
          {/* <Flatrates providers={movie.providers} /> */}
          <Flatrates type={movie.title ? 'movie' : 'tv'} id={movie.id} />
        </div>
      </CardHeader>
      {!movie.backdrop_path &&
        <CardBody className="absolute bottom-1/3 z-10">
          <h4 className="text-white text-lg font-bold tracking-tight text-center">
            {movie.title ? movie.title : movie.name}
          </h4>
        </CardBody>
      }
      {isHoverableCard &&
        <CardFooter

        //className="bg-black/70  absolute bottom-0 z-10 group/edit invisible group-hover/item:visible"
        >
          <div className="flex flex-col w-full" >
            <h4 className="text-white font-bold tracking-tight">
              {(movie.title ? movie.title : movie.name).split('-')[0]}
            </h4>
            {/* <p>{movie.tagline}</p> */}
            <div className="flex justify-between">
              <div className="flex gap-1 items-center">
                <Tooltip content={"찜하기"}>
                  <FontAwesomeIcon icon={faCirclePlus} className="cursor-pointer" />
                </Tooltip>
                <div className="flex gap-1" onMouseLeave={() => onMouseLeaveCheck()}>
                  {!isHoverableCheck &&
                    <FontAwesomeIcon icon={faCircleCheck} onMouseEnter={() => onMouseEnterCheck()}
                    />
                  }
                  {isHoverableCheck &&
                    <>
                      <Tooltip content={"재밌어요"}>
                        <FontAwesomeIcon icon={faFaceLaughBeam} className="cursor-pointer" />
                      </Tooltip>
                      <Tooltip content={"볼만해요"}>
                        <FontAwesomeIcon icon={faFaceMeh} className="cursor-pointer" />
                      </Tooltip>
                      <Tooltip content={"화나요"}>
                        <FontAwesomeIcon icon={faFaceAngry} className="cursor-pointer" />
                      </Tooltip>
                    </>
                  }
                </div>
              </div>
              <div className="flex items-center">
                상세정보
              </div>
            </div>
          </div>
        </CardFooter>
      }
    </Card>
  )
}

export default MovieCard
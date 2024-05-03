'use client'

import InfiniteImages from "../common/infinite-images"
import { Avatar, Chip, Tooltip, Image, Button, Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react"
import Title from "../common/title"
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react";
import ReactPlayer from "react-player/lazy";

export default function CardInfo(props: any) {
  const { content, casts, sim, videoKey } = props
  const videoPath = `https://www.youtube.com/watch?v=${videoKey}`
  const router = useRouter()
  const [isMute, setIsMute] = useState(true)

  return (
    <>
      <Card className=" max-h-[820px]" radius="none" isBlurred>
        {/* <CardHeader className="p-0">
        </CardHeader> */}
        <CardBody className="p-0">
          <div className="relative">
            <div className="flex left-2 bottom-2 gap-2 absolute z-10">
              <Button
                isIconOnly
                variant="ghost"
                color="success"
                onClick={() => router.back()}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </Button>
              <Button
                isIconOnly
                variant="ghost"
                color="success"
                onClick={() => {
                  setIsMute(!isMute)
                }}
              >
                <FontAwesomeIcon icon={isMute ? faVolumeXmark : faVolumeHigh} />
              </Button>
            </div>
            <div className="aspect-video">
              <div className="absolute z-5 w-full h-full bg-gradient-to-b from-black/0 to-black/25"></div>
              {videoKey ?
                <ReactPlayer
                  width="100%"
                  height="100%"
                  url={videoPath}
                  playing={true}
                  muted={isMute}
                  loop={true}
                />
                :
                <>
                  {
                    content.backdrop_path &&
                    <Image
                      removeWrapper={true}
                      radius="sm"
                      alt="Card background"
                      className="w-full aspect-video object-cover"
                      src={content.backdrop_path ? `https://image.tmdb.org/t/p/original/${content.backdrop_path}` : ''}
                    />
                  }
                </>
              }

              {/* {content.thumb &&
            <Image
              removeWrapper={true}
              radius="sm"
              alt="Card background"
              src={content.thumb}
            />
          } */}
            </div>
          </div>



          <div className="p-4">
            <Title
              title={content.title ? content.title : content.name}
              // sub={`${content.adult ? '(19)' : ''}`}
              sub={
                <>
                  {content.release_date?.substr(0, 4)}
                  {content.first_air_date?.substr(0, 4)}
                </>
              }
            />
            <div className="md:flex lg:flex gap-4 px-2">
              <div className="md:basis-3/5 lg:basis-3/5 pb-4">
                <p className="text-default-600">
                  {content.overview}
                  {content.about} 
                </p>
              </div>

              <div className="md:basis-2/5 lg:basis-2/5">
                {casts &&
                  <div className="flex break-keep pb-4">
                    <div className="pr-2">출연</div>
                    <div className="flex flex-wrap">
                      {casts.map((cast: any) => (
                        <Tooltip key={cast.credit_id} content={cast.name}>
                          <Avatar
                            isBordered
                            size="md"
                            src={cast.profile_path ? `https://image.tmdb.org/t/p/w500/${cast.profile_path}` : '/images/no-image.jpg'}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                }

                <div className="flex break-keep">
                  <div className="pr-2">장르</div>
                  <div className="flex flex-wrap gap-1">
                    {content.genres?.map((item: any) => (
                      <Chip key={item.id} color="success" variant="bordered">{item.name}</Chip>
                    ))}
                    {content.genre}
                    {/* {content.genre?.split(', ').length < 2 ?
                    <Chip color="success" variant="bordered">{content.genre}</Chip>
                    :
                    content.genre?.split(', ').map((item: any) => (
                      <Chip key={item.id} color="success" variant="bordered">{item.name}</Chip>
                    ))
                  } */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {
            sim?.length > 0 &&
            <div className="p-4 pt-10">
              <h4 className="pb-4">추천 콘텐츠</h4>
              <InfiniteImages contents={sim} />
            </div>
          }
        </CardBody>
        <CardFooter className="gap-3 px-4 py-6">
          <div className="flex gap-1">
            <p className="font-semibold text-default-400 text-small">4</p>
            <p className=" text-default-400 text-small">Following</p>
          </div>
          <div className="flex gap-1">
            <p className="font-semibold text-default-400 text-small">97.1K</p>
            <p className="text-default-400 text-small">Followers</p>
          </div>
        </CardFooter>
      </Card >
    </>
  )
}
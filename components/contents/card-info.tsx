'use client'

import InfiniteImages from "../common/infinite-images"
import { Avatar, Chip, Tooltip, Image, Button, Card, CardHeader, CardBody, CardFooter, AvatarGroup, Spacer } from "@nextui-org/react"
import Title from "../common/title"
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react";
import ReactPlayer from "react-player/lazy";

export default function CardInfo(props: any) {
  const { content, casts, sim, videoKey } = props
  const cutCasts = casts?.slice(0, 8)
  const videoPath = `https://www.youtube.com/watch?v=${videoKey}`
  const router = useRouter()
  const [isMute, setIsMute] = useState(true)
  const [isMore, setIsMore] = useState(true)

  console.log(casts)
  return (
    <>
    <Spacer y={16}/>
      <Card className="max-h-[820px]" radius="none" isBlurred>
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
                  // playing={true}
                  muted={isMute}
                // loop={true}
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
            <div className="px-2">
              <div className="flex">
                <div className="md:basis-4/5 lg:basis-3/5 pb-4">
                  <p className="text-default-600">
                    {content.overview}
                    {content.about}
                  </p>
                </div>
              </div>

              {casts &&
                <div className="pt-10">
                  <h4 className="pb-4 font-bold text-lg">출연</h4>
                  <div className="gap-3 lg:gap-2 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8">
                    {cutCasts?.map((item: any, index: number) => (
                      <Card shadow="sm" radius="sm" key={index} isBlurred>
                        <CardBody className="overflow-visible p-0">
                          <Image
                            shadow="sm"
                            radius="sm"
                            width="100%"
                            alt={item.name}
                            className="w-full object-cover max-h-[160px] lg:max-h-[120px]"
                            src={item.profile_path ? `https://image.tmdb.org/t/p/w500/${item.profile_path}` : '/images/no-image.jpg'}
                          />
                        </CardBody>
                        <CardFooter className="px-0">
                          <div className="w-full text-center">
                            <p className="text-small">{item.name}</p>
                            <p className="text-tiny italic text-default-500">{item.character}</p>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}

                  </div>
                  {/* {casts.length > 8 &&
                    <Button onClick={() => { setIsMore(!isMore) }}>더보기</Button>
                  } */}
                </div>
              }

              {/* {casts &&
                <div className="pt-10">
                  <h4 className="pb-4">출연</h4>
                  <div className="flex flex-wrap gap-4">
                    {casts.map((item: any) => (
                      <Tooltip key={item.credit_id} content={item.name}>
                        <Avatar
                          radius="sm"
                          className="w-20 h-20 text-large"
                          src={item.profile_path ? `https://image.tmdb.org/t/p/w500/${item.profile_path}` : '/images/no-image.jpg'}
                        />
                      </Tooltip>
                    ))}
                  </div>
                </div>
              } */}

              {sim?.length > 0 &&
                <div className="pt-10">
                  <h4 className="pb-4 font-bold text-lg">추천 콘텐츠</h4>
                  <InfiniteImages contents={sim} />
                </div>
              }

              {casts &&
                <div className="pt-10">
                  <h4 className="pb-4 font-bold text-lg">세부정보</h4>
                  {casts.map((item: any, index: number) => (
                    <span className="text-default-500" key={index}>{item.original_name}({item.character}), </span>
                  ))}
                </div>
              }
            </div>
          </div>


        </CardBody>
        <CardFooter className="gap-3 px-6 py-6">
          <div className="flex gap-1">
            <p className="font-semibold text-default-400 text-small">4</p>
            <p className=" text-default-400 text-small">Following</p>
          </div>
          <div className="flex gap-1">
            <p className="font-semibold text-default-400 text-small">97.1K</p>
            <p className="text-default-400 text-small">Followers 준비중인 서비스</p>
          </div>
        </CardFooter>
      </Card >
    </>
  )
}
'use client'

import InfiniteImages from "../components/common/infinite-images"
import { Avatar, Chip, Tooltip, Image, Button, Card, CardHeader, CardBody, CardFooter, AvatarGroup, Spacer } from "@nextui-org/react"
import Title from "../components/common/title"
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons"
import { useRef, useState } from "react";
import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

export default function DetailPage(props: any) {
  const { content, casts, sim, providers, videoKey } = props
  const cutCasts = casts?.slice(0, 8)
  const videoPath = videoKey ? `https://www.youtube.com/watch?v=${videoKey}` : ''
  const router = useRouter()
  const [isMute, setIsMute] = useState(true)
  const castsRef = useRef<HTMLDivElement>(null)
  const goCasts = () => {
    castsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Spacer y={16} />
      <Card className="mx-auto max-w-7xl max-h-[840px]" radius="none" isBlurred>
        {/* <CardHeader className="p-0">
        </CardHeader> */}
        <CardBody className="px-6 py-0">
          <div className="relative">
            <div className="flex left-2 bottom-2 gap-2 absolute z-10">
              <Button
                isIconOnly
                variant="ghost"
                color="success"
                onPress={() => router.back()}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </Button>
              <Button
                isIconOnly
                variant="ghost"
                color="success"
                onPress={() => {
                  setIsMute(!isMute)
                }}
              >
                <FontAwesomeIcon icon={isMute ? faVolumeXmark : faVolumeHigh} />
              </Button>
            </div>
            <div className="aspect-video">
              <div className="absolute z-5 w-full h-full bg-gradient-to-b from-black/0 to-black/25"></div>
              {videoPath ?
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
                      radius="none"
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

          <div className="pt-6"> {/* 영상 외 */}
            <Title
              title={content.title || content.name || ''}
              // sub={`${content.adult ? '(19)' : ''}`}
              sub={
                <>
                  {content.release_date ? content.release_date.substr(0, 4) : ''}
                  {content.first_air_date ? content.first_air_date.substr(0, 4) : ''}
                </>
              }
            />

            <div className="pt-2 pb-6 md:flex text-default-500">
              <div className="md:basis-3/5 pb-4">
                <p>
                  {content.overview}
                  {content.about}
                </p>
              </div>
              {providers &&
                <div className="flex gap-2 md:basis-2/5 md:pl-10">
                  {providers.flatrate &&
                    <>
                      <div className="flex gap-2">고정 요금
                        {providers.flatrate.map((item: any, index: number) => (
                          <span key={index}>
                            {item.provider_id != 1796 &&
                              <Tooltip content={item.provider_name}>
                                <Avatar
                                  size="sm"
                                  radius="sm"
                                  src={`https://image.tmdb.org/t/p/w500/${item.logo_path}`}
                                />
                              </Tooltip>
                            }
                          </span>
                        ))}
                      </div>
                    </>
                  }
                  {providers.buy &&
                    <>
                      <div className="flex gap-2">개별 구매
                        {providers.buy.map((item: any, index: number) => (
                          <span key={index}>
                            {item.provider_id != 1796 &&
                              <Tooltip content={item.provider_name}>
                                <Avatar
                                  size="sm"
                                  radius="sm"
                                  src={`https://image.tmdb.org/t/p/w500/${item.logo_path}`}
                                />
                              </Tooltip>
                            }
                          </span>
                        ))}
                      </div>
                    </>
                  }
                </div>
              }
            </div>

            {casts &&
              <div className="pt-12 pb-6">
                <h4 className="pb-4 font-bold text-lg">출연</h4>
                <div className="gap-3 lg:gap-2 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-8">
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
              </div>
            }

            {casts.length > 8 &&
              <div className="flex justify-center">
                <Button
                  variant="bordered"
                  onPress={() => { goCasts() }}
                >더보기
                </Button>
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
              <div className="pt-12 pb-6">
                <h4 className="pb-4 font-bold text-lg">추천 콘텐츠</h4>
                <InfiniteImages contents={sim} />
              </div>
            }


            <div className="pt-12">
              <h4 className="pb-4 font-bold text-lg">세부정보</h4>
              {content.genres &&
                <div>
                  <span>장르 </span>
                  {content.genres.map((item: any, index: number) => (
                    <span className="text-default-500" key={index}>
                      {item.name}
                      {content.genres[index + 1] ? ', ' : ''}
                    </span>
                  ))}
                </div>
              }
              {casts &&
                <div>
                  <span ref={castsRef}>출연 </span>
                  {casts.map((item: any, index: number) => (
                    <span className="text-default-500" key={index}>
                      {item.original_name}({item.character})
                      {casts[index + 1] ? ', ' : ''}
                    </span>
                  ))}
                </div>
              }
            </div>
          </div>
        </CardBody>

        <CardFooter className="gap-3 p-6">
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
'use client'

import InfiniteImages from "../common/infinite-images"
import { Avatar, Chip, Tooltip, Image, Button, Card, CardHeader, CardBody, CardFooter, AvatarGroup, Spacer, Modal, ModalBody, ModalHeader, ModalFooter, ModalContent } from "@heroui/react"
import Title from "../common/title"
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faVolumeHigh, faVolumeXmark, faXmark, faImage } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useRef, useState } from "react";
import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

export default function DetailModal(props: any) {
  const { content, casts, sim, providers, videoKey } = props
  const cutCasts = casts?.slice(0, 8)
  const videoPath = videoKey ? `https://www.youtube.com/watch?v=${videoKey}` : ''
  const [isMute, setIsMute] = useState(true)
  const castsRef = useRef<HTMLDivElement>(null)
  const goCasts = () => {
    castsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  const router = useRouter()

  return (
    <>
      <Modal
        isOpen={true}
        hideCloseButton={true}
        scrollBehavior="inside"
        placement='center'
        disableAnimation={true}
        className='h-full max-w-4xl'
        onClose={() => router.back()}
        radius="none"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="p-0 gap-0">
                {/* <div className="relative"> */}
                  <div className="absolute z-20 left-0 p-4">
                    {/* {content.name || content.title || ""} */}
                    <Button
                      isIconOnly
                      color="success"
                      onPress={() => router.back()}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </Button>
                  {/* </div> */}
                </div>
                <>
                  {/* <div className="absolute z-5 w-full h-full bg-gradient-to-b from-black/0 to-black/25"></div> */}
                  {videoPath ?
                    <div className="relative">
                      <div className="absolute z-20 right-0 bottom-0 p-4">
                        <Button
                          isIconOnly
                          color="success"
                          onPress={() => {
                            setIsMute(!isMute)
                          }}
                        >
                          <FontAwesomeIcon icon={isMute ? faVolumeHigh : faVolumeXmark} />
                        </Button>
                      </div>
                      <div
                        className="aspect-video relative w-full"
                        style={{ paddingBottom: '56.25%' }}
                      >
                        <ReactPlayer
                          width="100%"
                          height="100%"
                          url={videoPath}
                          playing={true}
                          muted={isMute}
                          loop={true}
                          style={{ position: 'absolute', top: 0, left: 0 }}
                        />
                      </div>
                    </div>
                    :
                    <>
                      {
                        content.backdrop_path &&
                        <Image
                          removeWrapper={true}
                          radius="none"
                          alt="Card background"
                          className="w-full aspect-video object-cover brightness-125"
                          src={content.backdrop_path ? `https://image.tmdb.org/t/p/original/${content.backdrop_path}` : ''}
                        />
                      }
                    </>
                  }

                </>

                {/* 내용 */}
                <div className="px-6">
                  <Title
                    title={content.title || content.name || ''}
                    sub={
                      <>
                        {content.release_date ? content.release_date.substr(0, 4) : ''}
                        {content.first_air_date ? content.first_air_date.substr(0, 4) : ''}
                      </>
                    }
                  />
                  <div className="pt-2 md:flex text-default-500">
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

                  {casts.length > 0 &&
                    <div className="py-4">
                      <Spacer y={4} />
                      <h4 className="pb-2 font-bold text-lg">출연</h4>
                      <div className="gap-3 lg:gap-2 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-8">
                        {cutCasts?.map((item: any, index: number) => (
                          <Card shadow="sm" radius="sm" key={index} isBlurred>
                            <CardBody className="overflow-visible p-0">
                              {item.profile_path ?
                                <Image
                                  shadow="sm"
                                  radius="none"
                                  width="100%"
                                  alt={item.name}
                                  className="object-cover w-full aspect-[26/37]"
                                  src={`https://image.tmdb.org/t/p/w500/${item.profile_path}`}
                                />
                                :
                                <div className="bg-default-300 flex items-center justify-center w-full aspect-[26/37]">
                                  <FontAwesomeIcon icon={faImage} />
                                </div>
                              }
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

                  {sim?.length > 0 &&
                    <div className="py-4">
                      <Spacer y={4} />
                      <h4 className="pb-2 font-bold text-lg">추천 콘텐츠</h4>
                      <InfiniteImages contents={sim} />
                    </div>
                  }

                  <div className="py-4">
                    <Spacer y={4} />
                    <h4 className="pb-2 font-bold text-lg">세부정보</h4>
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
                    {casts.length > 0 &&
                      <div>
                        <span ref={castsRef}>출연 </span>
                        {casts.map((item: any, index: number) => (
                          <span className="text-default-500" key={index}>
                            {item.original_name}
                            {item.character && `(${item.character})`}
                            {casts[index + 1] ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    }
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal >
    </>
  )
}
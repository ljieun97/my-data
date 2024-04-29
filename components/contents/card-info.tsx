'use client'

import InfiniteImages from "../common/infinite-images"
import { Avatar, Chip, Tooltip, Image, Button, Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react"
import Title from "../common/title"
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"

export default function CardInfo(props: any) {
  const { content, casts, sim } = props
  const router = useRouter()

  return (
    <>
      <Card className="max-h-[800px]">
        <CardHeader className="p-2">
          <Button onClick={() => router.back()} isIconOnly variant="light">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <Title title={content.title ? content.title : content.name} />
        </CardHeader>
        <CardBody className="px-6 py-0">
          {content.backdrop_path &&
            <Image
              removeWrapper={true}
              radius="sm"
              alt="Card background"
              className="w-full h-full object-cover"
              src={content.backdrop_path ? `https://image.tmdb.org/t/p/original/${content.backdrop_path}` : ''}
            />
          }
          {/* {content.thumb &&
            <Image
              removeWrapper={true}
              radius="sm"
              alt="Card background"
              src={content.thumb}
            />
          } */}
          <div className="flex py-4">
            <div className="basis-3/5 ">
              <p>
                {content.adult && '(19)'}
                {content.release_date &&
                  <span> {content.release_date}</span>
                }
                {!content.release_date &&
                  <span> {content.first_air_date}</span>
                }
              </p>
              <p className="pr-8">
                {content.overview}
                {content.about}
              </p>
            </div>

            <div className="basis-2/5">
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

          {
            sim?.length > 0 &&
            <div>
              <h4 className="pb-4">추천 콘텐츠</h4>
              <InfiniteImages contents={sim} />
            </div>
          }
        </CardBody>
        <CardFooter className="gap-3">
          <div className="flex gap-1">
            <p className="font-semibold text-default-400 text-small">4</p>
            <p className=" text-default-400 text-small">Following</p>
          </div>
          <div className="flex gap-1">
            <p className="font-semibold text-default-400 text-small">97.1K</p>
            <p className="text-default-400 text-small">Followers</p>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
import { getCasts, getMovieDetail, getRecommendations, getSeriseDetail, getSimilars } from "@/lib/themoviedb/api";
import { Button, ModalContent, ModalHeader, ModalBody, ModalFooter, Image, Avatar, Tooltip, Chip, AvatarGroup } from "@nextui-org/react";
import { useEffect, useState } from "react";
import InfiniteImages from "../common/infinite-images";

export default function MovieInfo({ content }: { content: any }) {
  const type = content.title ? 'movie' : 'tv'
  const [casts, setCasts] = useState([])
  const [similars, setSimilars] = useState([])
  useEffect(() => {
    (async () => {
      setCasts(await getCasts(type, content.id))
      const sim = await getSimilars(type, content.id)
      const rcm = await getRecommendations(type, content.id)
      setSimilars(rcm.length > 0 ? rcm : sim)
    })()
  }, [])

  return (
    <>
      {content &&

        <>
          <ModalHeader className="flex flex-col gap-1"></ModalHeader>
          <ModalBody>
            <div>
              <Image
                isBlurred
                removeWrapper
                radius="none"
                alt="Card background"
                className="z-0 w-full h-full object-cover"
                src={`https://image.tmdb.org/t/p/original/${content.backdrop_path}`}
              />
            </div>
            <h2 className="font-bold text-large">{content.title ? content.title : content.name}</h2>
            <div className="flex">
              <div className="basis-3/5">
                {content.adult && '(19)'}
                {content.release_date &&
                  <span>개봉일 {content.release_date}</span>
                }
                {!content.release_date &&
                  <span>첫방송 {content.first_air_date}</span>
                }
                <p className="pr-8">
                  {content.overview}
                </p>
              </div>

              <div className="basis-2/5">
                <div className="flex break-keep pb-4">
                  <div className="pr-2">출연</div>
                  <div className="flex flex-wrap">

                    {/* <AvatarGroup max={7}> */}
                    {casts.map((cast: any) => (
                      <Tooltip key={cast.credit_id} content={cast.name}>
                        <Avatar
                          isBordered
                          size="md"
                          src={cast.profile_path ? `https://image.tmdb.org/t/p/w500/${cast.profile_path}` : '/images/no-image.jpg'}
                        />
                      </Tooltip>
                    ))}
                    {/* </AvatarGroup> */}
                  </div>
                </div>
                <div className="flex break-keep">
                  <div className="pr-2">장르</div>
                  <div className="flex flex-wrap gap-1">
                    {content.genres.map((genre: any) => (
                      <Chip key={genre.id} color="success" variant="bordered">{genre.name}</Chip>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {similars.length > 0 &&
              <div>
                <h4 className="pb-4">추천 콘텐츠</h4>
                <InfiniteImages contents={similars} />
              </div>
            }
          </ModalBody>
          {/* <ModalFooter>

              </ModalFooter> */}
        </>


      }
    </>
  )
}
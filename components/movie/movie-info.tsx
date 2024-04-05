import { getCasts, getMovieDetail, getSeriseDetail, getSimilar } from "@/lib/themoviedb/api";
import { Button, ModalContent, ModalHeader, ModalBody, ModalFooter, Image } from "@nextui-org/react";
import { useEffect, useState } from "react";
import InfiniteImages from "../common/infinite-images";

export default function MovieInfo({ content }: { content: any }) {
  const type = content.title ? 'movie' : 'tv'
  const [casts, setCasts] = useState([])
  const [similars, setSimilars] = useState([])
  useEffect(() => {
    (async () => {
      setCasts(await getCasts(type, content.id))
      setSimilars(await getSimilar(type, content.id))
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
            <div>
              {content.title ? content.title : content.name}
              {content.adult && '(19)'}
              <br />
              {content.release_date &&
                <span>개봉일 {content.release_date}</span>
              }
              {!content.release_date &&
                <span>첫방송 {content.first_air_date}</span>
              }
            </div>
            <div>
              <p>
                출연 {casts.map((cast: any) => (
                  <span key={cast.credit_id}>{cast.name}</span>
                ))}
              </p>
              <p>
                장르 {content.genres.map((genre: any) => (
                  <span key={genre.id}>{genre.name}</span>
                ))}
              </p>
            </div>
            <div>
              <p>
                {content.overview}
                {/* {JSON.stringify(content)} */}
              </p>
            </div>
            {similars.length > 0 &&
              <div>
                추천 콘텐츠
                <InfiniteImages movies={similars} />
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
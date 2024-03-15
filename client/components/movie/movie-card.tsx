"use client"

import Flatrates from "./flatrates"
import SetRating from "./set-rating"
import { Card, CardFooter, Image, CardHeader, CardBody, Button } from "@nextui-org/react";
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCirclePlus, faFaceLaughBeam, faFaceMeh, faFaceAngry } from "@fortawesome/free-solid-svg-icons"

const MovieCard = ({ movie }: { movie: any }) => {
  // console.log(movie)
  // const rating = 0
  // const handleRating = (rate: number) => {
  //   // setRating(rate)
  // }

  const titleLength = movie.title ? movie.title.length : movie.name.length
  const [flatrates, setFlatrates] = useState([])
  useEffect(() => {
    (async () => {
      if (movie.title) {
        try {
          const response = await fetch(`/api/tm-movie/providers/${movie.id}`)
          const { results } = await response.json()
          setFlatrates(results.KR.flatrate)
        } catch {
          setFlatrates([])
        }
      } else {
        try {
          const response = await fetch(`/api/tm-series/providers/${movie.id}`)
          const { results } = await response.json()
          setFlatrates(results.KR.flatrate)
        } catch {
          setFlatrates([])
        }
      }
    })()
  }, [])
  // const onMouseEnterCard = () => {

  // }

  return (
    <Card
      isFooterBlurred
      radius="lg"
      className="border-none group/item hover:bg-slate-100"
      // onMouseEnter={() => onMouseEnterCard()}
      isHoverable
    >
      <Image
        alt="poster"
        className="object-cover"
        isZoomed
        src={`https://image.tmdb.org/t/p/w500/${movie.backdrop_path}`}
      />
      <CardHeader className="overflow-hidden absolute w-[calc(100%_-_8px)] justify-end">
        <div className="flex gap-3">
          <Flatrates list={flatrates} />
        </div>
      </CardHeader>
      <CardBody className="absolute bottom-0 z-10">
        {
          titleLength < 6 &&
          <h4 className="text-white text-lg font-bold tracking-tight text-center">
            {movie.title ? movie.title : movie.name}
          </h4>
        }
        {
          titleLength > 5 && titleLength < 11 &&
          <h4 className="text-white text-sm font-bold tracking-tight text-center">
            {movie.title ? movie.title : movie.name}
          </h4>
        }
        {
          titleLength > 10 &&
          <h4 className="text-white text-xs font-bold tracking-tight text-center">
            {movie.title ? movie.title : movie.name}
          </h4>
        }
      </CardBody>
      <CardFooter className="bg-black/70 overflow-hidden absolute bottom-0 z-10 group/edit invisible group-hover/item:visible">
        <div className="flex flex-col">
          {/* <p className="text-white font-medium text-tiny">{movie.title ? movie.title : movie.name}</p> */}
          {/* <Link href={`/movie/${movie.id}`}>{movie.title ? movie.title : movie.name}</Link> */}
          {/* <input type="date" /> */}
          <div className="flex">
            {/* <SetRating movie={movie} /> */}
            <div className="flex gap-4 items-center">
              <Button isIconOnly>
                <FontAwesomeIcon icon={faFaceLaughBeam} />
              </Button>
              <Button isIconOnly variant="faded">
                <FontAwesomeIcon icon={faFaceMeh} />
              </Button>
              <Button isIconOnly variant="faded">
                <FontAwesomeIcon icon={faFaceAngry} />
              </Button>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCirclePlus} />
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default MovieCard
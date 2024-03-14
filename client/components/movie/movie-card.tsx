"use client"

import SetRating from "./set-rating"
import { Card, CardFooter, Image, Button, Link, CardHeader, Avatar, Tooltip } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { Rating } from 'react-custom-rating-component'

const MovieCard = ({ movie }: { movie: any }) => {
  const rating = 0
  const handleRating = (rate: number) => {
    // setRating(rate)
  }

  const [flatrates, setFlatrates] = useState([])
  useEffect(() => {
    (async () => {
      if(movie.title) {
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
        src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
      />
      <CardHeader className="overflow-hidden absolute w-[calc(100%_-_8px)]">
        <div className="flex gap-3 items-center">
          {flatrates?.map((flatrate: any) => (
            <div key={flatrate.provider_id}>
              <Tooltip content={flatrate.provider_name}>
                <Avatar
                  radius="sm"
                  src={`https://image.tmdb.org/t/p/w500/${flatrate.logo_path}`}
                />
              </Tooltip>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardFooter className="bg-black/70 overflow-hidden absolute bottom-0 z-10 group/edit invisible group-hover/item:visible">
        <div className="flex flex-col">
          <p className="text-white font-medium text-tiny">{movie.title ? movie.title : movie.name}</p>
          {/* <Link href={`/movie/${movie.id}`}>{movie.title ? movie.title : movie.name}</Link> */}
          {/* <input type="date" /> */}
          <div className="flex justify-between">
            {/* <Rating
              defaultValue={0}
              precision={0.5}
              size='20px'
              spacing='4px'
              activeColor='yellow'
              onChange={handleRating}
            /> */}
            <SetRating movie={movie} />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default MovieCard
"use client"

import SetRating from "./set-rating"
import { Card, CardFooter, Image, Button, Link } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { Rating } from 'react-custom-rating-component'

const MovieCard = ({ movie }: { movie: any }) => {
  const rating = 0
  const handleRating = (rate: number) => {
    // setRating(rate)
  }
  return (
    <Card
      isFooterBlurred
      radius="lg"
      className="border-none group/item hover:bg-slate-100"
      isHoverable
    >
      <Image
        alt="poster"
        className="object-cover"
        isZoomed
        src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`
      }
      />
      <CardFooter className="before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10 
      group/edit invisible group-hover/item:visible">
        <div className="flex flex-col">
          <p className="text-tiny text-white/80">{movie.title ? movie.title : movie.name}</p>
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
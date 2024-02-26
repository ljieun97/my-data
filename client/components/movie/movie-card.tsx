"use client"

import CreateMovie from "./create-movie"
import { Card, CardFooter, Image, Button, Link } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { Rating } from 'react-custom-rating-component'

const MovieCard = ({ movie }: { movie: any }) => {
  const [rating, setRating] = useState(0)
  const handleRating = (rate: number) => {
    setRating(rate)
  }
  return (
    <Card
      isFooterBlurred
      radius="lg"
      className="border-none"
      isHoverable
    >
      <Image
        alt="poster"
        className="object-cover"
        src={`https://www.themoviedb.org/t/p/w1280/${movie.poster_path}`}
      />
      <CardFooter className="before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
        <div className="flex flex-col">
          <p className="text-tiny text-white/80">{movie.title ? movie.title : movie.name}</p>
          {/* <Link href={`/movie/${movie.id}`}>{movie.title ? movie.title : movie.name}</Link> */}
          {/* <input type="date" /> */}
          <div className="flex justify-between">
            <Rating
              defaultValue={rating}
              precision={0.5}
              size='20px'
              spacing='4px'
              activeColor='yellow'
              onChange={handleRating}
            />
            <CreateMovie movie={movie} rating={rating} />
          </div>
        </div>

      </CardFooter>
    </Card>
  )
}

export default MovieCard
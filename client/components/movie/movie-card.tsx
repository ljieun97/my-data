"use client"

import CreateMovie from "./create-movie"
import { Card, CardFooter, Image, Button, Link } from "@nextui-org/react";
import { useCallback, useState } from "react";
// import ReactStars from 'react-stars'
// import { Rating, ThinRoundedStar } from '@smastrom/react-rating'
// import '@smastrom/react-rating/style.css'
// import ReactStars from 'react-stars'
// import StarRatings from 'react-star-ratings'
import { Rating } from 'react-simple-star-rating'

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
            {/* <ReactStars
              value={rating}
              onChange={handleRating}
              count={5}
              size={24}
              color2={'#ffd700'}
            /> */}
            {/* <Rating value={rating} onChange={handleRating} itemStyles={{
              itemShapes: ThinRoundedStar,
              activeFillColor: '#f59e0b',
              inactiveFillColor: '#ffedd5',
            }} /> */}
            {/* <ReactStars
              count={5}
              onChange={handleRating}
              size={24}
              color2={'#ffd700'} />
             */}
            {/* <StarRatings
              rating={rating}
              changeRating={handleRating}
              numberOfStars={5}
              starDimension="20px"
              starSpacing="2px"
            /> */}
<Rating
        onClick={handleRating} initialValue={rating} transition={true}

        /* Available Props */
      />
            <CreateMovie movie={movie} rating={rating} />
          </div>
        </div>

      </CardFooter>
    </Card>
  )
}

export default MovieCard
"use client"

import { Rating } from 'react-custom-rating-component'
import { UpdateMovie } from "@/lib/mongo/movie"

const SetRating = ({ movie }: { movie: any }) => {
  const handleRating = async (rating: number) => {
    UpdateMovie(movie, rating)
  }
  return (
    <Rating
      defaultValue={0}
      precision={0.5}
      size='20px'
      spacing='4px'
      activeColor='yellow'
      onChange={handleRating}
    />
  )
}

export default SetRating
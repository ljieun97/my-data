"use client"

import { Card, CardBody, CardFooter, CardHeader, Image } from '@nextui-org/react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import MovieCard from '../movie/movie-card';

export function ImagesSlider({ list }: { list: any[] }) {
  const items = list.map(async (item) => {
    return (
      <>
        <MovieCard key={item.id} movie={item} ></MovieCard>
      </>
    )
  })

  return (
    <>
      <AliceCarousel
      autoWidth

        animationDuration={1000}
        items={items}
      />
    </>
  )
}
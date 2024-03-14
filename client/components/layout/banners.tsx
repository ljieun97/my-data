"use client"

import { Card, CardHeader, Image } from '@nextui-org/react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';

export function Banners({ list }: { list: any[] }) {
  const items = list.map((item, index) => {
    return (
      <>
        <Card radius="none">
          <CardHeader className="absolute z-10 top-1 flex-col !items-start">
            <p className="text-tiny text-white/60 uppercase font-bold">2024 아카데미 수상작</p>
            <h4 className="text-white font-medium text-large">{item.title}</h4>
          </CardHeader>
          <Image
            removeWrapper
            radius="none"
            alt="Card background"
            className="z-0 w-full h-full object-cover"
            src={`https://image.tmdb.org/t/p/original/${item.backdrop_path}`}
          />
        </Card>
      </>
    )
  })

  return (
    <>
      <AliceCarousel
        infinite
        autoPlay
        autoPlayInterval={3000}
        animationDuration={1000}
        disableDotsControls
        disableButtonsControls
        items={items}
      />
    </>
  )
}
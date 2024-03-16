"use client"

import { Card, CardBody, CardFooter, CardHeader, Image } from '@nextui-org/react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import Flatrates from '../movie/flatrates';

export function Banners({ list }: { list: any[] }) {
  console.log(list)
  const items = list.map(async (item) => {
    let flatrates = []
    try {
      const response = await fetch(`/api/tm-movie/providers/${item.id}`)
      const { results } = await response.json()
      flatrates = results.KR?.flatrate
    } catch {
      flatrates = []
    }
    return (
      <>
        <Card radius="none">
          <CardHeader className="overflow-hidden absolute w-[calc(100%_-_8px)] justify-end">
            <div className="flex gap-3">
              <Flatrates list={flatrates} />
            </div>
          </CardHeader>
          <CardBody className="absolute bottom-0 z-10">
            <p className="text-tiny text-white/60 font-bold">2024 아카데미 수상작</p>
            <h4 className="text-3xl text-white font-bold">{item.title}</h4>
            <p>{item.tagline}</p>
          </CardBody>
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
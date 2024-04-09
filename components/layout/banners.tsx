"use client"

import { Button, Card, CardBody, CardFooter, CardHeader, Image, Link } from '@nextui-org/react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import Flatrates from '../movie/flatrates';

export function Banners({ movie }: { movie: any }) {
  // const items = list && list.map(async (movie) => {
    return (
      <>
        <Card radius="none" style={{textShadow:'rgba(0, 0, 0, 0.7) 0px 0px 6px'}}>
          <CardHeader className="overflow-hidden absolute w-[calc(100%_-_8px)] justify-end">
            <div className="flex gap-3">
              <Flatrates type={'movie'} id={movie.id} />
            </div>
          </CardHeader>
          <CardBody className="absolute bottom-0 z-10">
            <p className="text-tiny text-white font-bold">2024 아카데미 수상작</p>
            <h4 className="text-3xl text-white font-bold">{movie.title}</h4>
            <p className="text-white">{movie.tagline}</p>
          </CardBody>
          <Image
            removeWrapper
            radius="none"
            alt="Card background"
            className="z-0 w-full h-full object-cover"
            src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
          />
        </Card>
      </>
    )
  // })

  // return (
  //   <>
  //     <AliceCarousel
  //       infinite
  //       autoPlay
  //       autoPlayInterval={3000}
  //       animationDuration={1000}
  //       disableDotsControls
  //       disableButtonsControls
  //       items={items}
  //     />
  //   </>
  // )
}
"use client"

import { Button, Card, CardBody, CardFooter, CardHeader, Image, Link } from '@nextui-org/react';
import { useRouter } from "next/navigation";
import Flatrates from '../movie/flatrates';

export function Banners({ movie }: { movie: any }) {
  const router = useRouter()
  return (
    <>
      <Card
        radius="none"
        className="border-none"
      >
        <Image
          radius="none"
          alt="Card background"
          className="w-screen h-[600px] object-cover object-top"
          src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
        />

        {/* <CardHeader className="overflow-hidden absolute w-[calc(100%_-_8px)] justify-end">
            <div className="flex gap-3">
              <Flatrates type={'movie'} id={movie.id} />
            </div>
          </CardHeader> */}
        <CardBody className="absolute z-10 w-full h-full bg-gradient-to-b from-black/10 to-black/75"></CardBody>
        <CardFooter className="absolute z-10 pl-6 bottom-4">
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-tiny text-white font-bold drop-shadow">2024 아카데미 수상작</p>
              <p className="text-3xl text-white font-bold drop-shadow pb-2">{movie.title}</p>
            </div>
            <p className="text-white w-2/3 sm:w-2/3 md:w-1/2 lg:w-1/2 line-clamp-3 drop-shadow">{movie.overview}</p>
            <Button
              className='w-fit'
              color="success"
              variant="ghost"
              onClick={() => router.push(`/${'movie'}/${movie.id}`)}
            >상세정보</Button>
          </div>
        </CardFooter>
      </Card >
    </>
  )
}
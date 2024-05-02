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
          className="object-cover bg-gradient-to-r to-black-500"
          src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
        />

        {/* <CardHeader className="overflow-hidden absolute w-[calc(100%_-_8px)] justify-end">
            <div className="flex gap-3">
              <Flatrates type={'movie'} id={movie.id} />
            </div>
          </CardHeader> */}
        <CardBody className="absolute z-10 w-full h-full bg-black/10"></CardBody>
        <CardFooter className="absolute z-10 pl-6 sm:bottom-4 md:bottom-7 lg:bottom-10">
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-tiny text-white font-bold drop-shadow">2024 아카데미 수상작</p>
              <p className="text-3xl text-white font-bold drop-shadow pb-2">{movie.title}</p>
            </div>
            <p className="text-white w-1/3 line-clamp-3 drop-shadow">{movie.overview}</p>
            <Button
              className='w-fit '
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
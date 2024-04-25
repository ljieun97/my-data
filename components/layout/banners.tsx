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
          className="object-cover"
          src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
        />
        {/* <CardHeader className="overflow-hidden absolute w-[calc(100%_-_8px)] justify-end">
            <div className="flex gap-3">
              <Flatrates type={'movie'} id={movie.id} />
            </div>
          </CardHeader> */}
        <CardBody className="absolute flex flex-col gap-1 left-4 bottom-4 z-10">
          <p className="text-tiny text-white font-bold">2024 아카데미 수상작</p>
          <p className="text-3xl text-white font-bold">{movie.title}</p>
          <p className="text-white">{movie.tagline}</p>
          <Button className='w-fit' onClick={() => router.push(`/${'movie'}/${movie.id}`)}>상세정보</Button>
        </CardBody>
      </Card >
    </>
  )
}
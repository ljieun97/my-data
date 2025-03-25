"use client"

import { Button, Card, CardBody, CardFooter, CardHeader, Image, Link } from '@heroui/react';
import { useRouter } from "next/navigation";
import Flatrates from '../contents/flatrates';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

export function Banners({ movie }: { movie: any }) {
  const router = useRouter()
  return (
    <>
      <Card
        radius="none"
        className="border-none w-full items-center shadow-none"
      >
        <Image
          radius="none"
          alt="Card background"
          className="w-screen h-[600px] object-cover object-top"

          src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
        />
        {movie.backdrop_path &&
          <div
            className="absolute z-10 w-full h-full"
            style={{
              background: "linear-gradient(#0003 0%, #0002 15%, #0001 32.47%, #0009 67.36%, #000c 100%)",
            }}
          ></div>
        }
        <CardFooter className="absolute z-10 bottom-2 lg:bottom-16 pl-6 max-w-7xl">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-tiny text-white font-bold drop-shadow p-1">2024 아카데미 노미네이트</p>
              <p className="text-4xl text-white font-bold drop-shadow">{movie.title}</p>
            </div>
            <p className="text-white w-2/3 sm:w-2/3 md:w-1/2 lg:w-1/2 line-clamp-3 drop-shadow">{movie.overview}</p>
            <Button
              radius='sm'
              className='w-fit bg-white text-black'
              onPress={() => router.push(`/${'movie'}/${movie.id}`)}
              startContent={<FontAwesomeIcon icon={faCircleInfo} />}
            >
              상세정보
            </Button>
          </div>
        </CardFooter>
      </Card >
    </>
  )
}
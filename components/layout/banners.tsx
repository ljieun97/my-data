"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

export function Banners({ movie }: { movie: any }) {
  const router = useRouter();

  return (
    <div className="relative w-full items-center overflow-hidden">
      <img
        alt="Card background"
        className="h-[600px] w-screen object-cover object-top"
        src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
      />
      {movie.backdrop_path ? (
        <div
          className="absolute z-10 h-full w-full"
          style={{
            background: "linear-gradient(#0004 0%, #0002 15%, #0001 32.47%, #0009 87.36%, #000c 100%)",
          }}
        />
      ) : null}
      <div className="absolute bottom-2 z-10 max-w-7xl pl-6 lg:bottom-16">
        <div className="flex flex-col gap-4">
          <div>
            <p className="p-1 text-xs font-bold text-white drop-shadow">2024 featured title</p>
            <p className="text-4xl font-bold text-white drop-shadow">{movie.title}</p>
          </div>
          <p className="line-clamp-3 w-2/3 text-white drop-shadow sm:w-2/3 md:w-1/2 lg:w-1/2">{movie.overview}</p>
          <button
            type="button"
            className="flex w-fit items-center gap-2 rounded-sm bg-white px-4 py-2 text-black"
            onClick={() => router.push(`/movie/${movie.id}`)}
          >
            <FontAwesomeIcon icon={faCircleInfo} />
            상세정보
          </button>
        </div>
      </div>
    </div>
  );
}

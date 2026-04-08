"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

export function Banners({ movie }: { movie: any }) {
  const router = useRouter();
  const backdropPath = movie.backdrop_path || movie.backdropPath;
  const tmdbId = movie.tmdbId ?? null;
  const overview = movie.overview || "";

  return (
    <section className="relative ml-[calc(50%-50dvw)] w-[100dvw] max-w-none overflow-hidden">
      <img
        alt="Card background"
        className="block h-[600px] w-full object-cover object-top"
        src={`https://image.tmdb.org/t/p/original/${backdropPath}`}
      />
      {backdropPath ? (
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(#0004 0%, #0002 15%, #0001 32.47%, #0009 87.36%, #000c 100%)",
          }}
        />
      ) : null}
      <div className="absolute inset-x-0 bottom-2 z-10 lg:bottom-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div>
              <p className="p-1 text-xs font-bold text-white drop-shadow">2024 featured title</p>
              <p className="text-4xl font-bold text-white drop-shadow">{movie.title}</p>
            </div>
            <p className="line-clamp-3 w-2/3 text-white drop-shadow sm:w-2/3 md:w-1/2 lg:w-1/2">{overview}</p>
            <button
              type="button"
              className="flex w-fit items-center gap-2 rounded-sm bg-white px-4 py-2 text-black"
              onClick={() => {
                if (!tmdbId) {
                  return;
                }

                router.push(`/movie/${tmdbId}`);
              }}
            >
              <FontAwesomeIcon icon={faCircleInfo} />
              상세정보
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

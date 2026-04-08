"use client";

import Image from "next/image";
import Link from "next/link";
import Flatrates from "@/components/contents/flatrates";
import MediaScoreBadges from "@/components/media/media-score-badges";
import type { HomeMovieCardItem } from "@/components/card-slider";

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

export default function HomeMediaCard({
  movie,
  visibleSlots,
  showRank,
  isRtLoading,
  onPrefetch,
}: {
  movie: HomeMovieCardItem;
  visibleSlots: number;
  showRank: boolean;
  isRtLoading: boolean;
  onPrefetch: (tmdbId?: number | null) => void;
}) {
  return (
    <article className="shrink-0 pr-3" style={{ width: `${100 / visibleSlots}%` }}>
      <Link
        href={movie.tmdbId ? `/movie/${movie.tmdbId}` : "#"}
        scroll={false}
        prefetch={movie.tmdbId ? true : false}
        aria-disabled={!movie.tmdbId}
        onMouseEnter={() => onPrefetch(movie.tmdbId)}
        onTouchStart={() => onPrefetch(movie.tmdbId)}
        onFocus={() => onPrefetch(movie.tmdbId)}
        onClick={(event) => {
          if (!movie.tmdbId) {
            event.preventDefault();
          }
        }}
        className={["group block rounded-2xl transition", movie.tmdbId ? "cursor-pointer" : "cursor-default"].join(" ")}
      >
        <div className="flex min-w-0 flex-col">
          <div className="relative mb-2 aspect-[2/3]">
            {showRank ? (
              <div className="absolute bottom-0 -left-2 z-10 lg:bottom-1 lg:-left-6">
                <span className="text-6xl font-black italic leading-none tracking-[-0.08em] text-white drop-shadow-[0_3px_10px_rgba(15,23,42,0.85)] lg:text-7xl xl:text-8xl">
                  {movie.rank}
                </span>
              </div>
            ) : null}
            {showRank && movie.rankChangeLabel ? (
              <div className="absolute bottom-2 right-2 z-10 lg:bottom-4 lg:right-3">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.04em] shadow-lg sm:px-3 sm:py-1.5 sm:text-xs ${movie.rankChangeTone ?? ""}`}>
                  {movie.rankChangeLabel}
                </span>
              </div>
            ) : null}
            {movie.tmdbId ? (
              <div
                className="absolute right-2 top-2 z-10"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                <Flatrates type="movie" provider={movie.tmdbId} />
              </div>
            ) : null}
            <div className="relative h-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              {movie.tmdbId ? (
                <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-slate-950/0 opacity-0 transition duration-200 group-hover:bg-slate-950/18 group-hover:opacity-100">
                  <span className="rounded-full border border-white/60 bg-white/14 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-white backdrop-blur-sm">
                    OPEN
                  </span>
                </div>
              ) : null}
              {movie.posterPath ? (
                <Image
                  src={`${TMDB_POSTER_BASE_URL}${movie.posterPath}`}
                  alt={`${movie.title} poster`}
                  fill
                  sizes="(min-width: 1280px) 18vw, (min-width: 640px) 24vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  No poster
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <p className="text-base font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-50">{movie.title}</p>
            {movie.year ? <p className="browse-card__meta text-sm">{movie.year}</p> : null}
            <MediaScoreBadges
              tomatometer={movie.rottenTomatometer}
              popcornmeter={movie.rottenPopcornmeter}
              isLoading={isRtLoading}
              variant="home"
            />
            {movie.detailLine ? (
              <div className="mt-2 px-0">
                <p className="browse-card__meta text-sm">{movie.detailLine}</p>
                {movie.subdetailLine ? <p className="browse-card__meta mt-1 text-sm">{movie.subdetailLine}</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

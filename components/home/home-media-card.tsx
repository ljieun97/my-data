"use client";

import Image from "next/image";
import Link from "next/link";
import { Toast } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons";
import Flatrates from "@/components/contents/flatrates";
import MediaScoreBadges from "@/components/media/media-score-badges";
import type { HomeMovieCardItem } from "@/components/card-slider";
import { useUser } from "@/context/UserContext";
import { saveContent } from "@/lib/actions/content";

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
  const { uid } = useUser();

  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!movie.tmdbId) return;

    await saveContent({
      uid,
      id: String(movie.tmdbId),
      content: {
        id: movie.tmdbId,
        title: movie.title,
        poster_path: movie.posterPath,
        release_date: movie.year ? `${movie.year}-01-01` : "",
        vote_average: 0,
        vote_count: 0,
        overview: movie.detailLine ?? "",
      },
      rating: 1,
      addToast: ({ title }: any) => Toast.toast(title),
    });
  };

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
                <div className="pointer-events-none absolute inset-0 z-[1] bg-slate-950/0 opacity-0 transition duration-200 group-hover:bg-slate-950/18 group-hover:opacity-100" />
              ) : null}
              {movie.tmdbId ? (
                <div className="invisible absolute inset-0 z-[2] flex items-center justify-center gap-2 transition group-hover:visible">
                  <button
                    type="button"
                    aria-label={`${movie.title} save`}
                    className="browse-card__action pointer-events-auto rounded-full px-3 py-2 text-sm shadow-sm transition"
                    onClick={handleSave}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                  <span className="browse-card__detail pointer-events-auto rounded-full px-3 py-2 text-sm shadow-sm transition">
                    <FontAwesomeIcon icon={faCircleInfo} />
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

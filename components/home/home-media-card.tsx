"use client";

import Image from "next/image";
import Link from "next/link";
import { faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons";
import Flatrates from "@/components/contents/flatrates";
import MediaScoreBadges from "@/components/media/media-score-badges";
import PosterHoverActions from "@/components/media/poster-hover-actions";
import type { HomeMovieCardItem } from "@/components/card-slider";
import { useSaveContent } from "@/hooks/useSaveContent";
import { useRouter } from "next/navigation";

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";
const TMDB_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w780";

export default function HomeMediaCard({
  movie,
  visibleSlots,
  showRank,
  showDetail,
  showYear,
  isRtLoading,
  imageType = "poster",
  onPrefetch,
}: {
  movie: HomeMovieCardItem;
  visibleSlots: number;
  showRank: boolean;
  showDetail: boolean;
  showYear: boolean;
  isRtLoading: boolean;
  imageType?: "poster" | "backdrop";
  onPrefetch: (tmdbId?: number | null) => void;
}) {
  const router = useRouter();
  const { saveWithPreference } = useSaveContent();
  const isBackdropCard = imageType === "backdrop";
  const imagePath = isBackdropCard ? movie.backdropPath ?? movie.posterPath : movie.posterPath;
  const imageBaseUrl = isBackdropCard ? TMDB_BACKDROP_BASE_URL : TMDB_POSTER_BASE_URL;
  const imageAlt = `${movie.title} ${isBackdropCard ? "backdrop" : "poster"}`;
  const imageSizes = isBackdropCard
    ? "(min-width: 1280px) 20vw, (min-width: 640px) 24vw, 45vw"
    : "(min-width: 1280px) 18vw, (min-width: 640px) 24vw, 33vw";
  const savedRating = Number(movie.userRating);

  const handleSave = async () => {
    if (!movie.tmdbId) return;

    await saveWithPreference({
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
      rating: 2.5,
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
          <div className={`relative mb-1.5 ${isBackdropCard ? "aspect-video" : "aspect-[2/3]"}`}>
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
              {isBackdropCard ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent px-3 py-3">
                  <p className="truncate text-sm font-semibold tracking-[-0.03em] text-white sm:text-[15px]">
                    {movie.title}
                  </p>
                </div>
              ) : null}
              {movie.tmdbId ? (
                <PosterHoverActions
                  overlayClassName="group-hover:visible"
                  actions={[
                    {
                      icon: faPlus,
                      label: `${movie.title} save`,
                      onClick: handleSave,
                      className: "browse-card__action rounded-full px-3 py-2 text-sm shadow-sm transition",
                    },
                    {
                      icon: faCircleInfo,
                      label: `${movie.title} details`,
                      onClick: () => router.push(`/movie/${movie.tmdbId}`),
                      className: "browse-card__detail rounded-full px-3 py-2 text-sm shadow-sm transition",
                    },
                  ]}
                />
              ) : null}
              {imagePath ? (
                <Image
                  src={`${imageBaseUrl}${imagePath}`}
                  alt={imageAlt}
                  fill
                  sizes={imageSizes}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  No poster
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <MediaScoreBadges
              tomatometer={movie.rottenTomatometer}
              popcornmeter={movie.rottenPopcornmeter}
              isLoading={isRtLoading}
              variant="home"
            />
            {showDetail && !isBackdropCard ?
              <div className="flex flex-col gap-px">
                <p className="text-base font-semibold leading-snug tracking-[-0.03em] text-slate-900 dark:text-slate-50">{movie.title}</p>
                {showYear && movie.year ? <p className="browse-card__meta text-sm leading-snug">{movie.year}</p> : null}
              </div> : null}
            {movie.detailLine ? (
              <div className="flex flex-col gap-px px-0">
                <p className="browse-card__meta text-sm leading-snug">{movie.detailLine}</p>
                {movie.subdetailLine ? <p className="browse-card__meta text-sm leading-snug">{movie.subdetailLine}</p> : null}
              </div>
            ) : null}
            {Number.isFinite(savedRating) && savedRating > 0 ? (
              <p className="mt-auto pt-0.5 text-sm font-semibold text-amber-500 dark:text-amber-300">⭐ {savedRating.toFixed(1)}</p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

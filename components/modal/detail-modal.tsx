"use client";

import Title from "../common/title";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faVolumeHigh, faVolumeXmark, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSaveContent } from "@/hooks/useSaveContent";
import MediaScoreBadges from "@/components/media/media-score-badges";
import WatchProvidersPanel from "@/components/media/watch-providers-panel";
import MediaOverviewPanel from "@/components/media/media-overview-panel";
import MediaCastPanel from "@/components/media/media-cast-panel";
import TvSeasonsPanel from "@/components/media/tv-seasons-panel";
import MediaCrewPanel from "@/components/media/media-crew-panel";
import DetailRecommendations from "@/components/modal/detail-recommendations";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
      {children}
    </span>
  );
}

function formatLanguageLabel(value?: string) {
  const labels: Record<string, string> = {
    ko: "한국어",
    en: "영어",
    ja: "일본어",
    zh: "중국어",
    cn: "중국어",
    fr: "프랑스어",
    de: "독일어",
    es: "스페인어",
    it: "이탈리아어",
    pt: "포르투갈어",
    ru: "러시아어",
    hi: "힌디어",
    th: "태국어",
  };

  if (!value) return "-";

  return labels[value.toLowerCase()] ?? value.toUpperCase();
}

function RatingStars({
  value,
  interactive = false,
  onSelect,
  onPreview,
  onPreviewEnd,
}: {
  value: number;
  interactive?: boolean;
  onSelect?: (rating: number) => void;
  onPreview?: (rating: number) => void;
  onPreviewEnd?: () => void;
}) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const clampedValue = Math.max(0, Math.min(5, safeValue));
  const fillWidth = `${(clampedValue / 5) * 100}%`;

  return (
    <span
      className="relative inline-block text-2xl font-semibold leading-none sm:text-3xl"
      aria-label={`내 평점 ${safeValue}`}
      onMouseLeave={interactive ? onPreviewEnd : undefined}
    >
      <span className="tracking-[0.08em] text-slate-300/80 dark:text-slate-700">★★★★★</span>
      <span
        className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap tracking-[0.08em] text-amber-400"
        style={{ width: fillWidth }}
      >
        ★★★★★
      </span>
      {interactive ? (
        <span className="absolute inset-0 grid grid-cols-10">
          {Array.from({ length: 10 }, (_, index) => {
            const nextRating = (index + 1) * 0.5;

            return (
              <button
                key={nextRating}
                type="button"
                className="h-full w-full cursor-pointer"
                aria-label={`${nextRating}점 저장`}
                onMouseEnter={() => onPreview?.(nextRating)}
                onFocus={() => onPreview?.(nextRating)}
                onClick={() => onSelect?.(nextRating)}
              />
            );
          })}
        </span>
      ) : null}
    </span>
  );
}

export default function DetailModal(props: any) {
  const {
    content,
    casts = [],
    crew = [],
    sim = [],
    providers,
    videoKey,
    rottenTomatometer,
    rottenPopcornmeter,
    initialUserRating = 0,
  } = props;
  const videoPath = videoKey ? `https://www.youtube.com/watch?v=${videoKey}` : "";
  const [isMute, setIsMute] = useState(true);
  const [rtState, setRtState] = useState({
    rottenTomatometer: rottenTomatometer ?? null,
    rottenPopcornmeter: rottenPopcornmeter ?? null,
  });
  const [isRtLoading, setIsRtLoading] = useState(!(rottenTomatometer || rottenPopcornmeter));
  const [userRating, setUserRating] = useState(Number(initialUserRating) || 0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const { saveWithPreference } = useSaveContent();
  const router = useRouter();
  const pathname = usePathname();

  const title = content.title || content.name || "";
  const mediaType = content.title ? "movie" : "tv";
  const releaseDate = content.release_date || content.first_air_date || "-";
  const releaseYear = releaseDate !== "-" ? releaseDate.slice(0, 4) : "";
  const runtime =
    typeof content.runtime === "number" && content.runtime > 0
      ? `${content.runtime}분`
      : typeof content.number_of_episodes === "number" && content.number_of_episodes > 0
        ? `${content.number_of_episodes} episodes`
        : "-";
  const genres =
    Array.isArray(content.genres) && content.genres.length > 0 ? content.genres.map((item: any) => item.name).join(", ") : "-";
  const countries =
    Array.isArray(content.production_countries) && content.production_countries.length > 0
      ? content.production_countries.map((item: any) => item.name).join(", ")
      : Array.isArray(content.origin_country) && content.origin_country.length > 0
        ? content.origin_country.join(", ")
        : "-";
  const overview = content.overview || content.about || "Currently this title does not have overview information.";
  const displayedRating = hoverRating ?? userRating;

  const handleRatingSelect = async (rating: number) => {
    setHoverRating(null);
    setUserRating(rating);
    await saveWithPreference({ id: String(content.id), content, rating });
  };

  const closeAllDetailModals = () => {
    const isDetailPath = (value: string) => /^\/(?:movie|tv)\/[^/]+\/?$/.test(value);

    if (typeof window === "undefined") {
      router.push("/");
      return;
    }

    let attempts = 0;

    const handlePopState = () => {
      attempts += 1;

      if (!isDetailPath(window.location.pathname) || attempts >= 8) {
        window.removeEventListener("popstate", handlePopState);
        return;
      }

      window.history.back();
    };

    if (!isDetailPath(pathname)) {
      router.push("/");
      return;
    }

    window.addEventListener("popstate", handlePopState);
    window.history.back();
  };

  useEffect(() => {
    const scrollY = window.scrollY;

    document.documentElement.classList.add("modal-scroll-lock");
    document.body.classList.add("modal-scroll-lock");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.documentElement.classList.remove("modal-scroll-lock");
      document.body.classList.remove("modal-scroll-lock");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const year = releaseDate !== "-" ? releaseDate.slice(0, 4) : "";
    const titleParam = content.title || content.name || "";
    const originalTitleParam = content.original_title || content.original_name || "";
    const type = content.title ? "movie" : "tv";
    const tmdbId = content.id;

    const loadRottenTomatoes = async () => {
      try {
        const query = new URLSearchParams();
        if (titleParam) query.set("title", titleParam);
        if (originalTitleParam) query.set("originalTitle", originalTitleParam);
        if (year) query.set("year", year);

        const response = await fetch(`/api/rottentomatoes/${type}/${tmdbId}?${query.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json();

        if (!cancelled) {
          setRtState({
            rottenTomatometer: payload.rottenTomatometer ?? null,
            rottenPopcornmeter: payload.rottenPopcornmeter ?? null,
          });
          setIsRtLoading(false);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setIsRtLoading(false);
        }
      }
    };

    if (!rtState.rottenTomatometer && !rtState.rottenPopcornmeter) {
      setIsRtLoading(true);
      loadRottenTomatoes();
    }

    return () => {
      cancelled = true;
    };
  }, [content.id, content.name, content.original_name, content.original_title, content.title, releaseDate, rtState.rottenPopcornmeter, rtState.rottenTomatometer]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/36 p-3 backdrop-blur-[2px] sm:p-8 lg:p-12 xl:p-16"
      onClick={() => router.back()}
    >
      <div
        className="h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_28px_72px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_32px_80px_rgba(2,6,23,0.48)] sm:h-[calc(100dvh-7rem)] sm:max-w-4xl lg:h-[calc(100dvh-9rem)] lg:max-w-[68rem] xl:h-[calc(100dvh-11rem)] xl:max-w-[72rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-full">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4">
            <button
              type="button"
              className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sm text-slate-900 shadow-lg"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <button
              type="button"
              className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sm text-slate-900 shadow-lg"
              onClick={closeAllDetailModals}
              aria-label="Close modal"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          {videoPath ? (
            <div className="pointer-events-none absolute bottom-0 right-0 z-20 p-4">
              <button
                type="button"
                className="pointer-events-auto rounded-full bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-lg"
                onClick={() => setIsMute((prev) => !prev)}
              >
                <FontAwesomeIcon icon={isMute ? faVolumeHigh : faVolumeXmark} />
              </button>
            </div>
          ) : null}

          <div className="h-full overflow-y-auto">
            {videoPath ? (
              <div className="relative">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <ReactPlayer
                    width="100%"
                    height="100%"
                    url={videoPath}
                    playing
                    muted={isMute}
                    loop
                    style={{ position: "absolute", top: 0, left: 0 }}
                  />
                </div>
              </div>
            ) : content.backdrop_path ? (
              <img
                alt="Card background"
                className="aspect-video w-full object-cover brightness-110"
                src={`https://image.tmdb.org/t/p/original/${content.backdrop_path}`}
              />
            ) : null}

            <div className="px-5 pb-10 pt-6 sm:px-6 lg:px-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Title
                    title={title}
                    compact={false}
                    adornment={
                      mediaType === "movie" ? (
                        <RatingStars
                          value={displayedRating}
                          interactive
                          onPreview={setHoverRating}
                          onPreviewEnd={() => setHoverRating(null)}
                          onSelect={handleRatingSelect}
                        />
                      ) : null
                    }
                  />

                  <div className="flex flex-wrap gap-2">
                    <MetaChip>{releaseYear || "-"}</MetaChip>
                    <MetaChip>{runtime}</MetaChip>
                    <MetaChip>{genres}</MetaChip>
                    <MetaChip>{countries}</MetaChip>
                    <MetaChip>{formatLanguageLabel(content.original_language)}</MetaChip>
                    <MediaScoreBadges
                      tomatometer={rtState.rottenTomatometer}
                      popcornmeter={rtState.rottenPopcornmeter}
                      isLoading={isRtLoading}
                      variant="detail"
                    />
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)]">
                  <MediaOverviewPanel overview={overview} />
                  <WatchProvidersPanel providers={providers} />
                </div>

                <TvSeasonsPanel content={content} />

                <MediaCastPanel casts={casts} />

                <MediaCrewPanel crew={crew} />

                <section className="space-y-4 rounded-[26px] bg-slate-50/80 p-5 dark:bg-slate-900/70">
                  <h4 className="text-base font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">추천 영화</h4>
                  {sim?.length > 0 ? (
                    <DetailRecommendations contents={sim} mediaType={mediaType} />
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Currently this title does not have recommendation information.</p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

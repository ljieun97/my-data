"use client";

import InfiniteImages from "../common/infinite-images";
import Title from "../common/title";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faVolumeHigh, faVolumeXmark, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import MediaScoreBadges from "@/components/media/media-score-badges";
import WatchProvidersPanel from "@/components/media/watch-providers-panel";
import MediaOverviewPanel from "@/components/media/media-overview-panel";
import MediaCastPanel from "@/components/media/media-cast-panel";
import MediaDetailsPanel from "@/components/media/media-details-panel";
import TvSeasonsPanel from "@/components/media/tv-seasons-panel";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
      {children}
    </span>
  );
}

export default function DetailModal(props: any) {
  const {
    content,
    casts = [],
    sim = [],
    providers,
    videoKey,
    rottenTomatometer,
    rottenPopcornmeter,
    rottenTomatoesUrl,
  } = props;
  const videoPath = videoKey ? `https://www.youtube.com/watch?v=${videoKey}` : "";
  const [isMute, setIsMute] = useState(true);
  const [rtState, setRtState] = useState({
    rottenTomatometer: rottenTomatometer ?? null,
    rottenPopcornmeter: rottenPopcornmeter ?? null,
    rottenTomatoesUrl: rottenTomatoesUrl ?? null,
  });
  const [isRtLoading, setIsRtLoading] = useState(!(rottenTomatometer || rottenPopcornmeter));
  const castsRef = useRef<HTMLSpanElement>(null!);
  const router = useRouter();
  const pathname = usePathname();

  const title = content.title || content.name || "";
  const releaseDate = content.release_date || content.first_air_date || "-";
  const releaseYear = releaseDate !== "-" ? releaseDate.slice(0, 4) : "";
  const runtime =
    typeof content.runtime === "number" && content.runtime > 0
      ? `${content.runtime} min`
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
  const tmdbLabel = content.vote_average ? `TMDB ${Number(content.vote_average).toFixed(1)}` : "TMDB -";

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
            rottenTomatoesUrl: payload.rottenTomatoesUrl ?? null,
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
                <Title title={title} sub={releaseYear} compact={false} />

                <div className="flex flex-wrap gap-2">
                  <MetaChip>{releaseDate}</MetaChip>
                  <MetaChip>{runtime}</MetaChip>
                  <MediaScoreBadges
                    tmdbLabel={tmdbLabel}
                    tomatometer={rtState.rottenTomatometer}
                    popcornmeter={rtState.rottenPopcornmeter}
                    rottenTomatoesUrl={rtState.rottenTomatoesUrl}
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

              <MediaCastPanel casts={casts} castsRef={castsRef} />

              <section className="space-y-4 rounded-[26px] bg-slate-50/80 p-5 dark:bg-slate-900/70">
                <h4 className="text-base font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">More like this</h4>
                {sim?.length > 0 ? (
                  <InfiniteImages contents={sim} />
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Currently this title does not have recommendation information.</p>
                )}
              </section>

              <MediaDetailsPanel
                genres={genres}
                countries={countries}
                language={content.original_language?.toUpperCase?.() || "-"}
                casts={casts}
                castsRef={castsRef}
              />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

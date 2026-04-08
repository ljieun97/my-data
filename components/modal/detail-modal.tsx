"use client";

import InfiniteImages from "../common/infinite-images";
import Title from "../common/title";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import MediaScoreBadges from "@/components/media/media-score-badges";
import WatchProvidersPanel from "@/components/media/watch-providers-panel";
import MediaOverviewPanel from "@/components/media/media-overview-panel";
import MediaCastPanel from "@/components/media/media-cast-panel";
import MediaDetailsPanel from "@/components/media/media-details-panel";

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
  const castsRef = useRef<HTMLSpanElement>(null!);
  const router = useRouter();

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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="h-full w-full max-w-5xl overflow-hidden bg-white dark:bg-slate-950">
        <div className="relative h-full overflow-y-auto">
          <div className="absolute left-0 top-0 z-20 p-4">
            <button
              type="button"
              className="rounded-full bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-lg"
              onClick={() => router.back()}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          </div>

          {videoPath ? (
            <div className="relative">
              <div className="absolute bottom-0 right-0 z-20 p-4">
                <button
                  type="button"
                  className="rounded-full bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-lg"
                  onClick={() => setIsMute((prev) => !prev)}
                >
                  <FontAwesomeIcon icon={isMute ? faVolumeHigh : faVolumeXmark} />
                </button>
              </div>
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
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)]">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Title title={title} sub={releaseYear} />

                  <div className="flex flex-wrap gap-2">
                    <MetaChip>{releaseDate}</MetaChip>
                    <MetaChip>{runtime}</MetaChip>
                    <MediaScoreBadges
                      tmdbLabel={tmdbLabel}
                      tomatometer={rottenTomatometer}
                      popcornmeter={rottenPopcornmeter}
                      rottenTomatoesUrl={rottenTomatoesUrl}
                      variant="detail"
                    />
                  </div>
                </div>

                <MediaOverviewPanel overview={overview} />
                <MediaCastPanel casts={casts} castsRef={castsRef} />

                <section className="space-y-4 rounded-[26px] bg-slate-50/80 p-5 dark:bg-slate-900/70">
                  <h4 className="text-base font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">More like this</h4>
                  {sim?.length > 0 ? (
                    <InfiniteImages contents={sim} />
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Currently this title does not have recommendation information.</p>
                  )}
                </section>
              </div>

              <div className="space-y-5">
                <WatchProvidersPanel providers={providers} />
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

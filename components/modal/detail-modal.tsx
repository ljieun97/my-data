"use client";

import InfiniteImages from "../common/infinite-images";
import Title from "../common/title";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faImage, faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

function ProviderLogo({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="h-8 w-8 rounded-md border border-white/70 object-cover shadow-sm" />;
}

export default function DetailModal(props: any) {
  const { content, casts, sim, providers, videoKey } = props;
  const cutCasts = casts?.slice(0, 8);
  const videoPath = videoKey ? `https://www.youtube.com/watch?v=${videoKey}` : "";
  const [isMute, setIsMute] = useState(true);
  const castsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
      <div className="h-full w-full max-w-4xl overflow-hidden bg-white dark:bg-slate-950">
        <div className="relative h-full overflow-y-auto">
          <div className="absolute left-0 top-0 z-20 p-4">
            <button type="button" className="rounded-full bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-lg" onClick={() => router.back()}>
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

          <div className="px-6 pb-8">
            <Title
              title={content.title || content.name || ""}
              sub={
                <>
                  {content.release_date ? content.release_date.slice(0, 4) : ""}
                  {content.first_air_date ? content.first_air_date.slice(0, 4) : ""}
                </>
              }
            />

            <div className="pt-2 text-slate-500 md:flex">
              <div className="pb-4 md:basis-3/5">
                <p>{content.overview || content.about || "현재 정보가 등록되지 않았거나 정보가 없습니다."}</p>
              </div>
              {providers ? (
                <div className="flex gap-4 md:basis-2/5 md:pl-10">
                  {providers.flatrate ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span>구독</span>
                      {providers.flatrate.map((item: any, index: number) =>
                        item.provider_id !== 1796 ? (
                          <span key={index} title={item.provider_name}>
                            <ProviderLogo src={`https://image.tmdb.org/t/p/w500/${item.logo_path}`} alt={item.provider_name} />
                          </span>
                        ) : null,
                      )}
                    </div>
                  ) : null}
                  {providers.buy ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span>구매</span>
                      {providers.buy.map((item: any, index: number) =>
                        item.provider_id !== 1796 ? (
                          <span key={index} title={item.provider_name}>
                            <ProviderLogo src={`https://image.tmdb.org/t/p/w500/${item.logo_path}`} alt={item.provider_name} />
                          </span>
                        ) : null,
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {casts.length > 0 ? (
              <div className="py-4">
                <h4 className="pb-4 text-lg font-bold">출연</h4>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-8">
                  {cutCasts?.map((item: any, index: number) => (
                    <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                      <div className="overflow-hidden">
                        {item.profile_path ? (
                          <img
                            width="100%"
                            alt={item.name}
                            className="aspect-[26/37] w-full object-cover"
                            src={`https://image.tmdb.org/t/p/w500/${item.profile_path}`}
                          />
                        ) : (
                          <div className="flex aspect-[26/37] w-full items-center justify-center bg-slate-200 dark:bg-slate-800">
                            <FontAwesomeIcon icon={faImage} />
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-3 text-center">
                        <p className="text-sm">{item.name}</p>
                        <p className="text-xs italic text-slate-500">{item.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {casts.length > 8 ? (
              <div className="flex justify-center py-2">
                <button
                  type="button"
                  className="rounded-full border px-4 py-2 text-sm"
                  onClick={() => castsRef.current?.scrollIntoView({ behavior: "smooth" })}
                >
                  더보기
                </button>
              </div>
            ) : null}

            {sim?.length > 0 ? (
              <div className="py-4">
                <h4 className="pb-2 text-lg font-bold">추천 콘텐츠</h4>
                <InfiniteImages contents={sim} />
              </div>
            ) : null}

            <div className="py-4">
              <h4 className="pb-2 text-lg font-bold">상세 정보</h4>
              {content.genres ? (
                <div>
                  <span>장르 </span>
                  {content.genres.map((item: any, index: number) => (
                    <span className="text-slate-500" key={index}>
                      {item.name}
                      {content.genres[index + 1] ? ", " : ""}
                    </span>
                  ))}
                </div>
              ) : null}
              {casts.length > 0 ? (
                <div>
                  <span ref={castsRef}>출연 </span>
                  {casts.map((item: any, index: number) => (
                    <span className="text-slate-500" key={index}>
                      {item.original_name}
                      {item.character ? `(${item.character})` : ""}
                      {casts[index + 1] ? ", " : ""}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Flatrates from "./flatrates";
import { Toast } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPlus, faEye, faStar } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useSaveContent } from "@/hooks/useSaveContent";

export default function CardInfo({ content }: { content: any }) {
  const router = useRouter();
  const { saveWithPreference } = useSaveContent();

  const type = content.title ? "movie" : "tv";
  const id = content.id;
  const img = content.poster_path ? `https://image.tmdb.org/t/p/w500/${content.poster_path}` : "/images/no-image.jpg";
  const title = content.title ? content.title : content.name;
  const releaseDate = type === "movie" ? content.release_date : content.first_air_date;
  const voteAverage = content.vote_average ? Number(content.vote_average).toFixed(1) : "-";
  const voteCount = content.vote_count ? Number(content.vote_count).toLocaleString() : "0";

  const handleClick = async (rating: number) => {
    await saveWithPreference({ id, content, rating });
  };

  return (
    <div className="browse-card group/footer relative overflow-hidden rounded-[24px] border shadow-none">
      <div className="absolute right-3 top-3 z-20">
        <Flatrates type={type} provider={content.id} />
      </div>

      <div className="p-0">
        <div className="flex flex-col gap-3 p-3 pb-2 md:flex-row md:items-start">
          <div className="group/poster relative">
            <img
              alt="poster"
              src={img}
              className="h-auto w-full rounded-lg object-cover shadow-[0_12px_24px_rgba(15,23,42,0.16)] aspect-[2/3] md:h-[6.8rem] md:w-[4.7rem] md:shrink-0"
            />
            <div className="invisible absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-lg bg-slate-950/24 transition group-hover/poster:visible dark:bg-slate-950/42">
              <button
                type="button"
                className="browse-card__action rounded-full px-3 py-2 text-sm shadow-sm transition"
                onClick={() => handleClick(1)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button
                type="button"
                className="browse-card__detail rounded-full px-3 py-2 text-sm shadow-sm transition"
                onClick={() => router.push(`/${type}/${id}`)}
              >
                <FontAwesomeIcon icon={faCircleInfo} />
              </button>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 md:py-1">
            <div>
              <h3 className="browse-card__title line-clamp-2 text-base font-semibold leading-6 tracking-[-0.03em]">{title}</h3>
              <p className="browse-card__meta text-sm">{releaseDate || "Release date unavailable"}</p>
            </div>
            <p className="browse-card__overview line-clamp-3 text-[13px] leading-[1.35rem] md:line-clamp-2">
              {content.overview || "No summary is available for this title yet."}
            </p>
          </div>
        </div>

        <div className="browse-card__footer flex items-center justify-between gap-2 border-t px-3 py-2">
          <div className="flex flex-wrap gap-2">
            <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
              <FontAwesomeIcon icon={faStar} className="mr-1.5" />
              {voteAverage}
            </span>
            <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
              <FontAwesomeIcon icon={faEye} className="mr-1.5" />
              {voteCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

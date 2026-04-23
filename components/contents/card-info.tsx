"use client";

import Flatrates from "./flatrates";
import { faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useSaveContent } from "@/hooks/useSaveContent";
import PosterHoverActions from "@/components/media/poster-hover-actions";

export default function CardInfo({ content }: { content: any }) {
  const router = useRouter();
  const { saveWithPreference } = useSaveContent();

  const type = content.title ? "movie" : "tv";
  const id = content.id;
  const img = content.poster_path ? `https://image.tmdb.org/t/p/w500/${content.poster_path}` : "/images/no-image.jpg";
  const title = content.title ? content.title : content.name;
  const releaseDate = type === "movie" ? content.release_date : content.first_air_date;
  const savedRating = Number(content.userRating);

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
            <PosterHoverActions
              overlayClassName="bg-slate-950/24 group-hover/poster:visible dark:bg-slate-950/42"
              actions={[
                {
                  icon: faPlus,
                  label: `${title} save`,
                  onClick: () => handleClick(2.5),
                  className: "browse-card__action rounded-full px-3 py-2 text-sm shadow-sm transition",
                },
                {
                  icon: faCircleInfo,
                  label: `${title} details`,
                  onClick: () => router.push(`/${type}/${id}`),
                  className: "browse-card__detail rounded-full px-3 py-2 text-sm shadow-sm transition",
                },
              ]}
            />
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

        {Number.isFinite(savedRating) && savedRating > 0 ? (
          <div className="browse-card__footer flex items-center justify-end border-t px-3 py-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-400/12 dark:text-amber-200">
              <span aria-hidden="true">{"\u2B50"}</span>
              {savedRating.toFixed(1)}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

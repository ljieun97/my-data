"use client";

import Flatrates from "@/components/contents/flatrates";
import PosterHoverActions from "@/components/media/poster-hover-actions";
import { faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useSaveContent } from "@/hooks/useSaveContent";

export default function PersonMediaCard({ content }: { content: any }) {
  const router = useRouter();
  const { saveWithPreference } = useSaveContent();

  const type = content.title ? "movie" : "tv";
  const id = content.id;
  const img = content.poster_path ? `https://image.tmdb.org/t/p/w500/${content.poster_path}` : "/images/no-image.jpg";
  const title = content.title ? content.title : content.name;
  const releaseDate = type === "movie" ? content.release_date : content.first_air_date;
  const savedRating = Number(content.userRating);
  const mediaTypeLabel = type === "movie" ? "\uC601\uD654" : "\uC2DC\uB9AC\uC988";
  const contributionLabel =
    content.contribution_type === "cast" ? "\uCD9C\uC5F0" : content.contribution_type === "crew" ? "\uC81C\uC791" : null;

  const handleClick = async (rating: number) => {
    await saveWithPreference({ id, content, rating });
  };

  return (
    <div className="browse-card group/footer relative overflow-hidden rounded-[18px] border p-2 shadow-none">
      <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] bg-slate-200 dark:bg-slate-800">
        <img alt="poster" src={img} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
        <div className="absolute right-3 top-3 z-20">
          <Flatrates type={type} provider={content.id} />
        </div>
        {Number.isFinite(savedRating) && savedRating > 0 ? (
          <div className="absolute bottom-3 right-3 z-20">
            <span className="user-rating-chip inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold shadow-lg">
              <span aria-hidden="true">{"\u2B50"}</span>
              {savedRating.toFixed(1)}
            </span>
          </div>
        ) : null}
        <PosterHoverActions
          overlayClassName="bg-slate-950/28 group-hover/footer:visible dark:bg-slate-950/40"
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

      <div className="flex min-w-0 flex-col gap-1.5 pt-2">
        <h3 className="browse-card__title line-clamp-2 text-sm font-semibold leading-5 tracking-[-0.03em]">{title}</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{releaseDate || "Release date unavailable"}</span>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {contributionLabel ? (
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              {contributionLabel}
            </span>
          ) : null}
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-300">
            {mediaTypeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

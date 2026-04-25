"use client";

import Flatrates from "@/components/contents/flatrates";
import { faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useSaveContent } from "@/hooks/useSaveContent";
import PosterHoverActions from "@/components/media/poster-hover-actions";

export default function ThumbMediaCard({ content }: { content: any }) {
  const router = useRouter();
  const { saveWithPreference } = useSaveContent();

  const type = content.title ? "movie" : "tv";
  const id = content.id;
  const img = content.backdrop_path ? `https://image.tmdb.org/t/p/w500/${content.backdrop_path}` : "/images/no-image.jpg";
  const savedRating = Number(content.userRating);
  const contributionLabel =
    content.contribution_type === "cast" ? "\uCD9C\uC5F0" : content.contribution_type === "crew" ? "\uC81C\uC791" : null;
  const title = content.title ? content.title : content.name;

  const handleClick = async (rating: number) => {
    await saveWithPreference({ id, content, rating });
  };

  return (
    <div className="group/footer mx-[2px] overflow-hidden rounded-sm">
      <div className="relative">
        <img alt="poster" src={img} className="h-[140px] w-full rounded-sm object-cover" />
        <div className="absolute right-0 top-0 z-20 p-2">
          <Flatrates type={type} provider={content.id} />
        </div>
        {Number.isFinite(savedRating) && savedRating > 0 ? (
          <div className="absolute bottom-2 right-2 z-20">
            <span className="user-rating-chip inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-lg">
              <span aria-hidden="true">{"\u2B50"}</span>
              {savedRating.toFixed(1)}
            </span>
          </div>
        ) : null}
        <PosterHoverActions
          overlayClassName="rounded-sm bg-black/25 group-hover/footer:visible"
          groupClassName="absolute bottom-3 right-3"
          actions={[
            {
              icon: faPlus,
              label: `${title} save`,
              onClick: () => handleClick(2.5),
              className: "browse-card__action rounded-full px-2 py-1 text-sm shadow-sm transition",
            },
            {
              icon: faCircleInfo,
              label: `${title} details`,
              onClick: () => router.push(`/${type}/${id}`),
              className: "browse-card__detail rounded-full px-2 py-1 text-sm shadow-sm transition",
            },
          ]}
        />
      </div>
      <div className="flex flex-col gap-1 pt-2">
        {contributionLabel ? (
          <span className="inline-flex w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {contributionLabel}
          </span>
        ) : null}
        <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.03em] text-slate-900 dark:text-slate-50">
          {title}
        </p>
      </div>
    </div>
  );
}

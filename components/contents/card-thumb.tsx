"use client";

import Flatrates from "./flatrates";
import { faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useSaveContent } from "@/hooks/useSaveContent";
import PosterHoverActions from "@/components/media/poster-hover-actions";

export default function CardThumb({ content }: { content: any }) {
  const router = useRouter();
  const { saveWithPreference } = useSaveContent();

  const type = content.title ? "movie" : "tv";
  const id = content.id;
  const img = content.backdrop_path ? `https://image.tmdb.org/t/p/w500/${content.backdrop_path}` : "/images/no-image.jpg";

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
        <div className="absolute inset-x-0 bottom-0 z-10 p-3">
          <div className="line-clamp-3 text-sm font-bold text-white">{content.title ? content.title : content.name}</div>
        </div>
        <PosterHoverActions
          overlayClassName="rounded-sm bg-black/25 group-hover/footer:visible"
          groupClassName="absolute bottom-3 right-3"
          actions={[
            {
              icon: faPlus,
              label: `${content.title ? content.title : content.name} save`,
              onClick: () => handleClick(2.5),
              className: "browse-card__action rounded-full px-2 py-1 text-sm shadow-sm transition",
            },
            {
              icon: faCircleInfo,
              label: `${content.title ? content.title : content.name} details`,
              onClick: () => router.push(`/${type}/${id}`),
              className: "browse-card__detail rounded-full px-2 py-1 text-sm shadow-sm transition",
            },
          ]}
        />
      </div>
    </div>
  );
}

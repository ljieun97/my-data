"use client";

import Flatrates from "@/components/contents/flatrates";
import { faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useSaveContent } from "@/hooks/useSaveContent";
import PosterHoverActions from "@/components/media/poster-hover-actions";

export default function BackdropMediaCard({ content, desc }: { content: any; desc: String }) {
  const router = useRouter();
  const { saveWithPreference } = useSaveContent();

  const type = content.title ? "movie" : "tv";
  const id = content.id;
  const img = content.backdrop_path ? `https://image.tmdb.org/t/p/w1280/${content.backdrop_path}` : "/images/no-image.jpg";

  const handleClick = async (rating: number) => {
    await saveWithPreference({ id, content, rating });
  };

  return (
    <div className="group/footer relative overflow-hidden rounded-xl">
      <img alt="Card background" className="z-0 max-h-[400px] w-full object-cover" src={img} />
      <div className="absolute inset-0 z-10 bg-black/30" />
      <div className="absolute right-0 top-0 z-30 p-4">
        <Flatrates type={type} provider={content.id} />
      </div>
      <div className="absolute inset-0 z-20 p-4">
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-4 w-1 rounded bg-white" />
              <h3 className="text-lg font-semibold leading-tight text-white drop-shadow">{content.title}</h3>
            </div>
            <div className="text-gray-300">{desc && <>{desc}</>}</div>
          </div>
        </div>
      </div>
      <PosterHoverActions
        overlayClassName="rounded-large bg-black/50 group-hover/footer:visible"
        groupClassName="absolute bottom-4 right-4"
        actions={[
          {
            icon: faPlus,
            label: `${content.title} save`,
            onClick: () => handleClick(2.5),
            className: "browse-card__action rounded-full px-3 py-2 text-sm shadow-sm transition",
          },
          {
            icon: faCircleInfo,
            label: `${content.title} details`,
            onClick: () => router.push(`/${type}/${id}`),
            className: "browse-card__detail rounded-full px-3 py-2 text-sm shadow-sm transition",
          },
        ]}
      />
    </div>
  );
}

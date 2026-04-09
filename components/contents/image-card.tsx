"use client";

import Flatrates from "./flatrates";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useSaveContent } from "@/hooks/useSaveContent";

export default function ImageCard({ content, desc }: { content: any; desc: String }) {
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
      <div className="invisible absolute inset-0 z-10 flex h-full items-end justify-end gap-2 rounded-large bg-black/50 p-4 group-hover/footer:visible">
        <button type="button" className="rounded-full bg-white/90 px-3 py-2 text-sm" onClick={() => handleClick(1)}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <button type="button" className="rounded-full bg-white/90 px-3 py-2 text-sm" onClick={() => router.push(`/${type}/${id}`)}>
          <FontAwesomeIcon icon={faCircleInfo} />
        </button>
      </div>
    </div>
  );
}

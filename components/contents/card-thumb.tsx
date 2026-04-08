"use client";

import Flatrates from "./flatrates";
import { Toast } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { saveContent } from "@/lib/actions/content";

export default function CardThumb({ content }: { content: any }) {
  const { uid } = useUser();
  const router = useRouter();

  const type = content.title ? "movie" : "tv";
  const id = content.id;
  const img = content.backdrop_path ? `https://image.tmdb.org/t/p/w500/${content.backdrop_path}` : "/images/no-image.jpg";

  const handleClick = async (rating: number) => {
    saveContent({
      uid,
      id,
      content,
      rating,
      addToast: ({ title }: any) => Toast.toast(title),
    });
  };

  return (
    <div className="group/footer mx-[2px] overflow-hidden rounded-sm">
      <div className="relative">
        <img alt="poster" src={img} className="h-[140px] w-full rounded-sm object-cover" />
        <div className="absolute right-0 top-0 z-20 p-2">
          <Flatrates type={type} provider={content.id} />
        </div>
        <div className="invisible absolute inset-0 z-10 flex h-full w-full items-end justify-between rounded-sm bg-black/25 p-3 group-hover/footer:visible">
          <div className="line-clamp-3 text-sm font-bold text-white">{content.title ? content.title : content.name}</div>
          <div className="flex flex-nowrap gap-1">
            <button type="button" className="rounded-full bg-white/90 px-2 py-1 text-sm" onClick={() => handleClick(1)}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button type="button" className="rounded-full bg-white/90 px-2 py-1 text-sm" onClick={() => router.push(`/${type}/${id}`)}>
              <FontAwesomeIcon icon={faCircleInfo} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

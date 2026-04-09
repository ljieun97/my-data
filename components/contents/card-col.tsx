"use client";

import Flatrates from "./flatrates";
import Image from "next/image";
import { Toast } from "@heroui/react";
import { faPen, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { getPosters } from "@/lib/open-api/tmdb-client";
import { parseDate } from "@internationalized/date";
import PosterHoverActions from "@/components/media/poster-hover-actions";

export default function CardCol({
  thisYear,
  content,
  isProvider,
  onUpdate,
  onDelete,
}: {
  thisYear: string;
  content: any;
  isProvider: boolean;
  onUpdate: any;
  onDelete: any;
}) {
  const { uid } = useUser();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [date, setDate] = useState<any>(parseDate(content.user_date));
  const [posters, setPosters] = useState<any[]>([]);
  const [selectPoster, setSelectPoster] = useState(content.poster_path);
  const [posterImg, setPosterImg] = useState(`https://image.tmdb.org/t/p/w500${content.poster_path}`);

  const handleOpen = async () => {
    setPosters(await getPosters(content.type, content.id));
    setIsEditOpen(true);
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/mypage/content/${content._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid, poster_path: selectPoster, date: date?.toString() }),
    });

    setIsEditOpen(false);

    if (res.ok) {
      if (thisYear !== String(date?.year)) {
        onUpdate(content._id);
      } else {
        setPosterImg(`https://image.tmdb.org/t/p/w500/${selectPoster}`);
      }
      Toast.toast("수정했습니다.");
    }
  };

  return (
    <>
      <div className="group/footer relative aspect-[26/37] w-[92%] justify-self-center overflow-hidden rounded-sm">
        <Image fill alt="poster" src={posterImg} className="object-cover" sizes="100%" priority />

        {isProvider ? (
          <div className="absolute right-0 top-0 z-20 p-1">
            <Flatrates type={content.type} provider={content.id} />
          </div>
        ) : null}

        <PosterHoverActions
          overlayClassName="bg-black/25 group-hover/footer:visible"
          actions={[
            {
              icon: faPen,
              label: "수정하기",
              onClick: handleOpen,
              className: "browse-card__action rounded-full px-3 py-2 text-sm shadow-sm transition",
            },
            {
              icon: faTrashCan,
              label: "삭제하기",
              onClick: () => onDelete(content._id),
              className: "rounded-full bg-red-500/90 px-3 py-2 text-sm text-white shadow-sm transition hover:bg-red-500",
            },
          ]}
        />
      </div>

      {isEditOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950">
            <div className="border-b border-slate-200/70 px-6 py-4 text-lg font-semibold dark:border-slate-800">수정하기</div>
            <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto px-6 py-5">
              <h2 className="mb-2 text-sm font-semibold">날짜</h2>
              <input
                type="date"
                value={typeof date?.toString === "function" ? date.toString() : ""}
                onChange={(event) => setDate(event.target.value ? parseDate(event.target.value) : null)}
                className="min-h-[2.75rem] w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <h2 className="mb-2 mt-5 text-sm font-semibold">사진 ({posters.length})</h2>
              <div className="grid grid-cols-4 gap-1">
                {posters.map((poster: any, index: number) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectPoster(poster.file_path)}
                    className={[
                      "overflow-hidden rounded-lg border-2",
                      selectPoster === poster.file_path ? "border-blue-500" : "border-transparent",
                    ].join(" ")}
                  >
                    <img
                      alt="choice search posters"
                      src={`https://image.tmdb.org/t/p/w500${poster.file_path}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200/70 px-6 py-4 dark:border-slate-800">
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={handleSubmit}>
                완료
              </button>
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => setIsEditOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import Flatrates from "./flatrates";
import Image from "next/image";
import { Toast } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPen } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { getPosters } from "@/lib/open-api/tmdb-client";
import { parseDate } from "@internationalized/date";

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
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [date, setDate] = useState<any>(parseDate(content.user_date));
  const [posters, setPosters] = useState<any[]>([]);
  const [selectPoster, setSelectPoster] = useState(content.poster_path);
  const [posterImg, setPosterImg] = useState(`https://image.tmdb.org/t/p/w500${content.poster_path}`);

  const type = content.title ? "movie" : "tv";
  const id = content.id;

  const handleOpen = async () => {
    setIsMenuOpen(false);
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
      Toast.toast("수정되었습니다.");
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

        <div className="invisible absolute inset-0 z-10 flex items-center justify-center bg-black/25 group-hover/footer:visible">
          <div className="relative flex gap-2">
            <button
              type="button"
              className="rounded-full bg-white/90 px-2 py-1 text-sm"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
            {isMenuOpen ? (
              <div className="absolute left-0 top-full mt-2 min-w-24 rounded-xl bg-white p-1 shadow-lg">
                <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100" onClick={handleOpen}>
                  수정
                </button>
                <button
                  type="button"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-100"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(content._id);
                  }}
                >
                  삭제
                </button>
              </div>
            ) : null}
            <button
              type="button"
              className="rounded-full bg-white/90 px-2 py-1 text-sm"
              onClick={() => router.push(`/${type}/${id}`)}
            >
              <FontAwesomeIcon icon={faCircleInfo} />
            </button>
          </div>
        </div>
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

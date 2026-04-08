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

const genreLabels: Record<number, string> = {
  16: "애니메이션",
  18: "드라마",
  27: "공포",
  28: "액션",
  35: "코미디",
  36: "역사",
  37: "서부",
  53: "스릴러",
  80: "범죄",
  99: "다큐멘터리",
  878: "SF",
  9648: "미스터리",
  10402: "음악",
  10749: "로맨스",
  10751: "가족",
  10752: "전쟁",
  12: "모험",
  14: "판타지",
};

export default function SavedListRow({
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

  const typeLabel = content.type === "movie" ? "영화" : content.type === "tv" ? "TV" : content.type;
  const releaseDate = content.release_date || content.first_air_date || "-";
  const genres = Array.isArray(content.genre_ids)
    ? content.genre_ids.map((genreId: number) => genreLabels[genreId] || `Genre ${genreId}`)
    : [];

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
      <div className="browse-card relative overflow-hidden rounded-[24px] border shadow-none">
        {isProvider ? (
          <div className="absolute right-4 top-4 z-20">
            <Flatrates type={content.type} provider={content.id} />
          </div>
        ) : null}
        <div className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4">
          <div className="relative h-[7rem] w-[4.8rem] shrink-0 overflow-hidden rounded-[18px] bg-slate-200/70 shadow-[0_12px_24px_rgba(15,23,42,0.16)]">
            <Image fill alt={`${content.title} poster`} src={posterImg} className="object-cover" sizes="120px" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-3 pr-16 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="browse-card__title line-clamp-2 text-base font-semibold leading-6 tracking-[-0.03em]">
                  {content.title}
                </h3>
                <div className="browse-card__meta mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  <span>{typeLabel}</span>
                  <span>관람일 {content.user_date || "-"}</span>
                  <span>개봉일 {releaseDate}</span>
                </div>
              </div>

            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
              <div className="flex flex-wrap gap-2">
                {genres.map((genre: any) => (
                  <span key={genre} className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {genre}
                  </span>
                ))}
              </div>

              <div className="flex shrink-0 gap-2">
                <div className="relative">
                  <button
                    type="button"
                    className="browse-card__action rounded-full px-3 py-2"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  {isMenuOpen ? (
                    <div className="absolute right-0 top-full z-20 mt-2 min-w-24 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                      <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={handleOpen}>
                        수정
                      </button>
                      <button
                        type="button"
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onDelete(content._id);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  ) : null}
                </div>
                <button type="button" className="browse-card__detail rounded-full px-3 py-2" onClick={() => router.push(`/${content.type}/${content.id}`)}>
                  <FontAwesomeIcon icon={faCircleInfo} />
                </button>
              </div>
            </div>
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

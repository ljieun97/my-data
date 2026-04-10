"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Toast } from "@heroui/react";
import { faCircleInfo, faPen, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { parseDate } from "@internationalized/date";
import Flatrates from "@/components/contents/flatrates";
import { useUser } from "@/context/UserContext";
import { getPosters } from "@/lib/open-api/tmdb-client";
import PosterHoverActions from "@/components/media/poster-hover-actions";

export type SavedMediaItem = {
  _id: string;
  id: string | number;
  type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  user_date?: string;
  user_rating?: number | null;
};

function formatRating(value?: number | null) {
  const rating = Number(value);
  return Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : "-";
}

export default function SavedMediaCard({
  content,
  backgroundColor = "rgba(148, 163, 184, 0.16)",
  showProvider = false,
  onDelete,
  onUpdate,
}: {
  content: SavedMediaItem;
  backgroundColor?: string;
  showProvider?: boolean;
  onDelete: (cid: string) => Promise<void> | void;
  onUpdate: (contentId: string, nextDate: string, nextPosterPath: string, nextRating: number) => void;
}) {
  const router = useRouter();
  const { uid } = useUser();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [date, setDate] = useState<any>(content.user_date ? parseDate(content.user_date) : null);
  const [posters, setPosters] = useState<any[]>([]);
  const [selectPoster, setSelectPoster] = useState(content.poster_path ?? "");
  const [rating, setRating] = useState(Number(content.user_rating) > 0 ? Number(content.user_rating) : 2.5);
  const [posterImg, setPosterImg] = useState(
    content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : "",
  );

  const title = content.title || content.name || "Untitled";
  const href = content.type ? `/${content.type}/${content.id}` : "#";

  const handleOpen = async () => {
    if (!content.type) return;
    setPosters(await getPosters(content.type, String(content.id)));
    setIsEditOpen(true);
  };

  const handleSubmit = async () => {
    if (!uid || !date) return;

    const res = await fetch(`/api/mypage/content/${content._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid, poster_path: selectPoster, date: date.toString(), rating }),
    });

    setIsEditOpen(false);

    if (res.ok) {
      if (selectPoster) {
        setPosterImg(`https://image.tmdb.org/t/p/w500${selectPoster}`);
      }
      onUpdate(content._id, date.toString(), selectPoster, rating);
      Toast.toast("수정되었습니다.");
    }
  };

  const handleDeleteFromModal = () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setIsEditOpen(false);
    void onDelete(content._id);
  };

  return (
    <>
      <div
        className="group block overflow-hidden rounded-[22px] p-[1px] transition-transform hover:-translate-y-0.5"
        style={{ backgroundColor }}
      >
        <div className="overflow-hidden rounded-[21px] bg-white/92 backdrop-blur-sm dark:bg-slate-950/82">
          <div className="relative aspect-[2/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
            {posterImg ? (
              <Image alt={title} src={posterImg} fill className="object-cover transition duration-300 group-hover:scale-[1.03]" sizes="100%" />
            ) : (
              <div className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-400 dark:text-slate-500">
                No poster
              </div>
            )}

            {showProvider && content.type ? (
              <div className="absolute right-0 top-0 z-20 p-1">
                <Flatrates type={content.type} provider={content.id} />
              </div>
            ) : null}

            <PosterHoverActions
              overlayClassName="bg-black/25 group-hover:visible"
              groupClassName="flex-col"
              actions={[
                {
                  icon: faPen,
                  label: "수정하기",
                  onClick: handleOpen,
                  className: "browse-card__action rounded-full px-3 py-2 text-sm shadow-sm transition",
                },
                {
                  icon: faCircleInfo,
                  label: "상세보기",
                  onClick: () => {
                    if (content.type) router.push(href);
                  },
                  className: "browse-card__detail rounded-full px-3 py-2 text-sm shadow-sm transition",
                },
              ]}
            />
          </div>

          <div
            className="flex min-h-[2.55rem] items-center justify-between gap-2 px-2.5 py-2 sm:min-h-[4.55rem] sm:px-3 sm:py-3"
            style={{ backgroundColor }}
          >
            <div className="min-w-0 sm:hidden">
              <p className="browse-card__meta text-[11px] font-medium text-slate-700 dark:text-slate-800">
                ⭐ {formatRating(content.user_rating)}
              </p>
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="browse-card__title line-clamp-2 text-sm font-semibold">{title}</p>
              <p className="browse-card__meta mt-1 text-xs">{content.user_date ?? "-"}</p>
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

              <h2 className="mb-2 mt-5 text-sm font-semibold">평점</h2>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {Array.from({ length: 10 }, (_, index) => (index + 1) / 2).map((value) => {
                  const isActive = Math.abs(rating - value) < 0.001;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={[
                        "inline-flex min-h-[2.5rem] items-center justify-center gap-1 rounded-xl border px-2 text-sm transition",
                        isActive
                          ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-400 dark:bg-amber-500/15 dark:text-amber-200"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-600",
                      ].join(" ")}
                    >
                      <FontAwesomeIcon icon={faStar} className="text-[11px]" />
                      <span>{value.toFixed(1)}</span>
                    </button>
                  );
                })}
              </div>

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
            <div className="flex items-center justify-between gap-2 border-t border-slate-200/70 px-6 py-4 dark:border-slate-800">
              <button
                type="button"
                className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/40"
                onClick={handleDeleteFromModal}
              >
                삭제하기
              </button>
              <div className="flex justify-end gap-2">
                <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={handleSubmit}>
                  완료
                </button>
                <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => setIsEditOpen(false)}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

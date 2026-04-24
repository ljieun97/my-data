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
  season_number?: number | null;
};

function formatRating(value?: number | null) {
  const rating = Number(value);
  return Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : "-";
}

export default function SavedPosterCard({
  content,
  backgroundColor = "rgba(148, 163, 184, 0.16)",
  showProvider = false,
  showRating = true,
  onDelete,
  onUpdate,
}: {
  content: SavedMediaItem;
  backgroundColor?: string;
  showProvider?: boolean;
  showRating?: boolean;
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

  const baseTitle = content.title || content.name || "Untitled";
  const title =
    content.type === "tv" && content.season_number && Number(content.season_number) > 1
      ? `${baseTitle.replace(/\s*?쒖쫵\s*\d+$/i, "")} ?쒖쫵 ${content.season_number}`
      : baseTitle;
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
      Toast.toast("?섏젙?덉뒿?덈떎.");
    }
  };

  const handleDeleteFromModal = () => {
    if (!window.confirm("?뺣쭚 ??젣?섏떆寃좎뒿?덇퉴?")) return;
    setIsEditOpen(false);
    void onDelete(content._id);
  };

  return (
    <>
      <div
        className="group block overflow-hidden rounded-sm transition-transform hover:-translate-y-0.5"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="overflow-hidden rounded-sm bg-transparent backdrop-blur-none">
          <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-slate-200 dark:bg-slate-800">
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

            {showRating ? (
              <div className="absolute bottom-2 right-2 z-20 sm:bottom-3 sm:right-3">
                <span className="user-rating-chip inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-lg sm:px-3 sm:py-1.5 sm:text-xs">
                  <span aria-hidden="true">{"\u2B50"}</span>
                  {formatRating(content.user_rating)}
                </span>
              </div>
            ) : null}

            <PosterHoverActions
              overlayClassName="bg-black/25 group-hover:visible"
              groupClassName="flex-col"
              actions={[
                {
                  icon: faPen,
                  label: "?섏젙?섍린",
                  onClick: handleOpen,
                  className: "browse-card__action rounded-full px-3 py-2 text-sm shadow-sm transition",
                },
                {
                  icon: faCircleInfo,
                  label: "?곸꽭蹂닿린",
                  onClick: () => {
                    if (content.type) router.push(href);
                  },
                  className: "browse-card__detail rounded-full px-3 py-2 text-sm shadow-sm transition",
                },
              ]}
            />
          </div>
        </div>
      </div>

      {isEditOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950">
            <div className="border-b border-slate-200/70 px-6 py-4 text-lg font-semibold dark:border-slate-800">?섏젙?섍린</div>
            <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto px-6 py-5">
              <h2 className="mb-2 text-sm font-semibold">?좎쭨</h2>
              <input
                type="date"
                value={typeof date?.toString === "function" ? date.toString() : ""}
                onChange={(event) => setDate(event.target.value ? parseDate(event.target.value) : null)}
                className="min-h-[2.75rem] w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />

              <h2 className="mb-2 mt-5 text-sm font-semibold">蹂꾩젏</h2>
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

              <h2 className="mb-2 mt-5 text-sm font-semibold">?ъ쭊 ({posters.length})</h2>
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
                ??젣?섍린
              </button>
              <div className="flex justify-end gap-2">
                <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={handleSubmit}>
                  ?꾨즺
                </button>
                <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => setIsEditOpen(false)}>
                  ?リ린
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

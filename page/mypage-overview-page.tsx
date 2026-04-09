"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FastAverageColor } from "fast-average-color";
import Image from "next/image";
import { Toast } from "@heroui/react";
import { faPen, faStar, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { parseDate } from "@internationalized/date";
import Title from "@/components/common/title";
import PosterHoverActions from "@/components/media/poster-hover-actions";
import Flatrates from "@/components/contents/flatrates";
import { useUser } from "@/context/UserContext";
import { getPosters } from "@/lib/open-api/tmdb-client";

type YearCount = {
  _id: string;
  count: number;
};

type SavedItem = {
  _id: string;
  id: string | number;
  type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  user_date?: string;
  user_rating?: number | null;
};

type MonthGroup = {
  monthNumber: number;
  monthLabel: string;
  items: SavedItem[];
};

function MonthlySavedCard({
  content,
  backgroundColor,
  onDelete,
  onUpdate,
}: {
  content: SavedItem;
  backgroundColor: string;
  onDelete: (cid: string) => Promise<void>;
  onUpdate: (contentId: string, nextDate: string, nextPosterPath: string, nextRating: number) => void;
}) {
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

            {content.type ? (
              <div className="absolute right-0 top-0 z-20 p-1">
                <Flatrates type={content.type} provider={content.id} />
              </div>
            ) : null}

            <PosterHoverActions
              overlayClassName="bg-black/25 group-hover:visible"
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
                  onClick: () => {
                    void onDelete(content._id);
                  },
                  className: "rounded-full bg-red-500/90 px-3 py-2 text-sm text-white shadow-sm transition hover:bg-red-500",
                },
              ]}
            />
          </div>

          <div
            className="px-2.5 pb-2.5 pt-2 sm:px-3 sm:py-3"
            style={{
              background: `linear-gradient(180deg, ${backgroundColor} 0%, rgba(255,255,255,0.08) 100%)`,
            }}
          >
            <div className="sm:hidden">
              <p className="browse-card__meta text-[11px] font-medium text-slate-700 dark:text-slate-800">
                ⭐ {formatRating(content.user_rating)}
              </p>
            </div>

            <div className="hidden sm:block">
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

function groupItemsByMonth(items: SavedItem[]): MonthGroup[] {
  const buckets = Array.from({ length: 12 }, (_, index) => ({
    monthNumber: index + 1,
    monthLabel: `${index + 1}월`,
    items: [] as SavedItem[],
  }));

  for (const item of items) {
    const monthValue = Number(item.user_date?.slice(5, 7));

    if (!Number.isFinite(monthValue) || monthValue < 1 || monthValue > 12) {
      continue;
    }

    buckets[monthValue - 1].items.push(item);
  }

  return buckets.filter((bucket) => bucket.items.length > 0).sort((a, b) => b.monthNumber - a.monthNumber);
}

function formatRating(value?: number | null) {
  const rating = Number(value);
  return Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : "-";
}

function toPastelColor(r: number, g: number, b: number) {
  const mix = (channel: number) => Math.round(channel + (255 - channel) * 0.24);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export default function MyPageOverviewPage({
  counts,
  currentYear,
  currentYearItems,
}: {
  counts: YearCount[];
  currentYear: string;
  currentYearItems: SavedItem[];
}) {
  const { uid } = useUser();
  const safeCounts = Array.isArray(counts) ? counts : [];
  const [items, setItems] = useState<SavedItem[]>(Array.isArray(currentYearItems) ? currentYearItems : []);
  const totalSaved = safeCounts.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const groupedMonths = groupItemsByMonth(items);
  const [posterColors, setPosterColors] = useState<Record<string, string>>({});

  const handleDelete = async (cid: string) => {
    if (!uid) return;

    const res = await fetch(`/api/mypage/content/${cid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: uid,
      },
    });

    if (res.ok) {
      setItems((prev) => prev.filter((item) => item._id !== cid));
      Toast.toast("Deleted.");
    }
  };

  const handleUpdate = (contentId: string, nextDate: string, nextPosterPath: string, nextRating: number) => {
    if (!nextDate.startsWith(`${currentYear}-`)) {
      setItems((prev) => prev.filter((item) => item._id !== contentId));
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item._id === contentId
          ? {
              ...item,
              user_date: nextDate,
              poster_path: nextPosterPath || item.poster_path,
              user_rating: nextRating,
            }
          : item,
      ),
    );
  };

  useEffect(() => {
    let isCancelled = false;
    const fac = new FastAverageColor();

    const extractColors = async () => {
      const colorEntries = await Promise.all(
        items.map(async (item) => {
          if (!item.poster_path) {
            return [item._id, "rgba(148, 163, 184, 0.16)"] as const;
          }

          try {
            const { value } = await fac.getColorAsync(
              `/api/proxy?url=${encodeURIComponent(`https://image.tmdb.org/t/p/w500${item.poster_path}`)}`,
            );
            const [r, g, b] = value.map((channel) => Number(channel));
            return [item._id, toPastelColor(r, g, b)] as const;
          } catch {
            return [item._id, "rgba(148, 163, 184, 0.16)"] as const;
          }
        }),
      );

      if (isCancelled) return;
      setPosterColors(Object.fromEntries(colorEntries));
    };

    void extractColors();

    return () => {
      isCancelled = true;
      fac.destroy();
    };
  }, [items]);

  return (
    <>
      <Title title="마이페이지" sub="저장한 기록과 월별 흐름을 한눈에 확인하세요." />

      <div className="flex items-center justify-between gap-3 py-4">
        <div />
        <div className="flex items-center gap-3">
          <p className="browse-card__meta text-sm">
            올해 {items.length}개 / 총 {totalSaved}개
          </p>
          <Link
            href={`/mypage/${currentYear}`}
            className="inline-flex min-h-[2.75rem] items-center rounded-full border border-slate-300/80 bg-white px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            연도별 보기
          </Link>
        </div>
      </div>

      {groupedMonths.length ? (
        <div className="flex flex-col gap-8 py-2">
          {groupedMonths.map((group) => (
            <section key={group.monthNumber} className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-3 dark:border-slate-800/80">
                <h2 className="page-title text-lg font-semibold">{group.monthLabel}</h2>
                <span className="browse-card__meta rounded-full bg-white/70 px-3 py-1 text-sm dark:bg-slate-900/70">
                  {group.items.length}개
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3 lg:grid-cols-6 xl:grid-cols-8">
                {group.items.map((item) => {
                  return (
                    <MonthlySavedCard
                      key={item._id}
                      content={item}
                      backgroundColor={posterColors[item._id] ?? "rgba(148, 163, 184, 0.16)"}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="py-6 text-sm text-slate-500 dark:text-slate-400">아직 올해 저장한 작품이 없습니다.</div>
      )}
    </>
  );
}

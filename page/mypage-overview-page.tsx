"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FastAverageColor } from "fast-average-color";
import { Toast } from "@heroui/react";
import Title from "@/components/common/title";
import SavedMediaCard, { type SavedMediaItem } from "@/components/mypage/saved-media-card";
import { useUser } from "@/context/UserContext";

type YearCount = {
  _id: string;
  count: number;
};

type MonthGroup = {
  monthNumber: number;
  monthLabel: string;
  items: SavedMediaItem[];
};

function groupItemsByMonth(items: SavedMediaItem[]): MonthGroup[] {
  const buckets = Array.from({ length: 12 }, (_, index) => ({
    monthNumber: index + 1,
    monthLabel: `${index + 1}월`,
    items: [] as SavedMediaItem[],
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

function toPastelColor(r: number, g: number, b: number) {
  const mix = (channel: number) => Math.round(channel + (255 - channel) * 0.42);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export default function MyPageOverviewPage({
  counts,
  currentYear,
  currentYearItems,
}: {
  counts: YearCount[];
  currentYear: string;
  currentYearItems: SavedMediaItem[];
}) {
  const { uid } = useUser();
  const safeCounts = Array.isArray(counts) ? counts : [];
  const [items, setItems] = useState<SavedMediaItem[]>(Array.isArray(currentYearItems) ? currentYearItems : []);
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

              <div className="grid grid-cols-4 gap-2 min-[640px]:grid-cols-5 sm:gap-3 min-[960px]:grid-cols-6">
                {group.items.map((item) => (
                  <SavedMediaCard
                    key={item._id}
                    content={item}
                    backgroundColor={posterColors[item._id] ?? "rgba(148, 163, 184, 0.16)"}
                    showProvider
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))}
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

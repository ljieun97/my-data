"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FastAverageColor } from "fast-average-color";
import Title from "@/components/common/title";

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
  const mix = (channel: number) => Math.round(channel + (255 - channel) * 0.72);
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
  const safeCounts = Array.isArray(counts) ? counts : [];
  const safeItems = Array.isArray(currentYearItems) ? currentYearItems : [];
  const totalSaved = safeCounts.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const groupedMonths = groupItemsByMonth(safeItems);
  const [posterColors, setPosterColors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isCancelled = false;
    const fac = new FastAverageColor();

    const extractColors = async () => {
      const colorEntries = await Promise.all(
        safeItems.map(async (item) => {
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
  }, [safeItems]);

  return (
    <>
      <Title title="마이페이지" sub="저장한 기록과 월별 흐름을 한눈에 확인하세요." />

      <div className="flex items-center justify-between gap-3 py-4">
        <div />
        <div className="flex items-center gap-3">
          <p className="browse-card__meta text-sm">
            올해 {safeItems.length}개 / 총 {totalSaved}개
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

              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                {group.items.map((item) => {
                  const href = item.type ? `/${item.type}/${item.id}` : "#";
                  const title = item.title || item.name || "Untitled";

                  return (
                    <Link
                      key={item._id}
                      href={href}
                      className="group block overflow-hidden rounded-[22px] p-[1px] transition-transform hover:-translate-y-0.5"
                      style={{
                        backgroundColor: posterColors[item._id] ?? "rgba(148, 163, 184, 0.16)",
                      }}
                    >
                      <div className="overflow-hidden rounded-[21px] bg-white/88 backdrop-blur-sm dark:bg-slate-950/78">
                        <div className="relative aspect-[2/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
                          {item.poster_path ? (
                            <img
                              alt={title}
                              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-400 dark:text-slate-500">
                              No poster
                            </div>
                          )}
                        </div>

                        <div className="px-2.5 pb-2.5 pt-2 sm:px-3 sm:py-3">
                          <div className="sm:hidden">
                            <p className="browse-card__meta text-[11px] font-medium text-slate-600 dark:text-slate-300">
                              ⭐ {formatRating(item.user_rating)}
                            </p>
                          </div>

                          <div className="hidden sm:block">
                            <p className="browse-card__title line-clamp-2 text-sm font-semibold">{title}</p>
                            <p className="browse-card__meta mt-1 text-xs">{item.user_date ?? "-"}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
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

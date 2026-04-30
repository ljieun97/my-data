"use client";

import { useEffect, useMemo } from "react";
import { useUserRatings } from "@/context/UserRatingsContext";

function getCreditType(credit: any) {
  return credit?.media_type || (credit?.title ? "movie" : "tv");
}

export default function PersonWatchStat({ credits, label }: { credits: any[]; label: string }) {
  const { ensureRatings, getRating } = useUserRatings();
  const items = useMemo(() => {
    const uniqueItems = new Map<string, { id: number; type: string }>();

    for (const credit of credits) {
      const id = Number(credit?.id);
      const type = getCreditType(credit);

      if (!Number.isFinite(id) || !["movie", "tv"].includes(type)) {
        continue;
      }

      uniqueItems.set(`${type}:${id}`, { id, type });
    }

    return Array.from(uniqueItems.values());
  }, [credits]);

  useEffect(() => {
    void ensureRatings(items);
  }, [ensureRatings, items]);

  const watchedCount = useMemo(
    () => items.filter((item) => getRating(item) > 0).length,
    [getRating, items],
  );

  const totalCount = items.length;
  const watchedRatio = totalCount > 0 ? watchedCount / totalCount : 0;
  const watchedPercent = Math.round(watchedRatio * 100);

  return (
    <div className="rounded-[20px] bg-slate-100/80 px-4 py-3 dark:bg-slate-900/70">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {watchedCount} / {totalCount}
        </p>
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">{watchedPercent}%</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 transition-[width] duration-300 dark:from-emerald-300 dark:to-sky-400"
          style={{ width: `${watchedPercent}%` }}
        />
      </div>
    </div>
  );
}

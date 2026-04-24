"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/context/UserContext";

function getCreditType(credit: any) {
  return credit?.media_type || (credit?.title ? "movie" : "tv");
}

export default function PersonWatchStat({ credits }: { credits: any[] }) {
  const { uid } = useUser();
  const [watchedCount, setWatchedCount] = useState(0);
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
    let cancelled = false;

    const loadWatchedCount = async () => {
      if (!uid || !items.length) {
        setWatchedCount(0);
        return;
      }

      try {
        const response = await fetch("/api/mypage/ratings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: uid,
          },
          body: JSON.stringify({ items }),
        });

        if (!response.ok) {
          throw new Error(`Failed to load watched credits: ${response.status}`);
        }

        const payload = (await response.json()) as { rating?: number }[];
        const nextWatchedCount = payload.filter((item) => Number(item.rating) > 0).length;

        if (!cancelled) {
          setWatchedCount(nextWatchedCount);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setWatchedCount(0);
        }
      }
    };

    void loadWatchedCount();

    return () => {
      cancelled = true;
    };
  }, [items, uid]);

  const totalCount = items.length;
  const watchedRatio = totalCount > 0 ? watchedCount / totalCount : 0;
  const watchedPercent = Math.round(watchedRatio * 100);

  return (
    <div className="rounded-[20px] bg-slate-100/80 px-4 py-3 dark:bg-slate-900/70">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{"\uBCF8 \uC791\uD488"}</p>
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

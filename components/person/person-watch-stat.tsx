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

  return (
    <div className="rounded-[20px] bg-slate-100/80 px-4 py-3 dark:bg-slate-900/70">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{"\uBCF8 \uC791\uD488"}</p>
      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {watchedCount} / {items.length}
      </p>
    </div>
  );
}

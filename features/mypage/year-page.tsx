"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { Toast } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import Title from "@/components/common/title";
import CardCol from "@/components/mypage/year-poster-card";
import SavedMediaCard, { type SavedMediaItem } from "@/components/mypage/saved-media-card";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { FastAverageColor } from "fast-average-color";

type ViewMode = "poster" | "list" | "stats";
type SortMode = "user_date" | "rating" | "rainbow";
type MonthGroup = {
  monthNumber: number;
  monthLabel: string;
  items: SavedMediaItem[];
};
type RatingGroup = {
  ratingValue: number;
  ratingLabel: string;
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

function groupItemsByRating(items: SavedMediaItem[]): RatingGroup[] {
  const ratingValues = Array.from({ length: 11 }, (_, index) => 5 - index * 0.5);

  return ratingValues
    .map((ratingValue) => ({
      ratingValue,
      ratingLabel: `${ratingValue.toFixed(1)}점`,
      items: items.filter((item) => Number(item.user_rating) === ratingValue),
    }))
    .filter((group) => group.items.length > 0);
}

export default function MylistPage({ year, counts }: { year: any; counts: any[] }) {
  const router = useRouter();

  const [baseList, setBaseList] = useState([]) as any[];
  const [currentList, setCurrentList] = useState([]) as any[];
  const [isSelectedProvider, setIsSelectedProvider] = useState(true);
  const [isSelectedRating, setIsSelectedRating] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("user_date");
  const [totalItems, setTotalItems] = useState(0);
  const [posterColors, setPosterColors] = useState<Record<string, string>>({});
  const { uid } = useUser();
  const [viewMode, setViewMode] = useState<ViewMode>("poster");

  const sortByDate = (items: any[]) =>
    [...items].sort((a, b) => String(b.user_date || "").localeCompare(String(a.user_date || "")));

  const sortByRating = (items: any[]) =>
    [...items].sort((a, b) => (Number(b.user_rating) || 0) - (Number(a.user_rating) || 0));

  const removeItemFromView = (cid: string) => {
    setBaseList((prev: any[]) => prev.filter((item) => item._id !== cid));
    setCurrentList((prev: any[]) => prev.filter((item) => item._id !== cid));
    setTotalItems((prev) => Math.max(prev - 1, 0));
  };

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
      removeItemFromView(cid);
      Toast.toast("Deleted.");
    }
  };

  const fac = new FastAverageColor();
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s, l];
  };

  const applySortMode = async (mode: SortMode, items: any[] = baseList) => {
    if (mode === "user_date") {
      setCurrentList(sortByDate(items));
      return;
    }

    if (mode === "rating") {
      setCurrentList(sortByRating(items));
      return;
    }

    const colors = await Promise.all(
      items.map(async (item: any) => {
        const { value } = await fac.getColorAsync(
          `/api/proxy?url=${encodeURIComponent("https://image.tmdb.org/t/p/w500" + item.poster_path)}`,
        );
        const [r, g, b] = value;
        const [h] = rgbToHsl(Number(r), Number(g), Number(b));
        return { item, h };
      }),
    );
    const sorted = colors.sort((a, b) => a.h - b.h);
    setCurrentList(sorted.map((entry: any) => entry.item));
  };

  const handleSortModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const mode = event.target.value as SortMode;
    setSortMode(mode);
    void applySortMode(mode);
  };

  const isSelectedRainbow = sortMode === "rainbow";
  const handleSelectionRainbow = (isSelected: boolean) => {
    const mode: SortMode = isSelected ? "rainbow" : "user_date";
    setSortMode(mode);
    void applySortMode(mode);
  };

  const groupedMonths = groupItemsByMonth(baseList);
  const groupedRatings = groupItemsByRating(baseList);

  const handleGroupedCardUpdate = (contentId: string, nextDate: string, nextPosterPath: string, nextRating: number) => {
    if (!nextDate.startsWith(`${year}-`)) {
      setBaseList((prev: any[]) => prev.filter((item) => item._id !== contentId));
      setCurrentList((prev: any[]) => prev.filter((item) => item._id !== contentId));
      setTotalItems((prev) => Math.max(prev - 1, 0));
      return;
    }

    const applyUpdate = (items: any[]) =>
      items.map((item) =>
        item._id === contentId
          ? {
              ...item,
              user_date: nextDate,
              poster_path: nextPosterPath || item.poster_path,
              user_rating: nextRating,
            }
          : item,
      );

    setBaseList((prev: any[]) => applyUpdate(prev));
    setCurrentList((prev: any[]) => applyUpdate(prev));
  };

  useEffect(() => {
    if (!uid) return;

    const loadYearItems = async () => {
      const res = await fetch(`/api/mypage/content/by-year/${year}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: uid || "",
        },
      });

      if (!res.ok) return;

      const items = await res.json();
      setBaseList(items);
      setSortMode("user_date");
      setCurrentList(sortByDate(items));
      setTotalItems(items.length);
    };

    void loadYearItems();
  }, [uid, year, viewMode]);

  useEffect(() => {
    if (viewMode !== "stats" && viewMode !== "list") return;

    let isCancelled = false;
    const facForStats = new FastAverageColor();

    const extractColors = async () => {
      const colorEntries = await Promise.all(
        baseList.map(async (item: SavedMediaItem) => {
          if (!item.poster_path) {
            return [item._id, "rgba(148, 163, 184, 0.16)"] as const;
          }

          try {
            const { value } = await facForStats.getColorAsync(
              `/api/proxy?url=${encodeURIComponent(`https://image.tmdb.org/t/p/w500${item.poster_path}`)}`,
            );
            const [r, g, b] = value.map((channel) => Number(channel));
            const mix = (channel: number) => Math.round(channel + (255 - channel) * 0.42);
            return [item._id, `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`] as const;
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
      facForStats.destroy();
    };
  }, [baseList, viewMode]);

  return (
    <>
      <Title title={`마이페이지 > ${year}`} sub="" />
      <div className="flex flex-wrap justify-end gap-2 pb-1.5">
        {viewMode === "poster" ? (
          <select
            className="min-h-[2.5rem] rounded-full border border-slate-300/80 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            value={sortMode}
            disabled={!uid}
            onChange={handleSortModeChange}
          >
            <option value="user_date">관람일순</option>
            <option value="rating">점수순</option>
            <option value="rainbow">무지개순</option>
          </select>
        ) : null}
        {false ? <label className="hidden">
          <input
            type="checkbox"
            disabled={!uid || viewMode !== "poster"}
            checked={isSelectedRainbow}
            onChange={(event) => handleSelectionRainbow(event.target.checked)}
          />
          <span>무지개</span>
        </label> : null}
        <label className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
          <input
            type="checkbox"
            disabled={!uid}
            checked={isSelectedProvider}
            onChange={(event) => setIsSelectedProvider(event.target.checked)}
          />
          <span>제공처</span>
        </label>
        <label className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
          <input
            type="checkbox"
            disabled={!uid}
            checked={isSelectedRating}
            onChange={(event) => setIsSelectedRating(event.target.checked)}
          />
          <span>점수</span>
        </label>
        <div className="inline-flex rounded-full border border-slate-300/80 bg-white/80 p-1 dark:border-slate-700 dark:bg-slate-900/70">
          {(["poster", "list", "stats"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              disabled={!uid && mode !== "poster"}
              onClick={() => setViewMode(mode)}
              className={[
                "rounded-full px-3 py-1.5 text-sm transition",
                viewMode === mode
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-300",
              ].join(" ")}
            >
              {mode === "poster" ? "전체" : mode === "list" ? "점수별" : "월별"}
            </button>
          ))}
        </div>
        <select
          className="min-h-[2.5rem] rounded-full border border-slate-300/80 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          value={year}
          onChange={(event) => router.push(`/mypage/${event.target.value}`)}
        >
          {counts.map((count) => (
            <option key={count._id} value={count._id}>
              {count._id}
            </option>
          ))}
        </select>
        <Link
          href="/mypage"
          className="inline-flex min-h-[2.5rem] items-center rounded-full border border-slate-300/80 bg-white px-3 text-sm text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          전체 통계
        </Link>
      </div>

      <div>
        {((viewMode === "poster" && currentList.length === 0) || ((viewMode === "list" || viewMode === "stats") && baseList.length === 0)) ? (
          <>시청내역이 비어있습니다.</>
        ) : null}

        {uid ? (
          viewMode === "list" ? (
            groupedRatings.length ? (
              <div className="flex flex-col gap-6 py-1.5">
                {groupedRatings.map((group) => (
                  <section key={group.ratingValue} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-2 dark:border-slate-800/80">
                      <h2 className="page-title text-lg font-semibold">{group.ratingLabel}</h2>
                      <span className="browse-card__meta rounded-full bg-white/70 px-3 py-1 text-sm dark:bg-slate-900/70">
                        {group.items.length}개
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 min-[640px]:grid-cols-5 min-[960px]:grid-cols-8">
                      {group.items.map((item) => (
                        <SavedMediaCard
                          key={item._id}
                          content={item}
                          backgroundColor={posterColors[item._id] ?? "rgba(148, 163, 184, 0.16)"}
                          showProvider={isSelectedProvider}
                          showRating={isSelectedRating}
                          onDelete={handleDelete}
                          onUpdate={handleGroupedCardUpdate}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : null
          ) : viewMode === "stats" ? (
            groupedMonths.length ? (
              <div className="flex flex-col gap-6 py-1.5">
                {groupedMonths.map((group) => (
                  <section key={group.monthNumber} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-2 dark:border-slate-800/80">
                      <h2 className="page-title text-lg font-semibold">{group.monthLabel}</h2>
                      <span className="browse-card__meta rounded-full bg-white/70 px-3 py-1 text-sm dark:bg-slate-900/70">
                        {group.items.length}개
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 min-[640px]:grid-cols-5 min-[960px]:grid-cols-8">
                      {group.items.map((item) => (
                        <SavedMediaCard
                          key={item._id}
                          content={item}
                          backgroundColor={posterColors[item._id] ?? "rgba(148, 163, 184, 0.16)"}
                          showProvider={isSelectedProvider}
                          showRating={isSelectedRating}
                          onDelete={handleDelete}
                          onUpdate={handleGroupedCardUpdate}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : null
          ) : (
            <div className="grid grid-cols-4 gap-1 p-2 sm:grid-cols-8">
              {currentList.map((content: any) => (
                <CardCol
                  key={content._id}
                  thisYear={year}
                  content={content}
                  isProvider={isSelectedProvider}
                  isRating={isSelectedRating}
                  onUpdate={removeItemFromView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-4 gap-1 p-2 sm:grid-cols-8">
            {currentList.map((poster: any, index: number) => (
              <Image
                alt="sorted posters"
                key={index}
                src={`https://image.tmdb.org/t/p/w500${poster}`}
                width={220}
                height={330}
                className="h-full w-full rounded-sm object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

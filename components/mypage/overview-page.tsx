"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FastAverageColor } from "fast-average-color";
import { Toast } from "@heroui/react";
import Title from "@/components/common/title";
import SavedMediaCard, { type SavedMediaItem } from "@/components/cards/saved-poster-card";
import { useUser } from "@/context/UserContext";

type YearCount = {
  _id: string;
  count: number;
};

type RatingBucket = {
  label: string;
  count: number;
};

function toPastelColor(r: number, g: number, b: number) {
  const mix = (channel: number) => Math.round(channel + (255 - channel) * 0.42);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function formatRating(value?: number | null) {
  const rating = Number(value);
  return Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : "-";
}

function buildRatingBuckets(items: SavedMediaItem[]): RatingBucket[] {
  return Array.from({ length: 11 }, (_, index) => 5 - index * 0.5)
    .map((value) => ({
      label: `${value.toFixed(1)}점`,
      count: items.filter((item) => Number(item.user_rating) === value).length,
    }))
    .filter((item) => item.count > 0);
}

export default function MyPageOverviewPage({
  counts,
  currentYear,
  allItems,
}: {
  counts: YearCount[];
  currentYear: string;
  allItems: SavedMediaItem[];
}) {
  const { uid } = useUser();
  const [items, setItems] = useState<SavedMediaItem[]>(Array.isArray(allItems) ? allItems : []);
  const [posterColors, setPosterColors] = useState<Record<string, string>>({});
  const [isYearStatsExpanded, setIsYearStatsExpanded] = useState(false);

  const safeCounts = Array.isArray(counts) ? counts : [];
  const totalSaved = items.length;
  const movieCount = items.filter((item) => item.type === "movie").length;
  const tvCount = items.filter((item) => item.type === "tv").length;
  const thisYearCount = items.filter((item) => item.user_date?.startsWith(`${currentYear}-`)).length;
  const ratedItems = items.filter((item) => Number(item.user_rating) > 0);
  const averageRating = ratedItems.length
    ? (ratedItems.reduce((sum, item) => sum + Number(item.user_rating || 0), 0) / ratedItems.length).toFixed(1)
    : "-";
  const savedDates = items.map((item) => item.user_date).filter(Boolean).sort();
  const firstSaved = savedDates[0] || "-";
  const latestSaved = savedDates[savedDates.length - 1] || "-";
  const recentItems = [...items].sort((a, b) => String(b.user_date || "").localeCompare(String(a.user_date || ""))).slice(0, 8);
  const topRatedItems = [...items]
    .filter((item) => Number(item.user_rating) > 0)
    .sort((a, b) => {
      const ratingDiff = Number(b.user_rating || 0) - Number(a.user_rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return String(b.user_date || "").localeCompare(String(a.user_date || ""));
    })
    .slice(0, 8);
  const ratingBuckets = buildRatingBuckets(items);
  const maxYearCount = Math.max(...safeCounts.map((item) => Number(item.count) || 0), 1);
  const maxRatingCount = Math.max(...ratingBuckets.map((item) => item.count), 1);
  const topYearByCount = [...safeCounts].sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0))[0];
  const averagePerYear = safeCounts.length
    ? String(Math.round(safeCounts.reduce((sum, item) => sum + (Number(item.count) || 0), 0) / safeCounts.length))
    : "0";
  const visibleYearCounts = isYearStatsExpanded ? safeCounts : safeCounts.slice(0, 10);
  const hasMoreYearCounts = safeCounts.length > 10;

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
      const recentItemsForColor = [...items]
        .sort((a, b) => String(b.user_date || "").localeCompare(String(a.user_date || "")))
        .slice(0, 8);
      const topRatedItemsForColor = [...items]
        .filter((item) => Number(item.user_rating) > 0)
        .sort((a, b) => {
          const ratingDiff = Number(b.user_rating || 0) - Number(a.user_rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return String(b.user_date || "").localeCompare(String(a.user_date || ""));
        })
        .slice(0, 8);
      const displayItems = [
        ...new Map([...recentItemsForColor, ...topRatedItemsForColor].map((item) => [item._id, item])).values(),
      ];
      const colorEntries = await Promise.all(
        displayItems.map(async (item) => {
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
      <Title title="마이페이지" sub="전체 저장 기록을 한 번에 보는 통계 페이지입니다." />

      <div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            전체 {totalSaved}개 중 올해는 <span className="font-semibold">{thisYearCount}개</span>를 저장했습니다.
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            관람날짜 기준 가장 많이 기록한 연도는{" "}
            <span className="font-semibold">
              {topYearByCount?._id ? `${topYearByCount._id}년` : "-"}
            </span>
            입니다.
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            영화 {movieCount} / 시리즈 {tvCount}, 평균 평점 <span className="font-semibold">{averageRating}</span>입니다.
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-2 dark:border-slate-800/80">
            <h2 className="page-title text-lg font-semibold">최근 저장</h2>
            <Link
              href={`/mypage/${currentYear}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 transition hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200"
            >
              자세히보기
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          {recentItems.length ? (
            <div className="grid grid-cols-4 gap-1">
              {recentItems.map((item) => (
                <SavedMediaCard
                  key={item._id}
                  content={item}
                  backgroundColor={posterColors[item._id] ?? "rgba(148, 163, 184, 0.16)"}
                  showProvider
                  showRating
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="py-4 text-sm text-slate-500 dark:text-slate-400">아직 저장한 작품이 없습니다.</div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-2 dark:border-slate-800/80">
            <h2 className="page-title text-lg font-semibold">상위 평가</h2>
          </div>
          {topRatedItems.length ? (
            <div className="grid grid-cols-4 gap-1">
              {topRatedItems.map((item) => (
                <SavedMediaCard
                  key={item._id}
                  content={item}
                  backgroundColor={posterColors[item._id] ?? "rgba(148, 163, 184, 0.16)"}
                  showProvider
                  showRating
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="py-4 text-sm text-slate-500 dark:text-slate-400">아직 평점 데이터가 없습니다.</div>
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        <section className="browse-card rounded-[24px] border p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="page-title text-lg font-semibold">관람연도 분포</h2>
            <span className="browse-card__meta text-sm">평균 {averagePerYear}개</span>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {visibleYearCounts.map((item) => (
              <Link key={item._id} href={`/mypage/${item._id}`} className="grid grid-cols-[4rem_1fr_3rem] items-center gap-3">
                <span className="browse-card__meta text-sm">{item._id}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                  <div
                    className="h-full rounded-full bg-slate-900 dark:bg-slate-100"
                    style={{ width: `${((Number(item.count) || 0) / maxYearCount) * 100}%` }}
                  />
                </div>
                <span className="browse-card__title text-right text-sm font-semibold">{item.count}</span>
              </Link>
            ))}
          </div>
          {hasMoreYearCounts ? (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                className="rounded-full border border-slate-300/80 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                onClick={() => setIsYearStatsExpanded((prev) => !prev)}
              >
                {isYearStatsExpanded ? "▴ 접기" : "▾ 더보기"}
              </button>
            </div>
          ) : null}
        </section>

        <section className="browse-card rounded-[24px] border p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="page-title text-lg font-semibold">평가점수 분포</h2>
            <span className="browse-card__meta text-sm">평균 {averageRating}점</span>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {ratingBuckets.length ? (
              ratingBuckets.map((item) => (
                <div key={item.label} className="grid grid-cols-[4rem_1fr_3rem] items-center gap-3">
                  <span className="browse-card__meta text-sm">{item.label}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                    <div
                      className="h-full rounded-full bg-slate-900 dark:bg-slate-100"
                      style={{ width: `${(item.count / maxRatingCount) * 100}%` }}
                    />
                  </div>
                  <span className="browse-card__title text-right text-sm font-semibold">{item.count}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">아직 평점을 남긴 작품이 없습니다.</div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

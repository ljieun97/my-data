"use client";

import { type ChangeEvent, SetStateAction, useEffect, useState } from "react";
import { Toast } from "@heroui/react";
import Image from "next/image";
import Title from "../components/common/title";
import CardCol from "@/components/contents/card-col";
import SavedListRow from "@/components/contents/saved-list-row";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { FastAverageColor } from "fast-average-color";

type ViewMode = "poster" | "list" | "stats";
type SortMode = "user_date" | "rating" | "rainbow";

export default function MylistPage({ year, counts }: { year: any; counts: any[] }) {
  const router = useRouter();
  const itemsPerPage = 10;

  const [baseList, setBaseList] = useState([]) as any[];
  const [currentList, setCurrentList] = useState([]) as any[];
  const [isSelectedProvider, setIsSelectedProvider] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("user_date");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { uid } = useUser();

  const gridSettings = [
    { key: "grid-cols-6", label: "6 columns" },
    { key: "grid-cols-7", label: "7 columns" },
    { key: "grid-cols-8", label: "8 columns" },
    { key: "grid-cols-9", label: "9 columns" },
    { key: "grid-cols-10", label: "10 columns" },
    { key: "grid-cols-11", label: "11 columns" },
    { key: "grid-cols-12", label: "12 columns" },
    { key: "grid-flow-col grid-rows-1", label: "Row 1" },
    { key: "grid-flow-col grid-rows-2", label: "Row 2" },
    { key: "grid-flow-col grid-rows-3", label: "Row 3" },
    { key: "grid-flow-col grid-rows-4", label: "Row 4" },
    { key: "grid-flow-col grid-rows-5", label: "Row 5" },
    { key: "grid-flow-col grid-rows-6", label: "Row 6" },
    { key: "grid-flow-col grid-rows-7", label: "Row 7" },
  ];
  const [selectGrid, setSelectGrid] = useState("sm:grid-cols-12");
  const [viewMode, setViewMode] = useState<ViewMode>("poster");

  const handleSelectionChange = (e: { target: { value: SetStateAction<string> } }) => {
    setSelectGrid(e.target.value);
  };

  const sortByDate = (items: any[]) =>
    [...items].sort((a, b) => String(b.user_date || "").localeCompare(String(a.user_date || "")));

  const sortByRating = (items: any[]) =>
    [...items].sort((a, b) => (Number(b.user_rating) || 0) - (Number(a.user_rating) || 0));

  const refreshListPageAfterRemoval = (currentPageSize: number) => {
    const nextPage = currentPageSize === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
    setTotalItems((prev) => Math.max(prev - 1, 0));

    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
      return;
    }

    fetchListPage(nextPage);
  };

  const fetchPosterList = async () => {
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

  const fetchListPage = async (page: number) => {
    const res = await fetch(`/api/mypage/content/by-year/${year}?page=${page}&limit=${itemsPerPage}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: uid || "",
      },
    });

    if (!res.ok) return;

    const data = await res.json();
    setCurrentList(data.items || []);
    setTotalItems(data.totalCount || 0);
  };

  const removeItemFromView = (cid: string) => {
    if (viewMode === "poster") {
      setBaseList((prev: any[]) => prev.filter((item) => item._id !== cid));
      setCurrentList((prev: any[]) => prev.filter((item) => item._id !== cid));
      setTotalItems((prev) => Math.max(prev - 1, 0));
      return;
    }

    refreshListPageAfterRemoval(currentList.length);
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

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const movieCount = baseList.filter((item: any) => item.type === "movie").length;
  const tvCount = baseList.filter((item: any) => item.type === "tv").length;
  const savedDates = baseList.map((item: any) => item.user_date).filter(Boolean).sort();
  const latestSaved = savedDates.length ? savedDates[savedDates.length - 1] : "-";
  const firstSaved = savedDates.length ? savedDates[0] : "-";

  const monthlyCounts = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const count = baseList.filter((item: any) => item.user_date?.slice(5, 7) === month).length;
    return {
      month: `${index + 1}월`,
      count,
    };
  });
  const maxMonthlyCount = Math.max(...monthlyCounts.map((item) => item.count), 1);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (viewMode === "list") setCurrentPage(1);
  }, [viewMode, year]);

  useEffect(() => {
    if (!uid || (viewMode !== "poster" && viewMode !== "stats")) return;
    fetchPosterList();
  }, [uid, year, viewMode]);

  useEffect(() => {
    if (!uid || viewMode !== "list") return;
    fetchListPage(currentPage);
  }, [uid, year, viewMode, currentPage]);

  return (
    <>
      <Title title="마이페이지" sub="" />
      <div className="flex flex-wrap justify-end gap-2 pb-2">
        {viewMode === "poster" ? (
          <select
            className="min-h-[2.5rem] rounded-full border border-slate-300/80 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            value={sortMode}
            disabled={!uid}
            onChange={handleSortModeChange}
          >
            <option value="user_date">user_date</option>
            <option value="rating">rating</option>
            <option value="rainbow">무지개</option>
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
              {mode === "poster" ? "포스터" : mode === "list" ? "리스트" : "통계"}
            </button>
          ))}
        </div>
        {viewMode === "poster" ? (
          <select
            className="min-h-[2.5rem] rounded-full border border-slate-300/80 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            value={selectGrid}
            onChange={handleSelectionChange}
          >
            {gridSettings.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        ) : null}
        <select
          className="min-h-[2.5rem] rounded-full border border-slate-300/80 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          value={year}
          onChange={(event) => router.push(`/mypage/${event.target.value}`)}
        >
          {counts.map((count) => (
            <option key={count._id} value={count._id}>
              {count._id} ({count.count})
            </option>
          ))}
        </select>
      </div>

      <div>
        {((viewMode === "list" && totalItems === 0) || ((viewMode === "poster" || viewMode === "stats") && baseList.length === 0)) ? (
          <>시청내역이 비어있습니다.</>
        ) : null}

        {uid ? (
          viewMode === "list" ? (
            <div className="flex flex-col gap-3 py-3">
              {currentList.map((content: any) => (
                <SavedListRow
                  key={content._id}
                  thisYear={year}
                  content={content}
                  isProvider={isSelectedProvider}
                  onUpdate={removeItemFromView}
                  onDelete={handleDelete}
                />
              ))}
              {totalItems > itemsPerPage ? (
                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200/70 pt-3 dark:border-slate-700/70">
                  <button
                    type="button"
                    className="rounded-full border px-3 py-1.5 text-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  >
                    이전
                  </button>
                  <span className="browse-card__meta text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="rounded-full border px-3 py-1.5 text-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    다음
                  </button>
                </div>
              ) : null}
            </div>
          ) : viewMode === "stats" ? (
            <div className="grid gap-4 py-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="browse-card rounded-[24px] border p-4">
                  <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Total Saved</p>
                  <p className="browse-card__title mt-3 text-3xl font-semibold">{totalItems}</p>
                </div>
                <div className="browse-card rounded-[24px] border p-4">
                  <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Movies</p>
                  <p className="browse-card__title mt-3 text-3xl font-semibold">{movieCount}</p>
                </div>
                <div className="browse-card rounded-[24px] border p-4">
                  <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">TV Series</p>
                  <p className="browse-card__title mt-3 text-3xl font-semibold">{tvCount}</p>
                </div>
              </div>

              <div className="browse-card rounded-[24px] border p-4">
                <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Saved Range</p>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="browse-card__meta">첫 저장일</span>
                    <span className="browse-card__title text-base font-semibold">{firstSaved}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="browse-card__meta">최근 저장일</span>
                    <span className="browse-card__title text-base font-semibold">{latestSaved}</span>
                  </div>
                </div>
              </div>

              <div className="browse-card rounded-[24px] border p-4">
                <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Monthly Activity</p>
                <div className="mt-4 flex flex-col gap-3">
                  {monthlyCounts.map((item) => (
                    <div key={item.month} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3">
                      <span className="browse-card__meta text-sm">{item.month}</span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                        <div
                          className="h-full rounded-full bg-slate-900 dark:bg-slate-100"
                          style={{ width: `${(item.count / maxMonthlyCount) * 100}%` }}
                        />
                      </div>
                      <span className="browse-card__title text-right text-sm font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={`grid grid-cols-6 gap-1 py-2 ${selectGrid}`}>
              {currentList.map((content: any) => (
                <CardCol
                  key={content._id}
                  thisYear={year}
                  content={content}
                  isProvider={isSelectedProvider}
                  onUpdate={removeItemFromView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        ) : (
          <div className={`grid grid-cols-6 gap-1 py-2 ${selectGrid}`}>
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

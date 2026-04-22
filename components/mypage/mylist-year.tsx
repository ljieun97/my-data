"use client";

import { SetStateAction, useState } from "react";
import { Toast } from "@heroui/react";
import Image from "next/image";
import Title from "@/components/common/title";
import CardCol from "@/components/mypage/year-poster-card";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { FastAverageColor } from "fast-average-color";

export default function MylistYear({ year, list, counts }: { year: any; list: any[]; counts: any[] }) {
  const router = useRouter();
  const [currentList, setCurrentList] = useState(list) as any[];
  const [isSelectedProvider, setIsSelectedProvider] = useState(false);
  const [isSelectedRainbow, setIsSelectedRainbow] = useState(false);
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
  const [selectGrid, setSelectGrid] = useState("grid-cols-12");

  const handleSelectionChange = (e: { target: { value: SetStateAction<string> } }) => {
    setSelectGrid(e.target.value);
  };

  const deleteItem = (cid: string) => {
    setCurrentList((prev: any[]) => prev.filter((item) => item._id !== cid));
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
      deleteItem(cid);
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

  const handleSelectionRainbow = async (isSelected: boolean) => {
    if (isSelected) {
      setIsSelectedRainbow(true);
      const colors = await Promise.all(
        currentList.map(async (item: any) => {
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
      return;
    }

    setIsSelectedRainbow(false);
    setCurrentList(list);
  };

  return (
    <>
      <Title title="마이페이지" sub="" />
      <div className="flex flex-wrap justify-end gap-2 pb-2">
        <label className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
          <input
            type="checkbox"
            disabled={!uid}
            checked={isSelectedRainbow}
            onChange={(event) => handleSelectionRainbow(event.target.checked)}
          />
          <span>무지개</span>
        </label>
        <label className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
          <input
            type="checkbox"
            disabled={!uid}
            checked={isSelectedProvider}
            onChange={(event) => setIsSelectedProvider(event.target.checked)}
          />
          <span>제공처</span>
        </label>
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

      <div className="overflow-auto rounded-md border-2 px-2" style={{ height: "calc(100% - 12px)" }}>
        {currentList.length === 0 && list.length === 0 ? <>시청내역이 비어있습니다.</> : null}

        {uid ? (
          <div className={`grid gap-1 py-2 ${selectGrid}`}>
            {currentList.map((content: any) => (
              <CardCol
                key={content._id}
                thisYear={year}
                content={content}
                isProvider={isSelectedProvider}
                isRating
                onUpdate={deleteItem}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className={`grid gap-1 py-2 ${selectGrid}`}>
            {list.map((poster: any, index: number) => (
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

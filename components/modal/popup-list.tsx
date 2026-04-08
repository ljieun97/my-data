"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TooltipDetail } from "./tooltip-detail";

export const PopupList = ({ type, list }: { type: string; list: any[] }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | string | null>(null);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        disabled={!list.length}
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full border px-2.5 py-1 text-sm disabled:opacity-50"
      >
        {list?.length}
      </button>

      {isOpen ? (
        <div className="absolute left-full top-0 z-40 ml-2 min-w-48 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {list.map((entry: any) => (
            <div
              key={entry.id}
              className="relative w-full"
              onMouseEnter={() => setHoveredId(entry.id)}
              onMouseLeave={() => setHoveredId((prev) => (prev === entry.id ? null : prev))}
            >
              <button
                type="button"
                className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/${type}/${entry.id}`);
                }}
              >
                {entry.title}
              </button>

              {hoveredId === entry.id ? (
                <div className="absolute left-full top-0 z-50 ml-2 w-[308px] rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <TooltipDetail id={entry.id} type={type} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

function CastCard({ item, compact = false }: { item: any; compact?: boolean }) {
  return (
    <Link
      href={item.id ? `/person/${item.id}` : "#"}
      className={
        compact
          ? "min-w-0 overflow-hidden rounded-2xl bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-950/80"
          : "flex min-w-0 items-center gap-3 rounded-2xl bg-white/90 p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-950/80"
      }
      aria-disabled={!item.id}
    >
      <div
        className={
          compact
            ? "aspect-[2/3] w-full overflow-hidden bg-slate-200 dark:bg-slate-800"
            : "h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800"
        }
      >
        {item.profile_path ? (
          <img
            alt={item.name}
            className="h-full w-full object-cover"
            src={`https://image.tmdb.org/t/p/w500/${item.profile_path}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <FontAwesomeIcon icon={faImage} />
          </div>
        )}
      </div>
      <div className={compact ? "min-w-0 space-y-1 p-2.5" : "min-w-0"}>
        <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
        <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{item.character || "-"}</p>
      </div>
    </Link>
  );
}

export default function MediaCastPanel({ casts }: { casts: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const firstRowCasts = casts.slice(0, 8);
  const extraCasts = casts.slice(8);

  return (
    <section className="space-y-4 rounded-[26px] bg-slate-50/80 p-5 dark:bg-slate-900/70">
      <h4 className="text-base font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">배우</h4>
      {firstRowCasts.length > 0 ? (
        <div className="grid grid-cols-8 gap-3">
          {firstRowCasts.map((item: any, index: number) => (
            <CastCard key={`${item.id ?? item.name}-${index}`} item={item} compact />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">현재 배우 정보가 없습니다.</p>
      )}

      {isExpanded && extraCasts.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {extraCasts.map((item: any, index: number) => (
            <CastCard key={`${item.id ?? item.name}-extra-${index}`} item={item} />
          ))}
        </div>
      ) : null}

      {casts.length > 8 ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? "접기" : "더보기"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

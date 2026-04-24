"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function MediaCastPanel({
  casts,
  castsRef,
}: {
  casts: any[];
  castsRef: React.RefObject<HTMLSpanElement>;
}) {
  const cutCasts = casts.slice(0, 12);

  return (
    <section className="space-y-4 rounded-[26px] bg-slate-50/80 p-5 dark:bg-slate-900/70">
      <h4 className="text-base font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">Cast</h4>
      {cutCasts.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cutCasts.map((item: any, index: number) => (
            <Link
              key={`${item.id ?? item.name}-${index}`}
              href={item.id ? `/person/${item.id}` : "#"}
              className="flex min-w-0 items-center gap-3 rounded-2xl bg-white/90 p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-950/80"
              aria-disabled={!item.id}
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
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
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{item.character || "-"}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">Currently this title does not have cast information.</p>
      )}

      {casts.length > 12 ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            onClick={() => castsRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            View full cast
          </button>
        </div>
      ) : null}
    </section>
  );
}

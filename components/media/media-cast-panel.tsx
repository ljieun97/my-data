"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

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
        <div className="media-cast-grid grid gap-3">
          {cutCasts.map((item: any, index: number) => (
            <div key={index} className="overflow-hidden rounded-2xl bg-white/90 shadow-sm dark:bg-slate-950/80">
              <div className="overflow-hidden">
                {item.profile_path ? (
                  <img
                    width="100%"
                    alt={item.name}
                    className="aspect-[26/37] w-full object-cover"
                    src={`https://image.tmdb.org/t/p/w500/${item.profile_path}`}
                  />
                ) : (
                  <div className="flex aspect-[26/37] w-full items-center justify-center bg-slate-200 dark:bg-slate-800">
                    <FontAwesomeIcon icon={faImage} />
                  </div>
                )}
              </div>
              <div className="px-3 py-3 text-center">
                <p className="line-clamp-1 text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{item.character || "-"}</p>
              </div>
            </div>
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

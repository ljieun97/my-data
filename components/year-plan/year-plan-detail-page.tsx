import Link from "next/link";
import type { YearPlanYearGroup } from "@/lib/year-plan";

function buildDetailHref(tmdbType?: "movie" | "tv" | null, tmdbId?: number | null) {
  if (!tmdbType || !tmdbId) {
    return null;
  }

  return `/${tmdbType}/${tmdbId}`;
}

function entryTypeTone(type?: string | null) {
  switch (type) {
    case "개봉":
      return "bg-amber-50/95 dark:bg-amber-500/10";
    case "사건":
      return "bg-sky-50/95 dark:bg-sky-500/10";
    default:
      return "bg-white/72 dark:bg-slate-950/70";
  }
}

export default function YearPlanDetailPage({ plan }: { plan: YearPlanYearGroup }) {
  return (
    <div className="page-shell mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/88 shadow-[0_24px_56px_rgba(15,23,42,0.08)] dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="flex flex-col gap-4 p-6 sm:p-8 lg:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            Year Plan
          </p>
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <h1 className="page-title text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{plan.title}</h1>
            <span className="text-base font-medium text-slate-400 dark:text-slate-500">{plan.months.length} months</span>
          </div>
        </div>
      </section>

      <section className="content-grid-shell rounded-[28px] border p-5 sm:p-6 lg:p-8">
        <div className="space-y-8">
          {plan.months.map((monthGroup) => (
            <section key={monthGroup.key} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                  {monthGroup.label}
                </span>
                <span className="text-sm text-slate-400 dark:text-slate-500">{monthGroup.entries.length} entries</span>
              </div>

              <div className="space-y-4">
                {monthGroup.entries.map((entry, index) => {
                  const detailHref = buildDetailHref(entry.tmdbType, entry.tmdbId);

                  return (
                    <article
                      key={`${monthGroup.key}-${entry.date}-${entry.title}-${index}`}
                      className={`rounded-[24px] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] ${entryTypeTone(entry.type)}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                              {entry.date}
                            </span>
                            {entry.tmdbType ? (
                              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                                {entry.tmdbType}
                              </span>
                            ) : null}
                          </div>
                          <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
                            {entry.title}
                          </h2>
                          <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                            {entry.summary || "현재 정보가 등록되지 않았거나 정보가 없습니다."}
                          </p>
                        </div>

                        {detailHref ? (
                          <Link
                            href={detailHref}
                            className="inline-flex w-fit shrink-0 border-b border-slate-900 pb-1 text-sm font-semibold tracking-[-0.02em] text-slate-900 transition hover:border-slate-600 hover:text-slate-600 dark:border-slate-100 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:text-slate-300"
                          >
                            관련 작품 보기
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

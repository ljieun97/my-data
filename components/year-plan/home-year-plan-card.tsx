import Link from "next/link";
import type { YearPlanPreview } from "@/lib/year-plan";

function entryTypeTone(type?: string | null) {
  switch (type) {
    case "개봉":
      return "bg-amber-50/95 dark:bg-amber-500/10";
    case "사건":
      return "bg-sky-50/95 dark:bg-sky-500/10";
    default:
      return "bg-white/70 dark:bg-slate-900/80";
  }
}

export default function HomeYearPlanCard({ plan }: { plan: YearPlanPreview }) {
  return (
    <section className="home-card overflow-hidden rounded-[28px] border border-white/70 bg-white/88 shadow-[0_20px_44px_rgba(15,23,42,0.08)] dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              Year Plan
            </p>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="home-title text-2xl font-semibold tracking-[-0.04em] sm:text-[2rem]">{plan.title}</h2>
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">지난달 · 이번달 · 다음달</span>
            </div>
          </div>

          <Link
            href={`/year-plan/${plan.year}`}
            className="inline-flex items-center border-b border-slate-900 pb-1 text-sm font-semibold tracking-[-0.02em] text-slate-900 transition hover:border-slate-600 hover:text-slate-600 dark:border-slate-100 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:text-slate-300"
          >
            자세히 보기
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {plan.months.map((month) => (
            <div key={month.key} className="rounded-[22px] bg-slate-100/90 p-4 dark:bg-slate-900/80">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 dark:text-slate-500">{month.label}</p>
              <div className="mt-3 space-y-2.5">
                {month.entries.map((entry) => (
                  <div
                    key={`${month.key}-${entry.date}-${entry.title}`}
                    className={`space-y-1 rounded-2xl px-3 py-2.5 ${entryTypeTone(entry.type)}`}
                  >
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{entry.date}</p>
                    <p className="text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">{entry.title}</p>
                    {entry.summary ? (
                      <p className="line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{entry.summary}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

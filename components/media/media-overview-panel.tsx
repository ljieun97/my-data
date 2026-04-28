"use client";

export default function MediaOverviewPanel({ overview }: { overview: string }) {
  return (
    <section className="space-y-3 rounded-[26px] bg-slate-50/80 p-5 dark:bg-slate-900/70">
      <h4 className="text-base font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">소개</h4>
      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{overview}</p>
    </section>
  );
}

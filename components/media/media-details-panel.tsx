"use client";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 text-sm">
      <span className="text-slate-400 dark:text-slate-500">{label}</span>
      <span className="text-slate-600 dark:text-slate-300">{value}</span>
    </div>
  );
}

export default function MediaDetailsPanel({
  genres,
  countries,
  language,
  casts,
  castsRef,
}: {
  genres: string;
  countries: string;
  language: string;
  casts: any[];
  castsRef: React.RefObject<HTMLSpanElement>;
}) {
  return (
    <section className="space-y-4 rounded-[26px] bg-slate-50/80 p-5 dark:bg-slate-900/70">
      <h4 className="text-base font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">Details</h4>
      <div className="space-y-3">
        <DetailRow label="Genres" value={genres} />
        <DetailRow label="Country" value={countries} />
        <DetailRow label="Language" value={language} />
        <DetailRow
          label="Cast list"
          value={
            casts.length > 0 ? (
              <span ref={castsRef}>{casts.map((item: any) => item.original_name || item.name).join(", ")}</span>
            ) : (
              "-"
            )
          }
        />
      </div>
    </section>
  );
}

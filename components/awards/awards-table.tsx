"use client";

import { useRouter } from "next/navigation";
import AwardCell from "./awards-cell";

const AWARDS = [
  { year: 2025, col1: "", col2: "", col3: 1456349 },
  { year: 2024, col1: 1064213, col2: 1064213, col3: 1064213 },
];

export default function AwardsTable() {
  const router = useRouter();

  return (
    <div className="content-panel">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title text-lg font-semibold tracking-[-0.05em]">Awards</h1>
          <p className="page-subtitle mt-1 text-sm">Major awards by year.</p>
        </div>
        <button
          className="awards-table-shell__button rounded-full border border-slate-300/80 bg-white/90 px-4 py-2 text-sm font-medium shadow-[0_10px_24px_rgba(148,163,184,0.16)] transition hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/78 dark:shadow-[0_14px_30px_rgba(2,6,23,0.28)] dark:hover:bg-slate-900/92"
          onClick={() => router.push("/awards/oscar")}
        >
          2024 Oscar
        </button>
      </div>

      <div className="rounded-[24px] border border-slate-200/80 bg-white/82 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-700/70 dark:bg-slate-950/65 dark:shadow-[0_20px_48px_rgba(2,6,23,0.34)]">
        <table className="awards-table-shell w-full table-fixed border-collapse">
          <thead>
            <tr>
              <th className="w-1/4 px-4 py-3 text-left">Year</th>
              <th className="w-1/4 px-4 py-3 text-left">Critics</th>
              <th className="w-1/4 px-4 py-3 text-left">Academy</th>
              <th className="w-1/4 px-4 py-3 text-left">Cannes</th>
            </tr>
          </thead>
          <tbody>
            {AWARDS.map((award) => (
              <tr key={award.year}>
                <td className="px-4 py-3">{award.year}</td>
                <td className="px-4 py-3">
                  <AwardCell id={award.col1} />
                </td>
                <td className="px-4 py-3">
                  <AwardCell id={award.col2} />
                </td>
                <td className="px-4 py-3">
                  <AwardCell id={award.col3} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

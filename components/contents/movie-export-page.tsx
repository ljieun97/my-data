"use client";

import { useState } from "react";

const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: currentYear + 2 - 1888 + 1 }, (_, index) => currentYear + 2 - index);

export default function MovieExportPage() {
  const [year, setYear] = useState(currentYear);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const downloadExcel = async () => {
    setIsDownloading(true);
    setError("");

    try {
      const response = await fetch(`/api/movie-export?year=${year}`);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "엑셀 파일을 만들지 못했습니다.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `tmdb-${year}-movies.xlsx`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "엑셀 파일을 만들지 못했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl py-8 sm:py-16">
      <div className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">TMDB Export</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">영화 엑셀 다운로드</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          연도를 선택하면 투표가 1개 이상인 영화 중 TMDB 인기도 상위 10편을 한국어 정보로 정리합니다.
          제작 국가·제작사, 감독, 전체 출연진도 함께 포함되며, 엑셀 머리글에서 필터와 정렬을 사용할 수 있습니다.
        </p>

        <div className="mt-10 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900/80 sm:flex sm:items-end sm:gap-4">
          <label className="block w-full sm:min-w-[18rem] sm:flex-1">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">개봉 연도</span>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="h-14 w-full appearance-auto rounded-xl border border-slate-200 bg-white px-5 text-lg font-bold text-slate-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-amber-900/30"
              aria-label="개봉 연도"
            >
              {availableYears.map((optionYear) => (
                <option key={optionYear} value={optionYear}>{optionYear}년</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={downloadExcel}
            disabled={isDownloading || year < 1888 || year > currentYear + 2}
            className="mt-4 inline-flex h-14 w-full shrink-0 items-center justify-center rounded-xl bg-slate-950 px-7 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 sm:mt-0 sm:w-auto"
          >
            {isDownloading ? "엑셀 만드는 중..." : "엑셀 다운로드"}
          </button>
        </div>

        {error ? <p role="alert" className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">{error}</p> : null}

        <div className="mt-8 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/70 p-4 dark:border-slate-800"><strong className="block text-slate-950 dark:text-white">TOP 10</strong>인기도 내림차순</div>
          <div className="rounded-xl border border-slate-200/70 p-4 dark:border-slate-800"><strong className="block text-slate-950 dark:text-white">한국어 정보</strong>제목·장르·줄거리</div>
          <div className="rounded-xl border border-slate-200/70 p-4 dark:border-slate-800"><strong className="block text-slate-950 dark:text-white">상세 항목</strong>제작진·전체 배우</div>
        </div>
      </div>
    </section>
  );
}

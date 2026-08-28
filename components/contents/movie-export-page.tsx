"use client";

import { useRef, useState } from "react";
import {
  MIN_RUNTIME_MINUTES, MIN_VOTE_COUNT, collectExportMovies, planExportWindows,
  type DateWindow, type ExportPage, type ExportProgress, type ExportSummary,
} from "@/lib/movie-export";

const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: currentYear + 2 - 1888 + 1 }, (_, index) => currentYear + 2 - index);
type Phase = "idle" | "planning" | "collecting" | "building";

async function readApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "영화 정보를 조회하지 못했습니다.");
  return data as T;
}

export default function MovieExportPage() {
  const [year, setYear] = useState(currentYear);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [plannedCount, setPlannedCount] = useState(0);
  const [error, setError] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const isRunning = phase !== "idle";

  const downloadExcel = async () => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setPhase("planning");
    setProgress(null);
    setPlannedCount(0);
    setError("");
    const query = (window: DateWindow, extra: Record<string, string>) => {
      const params = new URLSearchParams({ year: String(year), from: window.from, to: window.to, ...extra });
      return `/api/movie-export?${params}`;
    };

    try {
      const plan = await planExportWindows(year, async (window) => {
        const response = await fetch(query(window, { mode: "summary" }), { signal: controller.signal });
        return readApiResponse<ExportSummary>(response);
      });
      const expected = plan.reduce((sum, window) => sum + window.totalResults, 0);
      setPlannedCount(expected);
      if (expected === 0) throw new Error(`${year}년 조건에 맞는 영화가 없습니다.`);

      setPhase("collecting");
      const movies = await collectExportMovies(
        plan,
        async (window, page) => {
          const response = await fetch(query(window, { page: String(page) }), { signal: controller.signal });
          return readApiResponse<ExportPage>(response);
        },
        setProgress,
      );
      if (controller.signal.aborted) return;

      setPlannedCount(movies.length);
      setPhase("building");
      const { createWorkbook } = await import("@/lib/movie-export-workbook");
      const buffer = await createWorkbook(year, movies);
      if (controller.signal.aborted) return;
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `tmdb-${year}-movies-ko-runtime-${MIN_RUNTIME_MINUTES}m-${movies.length}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      if (!controller.signal.aborted) {
        setError(downloadError instanceof Error ? downloadError.message : "엑셀 파일을 만들지 못했습니다.");
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setPhase("idle");
      }
    }
  };

  const cancelDownload = () => controllerRef.current?.abort();
  const progressPercent = progress && progress.totalPages > 0
    ? Math.round((progress.completedPages / progress.totalPages) * 100)
    : 0;
  const statusText = phase === "planning"
    ? "월별 영화 수를 확인하고 있습니다..."
    : phase === "collecting" && progress
      ? `${progressPercent}% · ${progress.scannedMovies.toLocaleString()} / ${progress.expectedMovies.toLocaleString()}편 확인 · ${progress.collectedMovies.toLocaleString()}편 포함 · ${progress.excludedMovies.toLocaleString()}편 제외`
      : phase === "building"
        ? `${plannedCount.toLocaleString()}편을 엑셀 파일로 만드는 중...`
        : "";

  return (
    <section className="mx-auto max-w-3xl py-8 sm:py-16">
      <div className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">TMDB Export</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">영화 엑셀 다운로드</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          연도를 선택하면 투표가 {MIN_VOTE_COUNT}개 이상이고 상영시간이 {MIN_RUNTIME_MINUTES}분 이상인 영화를 모두 수집합니다.
          제작 국가·제작사, 감독, 전체 출연진도 포함되며, 제목 형태로는 제외하지 않습니다.
        </p>

        <div className="mt-10 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900/80 sm:flex sm:items-end sm:gap-4">
          <label className="block w-full sm:min-w-[18rem] sm:flex-1">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">개봉 연도</span>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              disabled={isRunning}
              className="h-14 w-full appearance-auto rounded-xl border border-slate-200 bg-white px-5 text-lg font-bold text-slate-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-amber-900/30"
              aria-label="개봉 연도"
            >
              {availableYears.map((optionYear) => <option key={optionYear} value={optionYear}>{optionYear}년</option>)}
            </select>
          </label>
          {isRunning ? (
            <button type="button" onClick={cancelDownload} className="mt-4 inline-flex h-14 w-full shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white px-7 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:mt-0 sm:w-auto">취소</button>
          ) : (
            <button type="button" onClick={downloadExcel} className="mt-4 inline-flex h-14 w-full shrink-0 items-center justify-center rounded-xl bg-slate-950 px-7 text-sm font-semibold text-white transition hover:bg-amber-600 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 sm:mt-0 sm:w-auto">전체 엑셀 다운로드</button>
          )}
        </div>

        {isRunning ? (
          <div className="mt-5" role="status" aria-live="polite">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-amber-500 transition-[width]" style={{ width: `${phase === "building" ? 100 : progressPercent}%` }} />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{statusText}</p>
            {progress ? <p className="mt-1 text-xs text-slate-500">{progress.window.from} ~ {progress.window.to} · {progress.page}페이지</p> : null}
          </div>
        ) : null}
        {error ? <p role="alert" className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">{error}</p> : null}

        <p className="mt-6 text-xs leading-5 text-slate-500 dark:text-slate-400">
          전체 배우 정보까지 조회하므로 수천 편은 몇 분 이상 걸릴 수 있습니다. 완료될 때까지 이 페이지를 닫지 마세요.
        </p>
        <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/70 p-4 dark:border-slate-800"><strong className="block text-slate-950 dark:text-white">전체 영화</strong>TOP 제한 없음</div>
          <div className="rounded-xl border border-slate-200/70 p-4 dark:border-slate-800"><strong className="block text-slate-950 dark:text-white">40분 이상</strong>단편·미등록 제외</div>
          <div className="rounded-xl border border-slate-200/70 p-4 dark:border-slate-800"><strong className="block text-slate-950 dark:text-white">상세 항목</strong>제작진·전체 배우</div>
        </div>
      </div>
    </section>
  );
}

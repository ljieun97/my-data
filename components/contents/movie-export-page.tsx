"use client";

import { useMemo, useRef, useState } from "react";
import {
  GLOBAL_MIN_VOTE_COUNT, KOREAN_MAX_VOTE_COUNT, KOREAN_MIN_VOTE_COUNT,
  MIN_RUNTIME_MINUTES, collectExportMovies, createSelectedReviewsClipboardText, planExportWindows,
  type DateWindow, type ExportMovie, type ExportPage, type ExportPlanItem, type ExportProgress, type ExportQuery, type ExportSummary,
} from "@/lib/movie-export";

const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: currentYear + 2 - 1888 + 1 }, (_, index) => currentYear + 2 - index);
type Phase = "idle" | "planning" | "collecting" | "building";
type DownloadMode = "with-header" | "without-header";

async function readApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "영화 정보를 조회하지 못했습니다.");
  return data as T;
}

export default function MovieExportPage() {
  const [year, setYear] = useState(currentYear);
  const [downloadMode, setDownloadMode] = useState<DownloadMode>("with-header");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [movies, setMovies] = useState<ExportMovie[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const isRunning = phase !== "idle";

  const filteredMovies = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("ko-KR");
    if (!keyword) return movies;
    return movies.filter((movie) => [movie.title, movie.original_title, movie.directors, movie.id]
      .some((value) => String(value ?? "").toLocaleLowerCase("ko-KR").includes(keyword)));
  }, [movies, search]);

  const loadMovies = async () => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setPhase("planning");
    setProgress(null);
    setMovies([]);
    setSelectedIds(new Set());
    setSearch("");
    setError("");
    setCopyMessage("");
    const query = (window: DateWindow, exportQuery: ExportQuery, extra: Record<string, string>) => {
      const params = new URLSearchParams({ year: String(year), from: window.from, to: window.to, query: exportQuery, ...extra });
      return `/api/movie-export?${params}`;
    };

    try {
      const buildPlan = async (exportQuery: ExportQuery): Promise<ExportPlanItem[]> => {
        const windows = await planExportWindows(year, async (window) => {
          const response = await fetch(query(window, exportQuery, { mode: "summary" }), { signal: controller.signal });
          return readApiResponse<ExportSummary>(response);
        });
        return windows.map((window) => ({ ...window, query: exportQuery }));
      };
      const [globalPlan, koreanLowVotePlan] = await Promise.all([
        buildPlan("global"), buildPlan("korean-low-vote"),
      ]);
      const plan = [...globalPlan, ...koreanLowVotePlan];
      const expected = plan.reduce((sum, window) => sum + window.totalResults, 0);
      if (expected === 0) throw new Error(`${year}년 조건에 맞는 영화가 없습니다.`);

      setPhase("collecting");
      const result = await collectExportMovies(
        plan,
        async (window, page) => {
          const response = await fetch(query(window, window.query, { page: String(page) }), { signal: controller.signal });
          return readApiResponse<ExportPage>(response);
        },
        setProgress,
      );
      if (controller.signal.aborted) return;
      setMovies(result);
    } catch (loadError) {
      if (!controller.signal.aborted) {
        setError(loadError instanceof Error ? loadError.message : "영화 목록을 불러오지 못했습니다.");
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setPhase("idle");
      }
    }
  };

  const downloadSelected = async () => {
    const selectedMovies = movies.filter((movie) => selectedIds.has(movie.id));
    if (selectedMovies.length === 0) {
      setError("감상한 영화를 한 편 이상 선택해 주세요.");
      return;
    }
    setError("");
    setPhase("building");
    try {
      const { createSelectedReviewsWorkbook } = await import("@/lib/movie-export-workbook");
      const includeHeader = downloadMode === "with-header";
      const buffer = await createSelectedReviewsWorkbook(year, selectedMovies, includeHeader);
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `tmdb-${year}-watched-${selectedMovies.length}${includeHeader ? "-with-header" : "-no-header"}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "엑셀 파일을 만들지 못했습니다.");
    } finally {
      setPhase("idle");
    }
  };

  const copySelected = async () => {
    const selectedMovies = movies.filter((movie) => selectedIds.has(movie.id));
    if (selectedMovies.length === 0) {
      setError("감상한 영화를 한 편 이상 선택해 주세요.");
      return;
    }
    try {
      await navigator.clipboard.writeText(createSelectedReviewsClipboardText(selectedMovies));
      setError("");
      setCopyMessage(`${selectedMovies.length.toLocaleString()}편의 감상기록 행을 복사했습니다. 감상기록 표 바로 아래 첫 빈 행의 TMDB ID 셀에 붙여넣으세요.`);
    } catch {
      setCopyMessage("");
      setError("클립보드에 복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.");
    }
  };

  const toggleMovie = (movieId: number) => {
    setCopyMessage("");
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(movieId)) next.delete(movieId);
      else next.add(movieId);
      return next;
    });
  };
  const allFilteredSelected = filteredMovies.length > 0 && filteredMovies.every((movie) => selectedIds.has(movie.id));
  const toggleFiltered = () => {
    setCopyMessage("");
    setSelectedIds((current) => {
      const next = new Set(current);
      filteredMovies.forEach((movie) => {
        if (allFilteredSelected) next.delete(movie.id);
        else next.add(movie.id);
      });
      return next;
    });
  };

  const cancelDownload = () => controllerRef.current?.abort();
  const progressPercent = progress && progress.totalPages > 0
    ? Math.min(100, Math.round((progress.completedPages / progress.totalPages) * 100))
    : 0;
  const statusText = phase === "planning"
    ? "선택한 연도의 영화 수를 확인하고 있습니다..."
    : phase === "collecting" && progress
      ? `${progressPercent}% · ${progress.scannedMovies.toLocaleString()} / ${progress.expectedMovies.toLocaleString()}편 확인 · ${progress.collectedMovies.toLocaleString()}편 포함 · ${progress.excludedMovies.toLocaleString()}편 제외`
      : phase === "building"
        ? `${selectedIds.size.toLocaleString()}편을 감상기록 파일로 만드는 중...`
        : "";

  return (
    <section className="mx-auto max-w-4xl py-8 sm:py-16">
      <div className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">TMDB Export</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">감상 영화 선택 · 엑셀 다운로드</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          연도를 조회하고 감상한 영화를 화면에서 선택하세요. 선택한 영화는 TMDB ID가 고정된 감상기록 행으로 저장되며, 파일끼리 직접 합칠 수 있습니다.
        </p>

        <div className="mt-10 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900/80 sm:flex sm:items-end sm:gap-4">
          <label className="block w-full sm:min-w-[18rem] sm:flex-1">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">개봉 연도</span>
            <select
              value={year}
              onChange={(event) => {
                setYear(Number(event.target.value));
                setMovies([]);
                setSelectedIds(new Set());
              }}
              disabled={isRunning}
              className="h-14 w-full appearance-auto rounded-xl border border-slate-200 bg-white px-5 text-lg font-bold text-slate-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-amber-900/30"
              aria-label="개봉 연도"
            >
              {availableYears.map((optionYear) => <option key={optionYear} value={optionYear}>{optionYear}년</option>)}
            </select>
          </label>
          {phase === "planning" || phase === "collecting" ? (
            <button type="button" onClick={cancelDownload} className="mt-4 inline-flex h-11 w-full shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:mt-0 sm:w-auto">조회 취소</button>
          ) : (
            <button type="button" onClick={loadMovies} disabled={isRunning} className="mt-4 inline-flex h-11 w-full shrink-0 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 sm:mt-0 sm:w-auto">영화 조회</button>
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
        {copyMessage ? <p role="status" className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">{copyMessage}</p> : null}

        {movies.length > 0 ? (
          <div className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block flex-1">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">영화 검색</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="제목, 원제, 감독, TMDB ID"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-amber-900/30"
                />
              </label>
              <button type="button" onClick={toggleFiltered} className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                {allFilteredSelected ? "검색 결과 선택 해제" : "검색 결과 전체 선택"}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="font-semibold text-slate-950 dark:text-white">전체 {movies.length.toLocaleString()}편 · 선택 {selectedIds.size.toLocaleString()}편</p>
              <p className="text-slate-500">검색 결과 {filteredMovies.length.toLocaleString()}편</p>
            </div>
            <div className="mt-3 max-h-[34rem] overflow-y-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              {filteredMovies.map((movie) => (
                <label key={movie.id} className="flex cursor-pointer gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-amber-50/60 dark:border-slate-800 dark:hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(movie.id)}
                    onChange={() => toggleMovie(movie.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-amber-500"
                  />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-slate-950 dark:text-white">{movie.title || movie.original_title || `TMDB ${movie.id}`}</strong>
                    <span className="mt-1 block truncate text-xs text-slate-500">{movie.original_title} · {movie.release_date || "개봉일 미정"} · {movie.directors}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">TMDB {movie.id}</span>
                </label>
              ))}
              {filteredMovies.length === 0 ? <p className="px-4 py-10 text-center text-sm text-slate-500">검색 결과가 없습니다.</p> : null}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900/80 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end sm:gap-4">
              <label className="block w-full">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">다운로드 형식</span>
                <select
                  value={downloadMode}
                  onChange={(event) => setDownloadMode(event.target.value as DownloadMode)}
                  disabled={isRunning}
                  className="h-14 w-full appearance-auto rounded-xl border border-slate-200 bg-white px-5 text-base font-bold text-slate-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-amber-900/30"
                  aria-label="다운로드 형식"
                >
                  <option value="with-header">헤더 포함</option>
                  <option value="without-header">헤더 없음 · 붙여넣기용</option>
                </select>
              </label>
              <button type="button" onClick={copySelected} disabled={isRunning || selectedIds.size === 0} className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:mt-0 sm:w-auto">선택 행 복사</button>
              <button type="button" onClick={downloadSelected} disabled={isRunning || selectedIds.size === 0} className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 sm:mt-0 sm:w-auto">선택한 {selectedIds.size.toLocaleString()}편 다운로드</button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
              헤더 포함 파일에는 자동 통계 시트가 있습니다. `선택 행 복사` 후 감상기록 표 바로 아래 첫 빈 행의 TMDB ID 셀에 붙여넣으면 표가 확장되어 통계도 갱신됩니다.
            </p>
          </div>
        ) : (
          <p className="mt-6 text-xs leading-5 text-slate-500 dark:text-slate-400">
            전체 영화는 투표가 {GLOBAL_MIN_VOTE_COUNT}개 이상, 한국 영화는 {KOREAN_MIN_VOTE_COUNT}~{KOREAN_MAX_VOTE_COUNT}표이며 상영시간 {MIN_RUNTIME_MINUTES}분 이상인 항목을 조회합니다.
          </p>
        )}
      </div>
    </section>
  );
}

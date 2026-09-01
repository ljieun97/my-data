export const MIN_VOTE_COUNT = 11;
export const MIN_RUNTIME_MINUTES = 40;
export const TMDB_MAX_PAGE = 500;

export type TmdbMovie = {
  id: number;
  title?: string;
  original_title?: string;
  release_date?: string;
  genre_ids?: number[];
  original_language?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  overview?: string;
  poster_path?: string | null;
};

export type ExportMovie = TmdbMovie & {
  rank: number;
  runtime: number;
  genres: string;
  countries: string;
  companies: string;
  directors: string;
  actors: string;
};

export type DateWindow = { from: string; to: string };
export type ExportSummary = DateWindow & { totalPages: number; totalResults: number };
export type ExportPage = ExportSummary & {
  page: number;
  movies: ExportMovie[];
  scannedIds: number[];
  excludedIds: number[];
};
export type ExportProgress = {
  completedPages: number;
  totalPages: number;
  scannedMovies: number;
  expectedMovies: number;
  collectedMovies: number;
  excludedMovies: number;
  window: DateWindow;
  page: number;
};

export function getYearWindows(year: number): DateWindow[] {
  return [{ from: `${year}-01-01`, to: `${year}-12-31` }];
}

export function validateYear(value: unknown, currentYear = new Date().getFullYear()): number | null {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1888 && year <= currentYear + 2 ? year : null;
}

export function isWindowInYear(window: DateWindow, year: number): boolean {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(window.from) || !pattern.test(window.to)) return false;
  const from = new Date(`${window.from}T00:00:00Z`);
  const to = new Date(`${window.to}T00:00:00Z`);
  return Number.isFinite(from.getTime()) && Number.isFinite(to.getTime())
    && from.getUTCFullYear() === year && to.getUTCFullYear() === year
    && from <= to && from.toISOString().slice(0, 10) === window.from
    && to.toISOString().slice(0, 10) === window.to;
}

function splitWindow(window: DateWindow): [DateWindow, DateWindow] {
  const fromMs = Date.parse(`${window.from}T00:00:00Z`);
  const toMs = Date.parse(`${window.to}T00:00:00Z`);
  if (fromMs === toMs) throw new Error(`${window.from} 하루의 조회 결과가 TMDB 페이지 한도를 초과했습니다.`);
  const days = Math.floor((toMs - fromMs) / 86400000);
  const midpoint = fromMs + Math.floor(days / 2) * 86400000;
  return [
    { from: window.from, to: new Date(midpoint).toISOString().slice(0, 10) },
    { from: new Date(midpoint + 86400000).toISOString().slice(0, 10), to: window.to },
  ];
}

function assertSummary(summary: ExportSummary, expected: DateWindow) {
  if (summary.from !== expected.from || summary.to !== expected.to
    || !Number.isInteger(summary.totalPages) || summary.totalPages < 0
    || !Number.isInteger(summary.totalResults) || summary.totalResults < 0) {
    throw new Error("TMDB 조회 범위 또는 집계 응답이 올바르지 않습니다.");
  }
}

export async function planExportWindows(
  year: number,
  requestSummary: (window: DateWindow) => Promise<ExportSummary>,
): Promise<ExportSummary[]> {
  const queue = [...getYearWindows(year)];
  const planned: ExportSummary[] = [];
  while (queue.length > 0) {
    const window = queue.shift()!;
    const summary = await requestSummary(window);
    assertSummary(summary, window);
    if (summary.totalPages > TMDB_MAX_PAGE) {
      queue.unshift(...splitWindow(window));
    } else if (summary.totalResults > 0) {
      planned.push(summary);
    }
  }
  return planned.sort((a, b) => a.from.localeCompare(b.from));
}

export async function collectExportMovies(
  plan: ExportSummary[],
  requestPage: (window: DateWindow, page: number) => Promise<ExportPage>,
  onProgress?: (progress: ExportProgress) => void,
): Promise<ExportMovie[]> {
  const pagesByWindow = plan.map((window) => window.totalPages);
  let totalPages = pagesByWindow.reduce((sum, pages) => sum + pages, 0);
  const expectedByWindow = plan.map((window) => window.totalResults);
  let expectedMovies = expectedByWindow.reduce((sum, count) => sum + count, 0);
  let totalsChanged = false;
  const scannedIds = new Set<number>();
  const excludedIds = new Set<number>();
  const collected = new Map<number, ExportMovie>();
  let completedPages = 0;

  for (const [index, window] of plan.entries()) {
    for (let page = 1; page <= pagesByWindow[index]; page++) {
      const result = await requestPage(window, page);
      if (result.from !== window.from || result.to !== window.to || result.page !== page
        || !Number.isInteger(result.totalPages) || result.totalPages < 0 || result.totalPages > TMDB_MAX_PAGE
        || !Number.isInteger(result.totalResults) || result.totalResults < 0
        || !Array.isArray(result.movies) || !Array.isArray(result.scannedIds) || !Array.isArray(result.excludedIds)) {
        throw new Error("TMDB 조회 응답이 올바르지 않습니다. 잠시 후 다시 시도해 주세요.");
      }
      if (result.totalPages !== pagesByWindow[index] || result.totalResults !== expectedByWindow[index]) {
        totalsChanged = true;
        totalPages += result.totalPages - pagesByWindow[index];
        expectedMovies += result.totalResults - expectedByWindow[index];
        pagesByWindow[index] = result.totalPages;
        expectedByWindow[index] = result.totalResults;
      }
      const pageIds = new Set<number>();
      for (const id of result.scannedIds) {
        if (!Number.isInteger(id) || pageIds.has(id)) {
          throw new Error("한 페이지 안에 중복되거나 잘못된 영화가 감지되었습니다.");
        }
        pageIds.add(id);
        scannedIds.add(id);
      }
      const accountedOnPage = new Set<number>();
      for (const movie of result.movies) {
        if (movie.runtime < MIN_RUNTIME_MINUTES
          || (movie.vote_count ?? 0) < MIN_VOTE_COUNT
          || !movie.overview?.trim()
          || !movie.directors.trim()) {
          throw new Error("내보내기 조건에 맞지 않는 영화가 포함되었습니다.");
        }
        if (accountedOnPage.has(movie.id)) throw new Error("상세 확인 결과에 중복 영화가 있습니다.");
        collected.set(movie.id, movie);
        excludedIds.delete(movie.id);
        accountedOnPage.add(movie.id);
      }
      for (const id of result.excludedIds) {
        if (!Number.isInteger(id) || accountedOnPage.has(id)) {
          throw new Error("제외 항목이 중복되거나 올바르지 않습니다.");
        }
        if (!collected.has(id)) excludedIds.add(id);
        accountedOnPage.add(id);
      }
      if (accountedOnPage.size !== result.scannedIds.length
        || result.scannedIds.some((id) => !accountedOnPage.has(id))) {
        throw new Error("상세 확인 결과가 조회 목록과 일치하지 않습니다.");
      }
      completedPages++;
      onProgress?.({
        completedPages, totalPages, scannedMovies: scannedIds.size, expectedMovies,
        collectedMovies: collected.size, excludedMovies: excludedIds.size, window, page,
      });
    }
  }

  if ((!totalsChanged && scannedIds.size !== expectedMovies)
    || collected.size + excludedIds.size !== scannedIds.size) {
    throw new Error(`예상 ${expectedMovies.toLocaleString()}편 중 ${collected.size.toLocaleString()}편만 검증되어 파일을 만들지 않았습니다.`);
  }

  return [...collected.values()].map((movie, index) => ({ ...movie, rank: index + 1 }));
}

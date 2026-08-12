"use client";

import { CaptureMovie } from "@/context/CaptureContentContext";
import { CaptureHelperText, CapturePanel } from "@/components/contents/capture/content-capture-controls";
import type { MovieListMetaMode } from "@/components/contents/capture/content-capture-templates";
import { formatYear } from "@/components/contents/capture/content-capture-utils";
import { CAPTURE_TEXT } from "@/lib/capture-defaults";

function formatMovieListReleaseText(movie?: CaptureMovie) {
  const releaseDate = movie?.release_date?.trim() ?? "";
  const [, month, day] = releaseDate.match(/^\d{4}-(\d{2})-(\d{2})$/) ?? [];
  if (!month || !day) return releaseDate;
  return `${Number(month)}/${Number(day)} 개봉`;
}

function formatMovieListYearMetaText(movie?: CaptureMovie, baseYear?: string) {
  const releaseDate = movie?.release_date ?? "";
  const [, year] = releaseDate.match(/^(\d{4})-\d{2}-\d{2}$/) ?? [];
  if (!year) return releaseDate;
  const birthYear = Number(baseYear);
  const age = Number(year) - birthYear;
  const ageText = /^\d{4}$/.test(baseYear ?? "") && age >= 0 ? `${age}세 ` : "";
  return `${year} · ${ageText}`;
}

function formatReleaseBoardDateText(movie?: CaptureMovie) {
  const releaseDate = movie?.release_date?.trim() ?? "";
  const [, month, day] = releaseDate.match(/^\d{4}-(\d{2})-(\d{2})$/) ?? [];
  if (!month || !day) return movie?.release_date ?? "";
  return `${Number(month)}/${Number(day)}`;
}

type MovieSlotsPanelProps = {
  isRankingMode: boolean;
  isMovieListMode: boolean;
  isMovieListCaptureMode?: boolean;
  isRankingV2Mode?: boolean;
  isReleaseMode?: boolean;
  movieListMetaMode?: MovieListMetaMode;
  movieListBaseYear?: string;
  showRankingTotalAudience?: boolean;
  showImagePositionControls?: boolean;
  rankingCoverMovieId?: number | null;
  rankingCoverMovieIds?: number[];
  selectedMoviesCount: number;
  movieSlotCount: number;
  movies: Array<CaptureMovie | undefined>;
  dragOverIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragLeave: (index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
  removeMovie: (id: number) => void;
  updateMovieTitle: (id: number, title: string) => void;
  updateMovieRankingText: (id: number, value: string) => void;
  updateMovieRankingDailyAudience: (id: number, value: string) => void;
  updateMovieRankingDailyAudienceUnit: (id: number, value: string) => void;
  updateMovieRankingTotalAudience: (id: number, value: string) => void;
  updateMovieReleaseBadge: (id: number, value: boolean) => void;
  updateMovieYear: (id: number, year: string) => void;
  updateMovieImagePosition: (id: number, imagePosition: number) => void;
  updateMovieLogo?: (id: number, logoPath: string | null) => void;
  onSelectRankingCoverMovie?: (id: number) => void;
};

export function MovieSlotsPanel({
  isRankingMode,
  isMovieListMode,
  isMovieListCaptureMode = false,
  isRankingV2Mode = false,
  isReleaseMode = false,
  movieListMetaMode = "year",
  movieListBaseYear = "",
  showRankingTotalAudience = false,
  showImagePositionControls = false,
  rankingCoverMovieId,
  rankingCoverMovieIds,
  selectedMoviesCount,
  movieSlotCount,
  movies,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  removeMovie,
  updateMovieTitle,
  updateMovieRankingText,
  updateMovieRankingDailyAudience,
  updateMovieRankingDailyAudienceUnit,
  updateMovieRankingTotalAudience,
  updateMovieReleaseBadge,
  updateMovieYear,
  updateMovieImagePosition,
  updateMovieLogo,
  onSelectRankingCoverMovie,
}: MovieSlotsPanelProps) {
  const activeRankingCoverMovieIds = rankingCoverMovieIds ?? (rankingCoverMovieId ? [rankingCoverMovieId] : []);
  const defaultRankingDailyAudienceUnit = isRankingV2Mode ? "만명" : "명";

  return (
    <CapturePanel>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Movies</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedMoviesCount}/{movieSlotCount}</p>
      </div>
      <CaptureHelperText className="mb-3 font-semibold">
        {CAPTURE_TEXT.slotsAutoFill}
      </CaptureHelperText>

      <div className="flex flex-col gap-2">
        {movies.map((movie, index) => (
          <div
            key={movie ? `${movie.media_type ?? "movie"}-${movie.id}-${index}` : `slot-${index}`}
            draggable={Boolean(movie)}
            onDragStart={(event) => {
              if (!movie) return;
              onDragStart(index);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", String(movie.id));
            }}
            onDragOver={(event) => {
              if (!movie) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              onDragOver(index);
            }}
            onDragLeave={() => onDragLeave(index)}
            onDrop={(event) => {
              event.preventDefault();
              if (!movie) return;
              onDrop(index);
            }}
            onDragEnd={onDragEnd}
            className={[
              "flex min-h-14 items-center gap-2 border bg-white px-2.5 py-2 transition dark:bg-slate-900/60 sm:px-3",
              movie ? "cursor-grab active:cursor-grabbing" : "",
              dragOverIndex === index
                ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-slate-100 dark:ring-slate-100/20"
                : "border-slate-200 dark:border-slate-800",
            ].join(" ")}
          >
            <span className="inline-flex h-8 w-5 shrink-0 items-center justify-center text-[10px] font-bold text-slate-300 dark:text-slate-600">
              {movie ? "drag" : null}
            </span>
            <span className="w-5 shrink-0 text-xs font-bold text-slate-400 sm:w-6">{index + 1}</span>
            <div className="min-w-0 flex-1">
              {movie && isMovieListMode ? (
                <div className="mt-1 flex flex-col gap-1.5">
                  {isRankingMode ? (
                    <input
                      value={movie.rankingText ?? ""}
                      onChange={(event) => updateMovieRankingText(movie.id, event.target.value)}
                      onMouseDown={(event) => event.stopPropagation()}
                      onDragStart={(event) => event.preventDefault()}
                      maxLength={8}
                      placeholder={String(index + 1)}
                      className="h-7 w-full border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                    />
                  ) : null}
                  <input
                    value={movie.title}
                    onChange={(event) => updateMovieTitle(movie.id, event.target.value)}
                    onMouseDown={(event) => event.stopPropagation()}
                    onDragStart={(event) => event.preventDefault()}
                    placeholder={CAPTURE_TEXT.titlePlaceholder}
                    className="h-7 w-full border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                  {isRankingMode ? (
                    <div className="grid grid-cols-[minmax(0,1fr)_4rem] gap-1">
                      <input
                        value={movie.rankingDailyAudience ?? "1,000"}
                        onChange={(event) => updateMovieRankingDailyAudience(movie.id, event.target.value)}
                        onMouseDown={(event) => event.stopPropagation()}
                        onDragStart={(event) => event.preventDefault()}
                        maxLength={16}
                        placeholder="1,000"
                        className="h-7 w-full border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                      />
                      <input
                        value={movie.rankingDailyAudienceUnit ?? defaultRankingDailyAudienceUnit}
                        onChange={(event) => updateMovieRankingDailyAudienceUnit(movie.id, event.target.value)}
                        onMouseDown={(event) => event.stopPropagation()}
                        onDragStart={(event) => event.preventDefault()}
                        maxLength={8}
                        placeholder={defaultRankingDailyAudienceUnit}
                        className="h-7 border border-slate-200 bg-slate-50 px-1 text-xs font-semibold text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                      />
                    </div>
                  ) : (
                    <input
                      value={
                        isReleaseMode
                          ? formatReleaseBoardDateText(movie)
                          : isMovieListCaptureMode && movieListMetaMode === "release-date"
                          ? formatMovieListReleaseText(movie)
                          : isMovieListCaptureMode
                          ? formatMovieListYearMetaText(movie, movieListBaseYear)
                          : movie.release_date
                          ? formatYear(movie)
                          : ""
                      }
                      onChange={(event) => updateMovieYear(movie.id, event.target.value)}
                      onMouseDown={(event) => event.stopPropagation()}
                      onDragStart={(event) => event.preventDefault()}
                      maxLength={24}
                      placeholder={isReleaseMode ? "7/15" : movieListMetaMode === "release-date" ? "7/15 개봉" : isMovieListCaptureMode ? "연도 ·" : "연도"}
                      className="h-7 w-full border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                    />
                  )}
                  {isRankingMode && showRankingTotalAudience ? (
                    <input
                      value={movie.rankingTotalAudience ?? ""}
                      onChange={(event) => updateMovieRankingTotalAudience(movie.id, event.target.value)}
                      onMouseDown={(event) => event.stopPropagation()}
                      onDragStart={(event) => event.preventDefault()}
                      maxLength={16}
                      placeholder="누적 관객"
                      className="h-7 w-full border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                    />
                  ) : null}
                  {isReleaseMode || isRankingV2Mode || isMovieListCaptureMode ? (
                    <>
                      {isReleaseMode ? (
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={() => updateMovieReleaseBadge(movie.id, true)}
                            className={[
                              "h-7 border px-2 text-[11px] font-bold transition",
                              movie.releaseBadge
                                ? "border-[#b58a45] bg-[#b58a45] text-white"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                            ].join(" ")}
                          >
                            재개봉
                          </button>
                          <button
                            type="button"
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={() => updateMovieReleaseBadge(movie.id, false)}
                            className={[
                              "h-7 border px-2 text-[11px] font-bold transition",
                              !movie.releaseBadge
                                ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                            ].join(" ")}
                          >
                            일반
                          </button>
                        </div>
                      ) : null}
                      {updateMovieLogo ? (
                        <div className="grid gap-1">
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Logo</span>
                          <div className="flex gap-1 overflow-x-auto pb-1">
                            <button
                              type="button"
                              onMouseDown={(event) => event.stopPropagation()}
                              onClick={() => updateMovieLogo(movie.id, null)}
                              className={[
                                "flex h-8 min-w-14 items-center justify-center border bg-white px-2 text-[11px] font-bold text-slate-700 transition dark:bg-slate-950 dark:text-slate-200",
                                movie.releaseLogoDisabled
                                  ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20"
                                  : "border-slate-200 dark:border-slate-700",
                              ].join(" ")}
                            >
                              제목
                            </button>
                            {(movie.logoOptions ?? []).map((logoPath) => (
                              <button
                                key={logoPath}
                                type="button"
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={() => updateMovieLogo(movie.id, logoPath)}
                                className={[
                                  "flex h-8 min-w-14 items-center justify-center border bg-slate-950 px-1 transition",
                                  !movie.releaseLogoDisabled && (movie.logo_path || movie.logoOptions?.[0]) === logoPath
                                    ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20"
                                    : "border-slate-200 dark:border-slate-700",
                                ].join(" ")}
                                aria-label="Select logo"
                              >
                                <img alt="" src={`https://image.tmdb.org/t/p/w185${logoPath}`} className="max-h-6 max-w-full object-contain" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                  {(!isRankingMode || showImagePositionControls) ? (
                    <div className="grid gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onMouseDown={(event) => event.stopPropagation()}
                          onClick={() => updateMovieImagePosition(movie.id, (movie.imagePosition ?? 20) - 5)}
                          className="inline-flex h-7 min-w-8 items-center justify-center border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                          -
                        </button>
                        <div className="flex h-7 min-w-0 flex-1 items-center justify-center border border-slate-200 bg-slate-50 px-2 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                          Y {(movie.imagePosition ?? 20)}%
                        </div>
                        <button
                          type="button"
                          onMouseDown={(event) => event.stopPropagation()}
                          onClick={() => updateMovieImagePosition(movie.id, (movie.imagePosition ?? 20) + 5)}
                          className="inline-flex h-7 min-w-8 items-center justify-center border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onMouseDown={(event) => event.stopPropagation()}
                          onClick={() => updateMovieImagePosition(movie.id, 20)}
                          className={[
                            "h-7 border px-2 text-[11px] font-bold transition",
                            (movie.imagePosition ?? 20) === 20
                              ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                          ].join(" ")}
                        >
                          기본
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{movie?.title ?? CAPTURE_TEXT.emptySlot}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {movie ? CAPTURE_TEXT.slotHelpSelected : CAPTURE_TEXT.slotHelpEmpty}
                  </p>
                </>
              )}
            </div>
            {movie ? (
              <div className="flex shrink-0 items-center gap-1">
                {isRankingMode ? (
                  <button
                    type="button"
                    onClick={() => onSelectRankingCoverMovie?.(movie.id)}
                    className={[
                      "inline-flex h-8 items-center justify-center border px-2 text-[11px] font-bold transition",
                      activeRankingCoverMovieIds.includes(movie.id)
                        ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                    ].join(" ")}
                  >
                    Cover
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeMovie(movie.id)}
                  className="inline-flex h-8 items-center justify-center px-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label={`${movie.title} remove`}
                  title="Remove"
                >
                  삭제
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </CapturePanel>
  );
}

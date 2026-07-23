"use client";

import { CaptureMovie } from "@/context/CaptureContentContext";
import { faGripVertical, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CaptureHelperText, CapturePanel } from "@/components/contents/capture/content-capture-controls";
import { formatYear } from "@/components/contents/capture/content-capture-utils";

type MovieSlotsPanelProps = {
  isRankingMode: boolean;
  isMovieListMode: boolean;
  showRankingTotalAudience?: boolean;
  showImagePositionControls?: boolean;
  rankingCoverMovieId?: number | null;
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
  updateMovieNote: (id: number, note: string) => void;
  updateMovieRankingText: (id: number, value: string) => void;
  updateMovieRankingTotalAudience: (id: number, value: string) => void;
  updateMovieYear: (id: number, year: string) => void;
  updateMovieImagePosition: (id: number, imagePosition: number) => void;
  onSelectRankingCoverMovie?: (id: number) => void;
};

export function MovieSlotsPanel({
  isRankingMode,
  isMovieListMode,
  showRankingTotalAudience = false,
  showImagePositionControls = false,
  rankingCoverMovieId,
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
  updateMovieNote,
  updateMovieRankingText,
  updateMovieRankingTotalAudience,
  updateMovieYear,
  updateMovieImagePosition,
  onSelectRankingCoverMovie,
}: MovieSlotsPanelProps) {
  const activeRankingCoverMovieId = rankingCoverMovieId;

  return (
    <CapturePanel>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Movies</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedMoviesCount}/{movieSlotCount}</p>
      </div>
      <CaptureHelperText className="mb-3 font-semibold">
        ?곹솕??異붽???留뚰겮 ?먮룞?쇰줈 ?덉씠?꾩썐???뺤옣?⑸땲??
      </CaptureHelperText>

      <div className="flex flex-col gap-2">
        {movies.map((movie, index) => (
          <div
            key={movie?.id ?? `slot-${index}`}
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
            <span className="inline-flex h-8 w-5 shrink-0 items-center justify-center text-slate-300 dark:text-slate-600">
              {movie ? <FontAwesomeIcon icon={faGripVertical} /> : null}
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
                    placeholder="?쒕ぉ"
                    className="h-7 w-full border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                  {!isRankingMode ? (
                    <input
                      value={movie.note ?? ""}
                      onChange={(event) => updateMovieNote(movie.id, event.target.value)}
                      onMouseDown={(event) => event.stopPropagation()}
                      onDragStart={(event) => event.preventDefault()}
                      maxLength={16}
                      placeholder="?ㅻⅨ履?臾멸뎄"
                      className="h-7 w-full border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                    />
                  ) : null}
                  <input
                    value={movie.release_date ? formatYear(movie) : ""}
                    onChange={(event) => updateMovieYear(movie.id, event.target.value)}
                    onMouseDown={(event) => event.stopPropagation()}
                    onDragStart={(event) => event.preventDefault()}
                    maxLength={16}
                    placeholder={isRankingMode ? "일일 관객" : "연도"}
                    className="h-7 w-full border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                  />
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
                  {(!isRankingMode || showImagePositionControls) ? (
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
                        湲곕낯
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{movie?.title ?? "鍮??щ’"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {movie ? "紐⑸줉??而ㅻ쾭?먯꽌???좏깮???대?吏媛 ?ъ슜?⑸땲??" : "?곷떒 寃?됱쑝濡??곹솕瑜?異붽??섏꽭??"}
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
                      activeRankingCoverMovieId === movie.id
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
                  className="inline-flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label={`${movie.title} remove`}
                  title="Remove"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </CapturePanel>
  );
}

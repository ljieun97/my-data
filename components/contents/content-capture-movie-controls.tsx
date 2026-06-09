"use client";

import { CaptureMovie } from "@/context/CaptureContentContext";
import { faGripVertical, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CaptureHelperText, CapturePanel } from "@/components/contents/content-capture-controls";

type MovieSlotsPanelProps = {
  isCalendarReleaseMode: boolean;
  isMovieListMode: boolean;
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
  updateMovieImagePosition: (id: number, imagePosition: "top" | "center" | "bottom") => void;
};

export function MovieSlotsPanel({
  isCalendarReleaseMode,
  isMovieListMode,
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
  updateMovieImagePosition,
}: MovieSlotsPanelProps) {
  return (
    <CapturePanel>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Movies</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedMoviesCount}/{movieSlotCount}</p>
      </div>
      <CaptureHelperText className="mb-3 font-semibold">
        {isCalendarReleaseMode
          ? "릴리즈보드는 최대 8개까지 추가되고 순서대로 반영됩니다."
          : "영화는 추가한 만큼 자동으로 레이아웃이 확장됩니다."}
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
                  <input
                    value={movie.title}
                    onChange={(event) => updateMovieTitle(movie.id, event.target.value)}
                    onMouseDown={(event) => event.stopPropagation()}
                    onDragStart={(event) => event.preventDefault()}
                    placeholder="제목"
                    className="h-7 w-full border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                  <input
                    value={movie.note ?? ""}
                    onChange={(event) => updateMovieNote(movie.id, event.target.value)}
                    onMouseDown={(event) => event.stopPropagation()}
                    onDragStart={(event) => event.preventDefault()}
                    maxLength={16}
                    placeholder="오른쪽 문구"
                    className="h-7 w-full border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { key: "top", label: "Top" },
                      { key: "center", label: "Center" },
                      { key: "bottom", label: "Bottom" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={() => updateMovieImagePosition(movie.id, item.key as "top" | "center" | "bottom")}
                        className={[
                          "h-7 border px-2 text-[11px] font-bold transition",
                          (movie.imagePosition ?? "center") === item.key
                            ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                        ].join(" ")}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{movie?.title ?? "빈 슬롯"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {movie ? "목록형 커버에서는 선택한 이미지가 사용됩니다." : "상단 검색으로 영화를 추가하세요."}
                  </p>
                </>
              )}
            </div>
            {movie ? (
              <div className="flex shrink-0 items-center gap-1">
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

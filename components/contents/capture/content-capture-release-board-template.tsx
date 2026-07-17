import { CaptureMovie } from "@/context/CaptureContentContext";
import {
  formatReleaseBoardDate,
  getBackdropUrl,
  getPosterUrl,
  getProviderLogoUrl,
  RELEASE_BOARD_DEFAULT_COLORS,
  titleFontStyle,
} from "@/components/contents/capture/content-capture-utils";

export function CalendarReleaseBoardTemplate({
  movies,
  title,
  titleSize,
  labelColors,
  dateLabels,
}: {
  movies: Array<CaptureMovie | undefined>;
  title: string;
  titleSize: number;
  labelColors: string[];
  dateLabels: string[];
}) {
  const visibleMovies = movies.slice(0, 8).filter(Boolean) as CaptureMovie[];
  const gridColsClass =
    visibleMovies.length <= 2 ? "grid-cols-2" : visibleMovies.length <= 6 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#221f2e] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.34),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_36%),linear-gradient(180deg,#7a3f52_0%,#4a364a_52%,#262b3d_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.18)_0.8px,transparent_0.8px)] [background-size:11px_11px]" />

      <div className="relative z-[1] flex h-full min-h-0 flex-col px-4 pb-1 pt-4">
        <div className="flex flex-col items-start -mx-4">
          <div className="flex items-end justify-start">
            <h1 style={{ ...titleFontStyle, fontSize: `${titleSize}px` }} className="inline-flex max-w-full items-center justify-center rounded-r-[1.1rem] rounded-l-none bg-slate-950/82 pb-1 pl-2 pr-4 pt-2 break-keep whitespace-pre-line text-left font-black leading-[0.94] tracking-[-0.09em] text-white">
              {title}
            </h1>
          </div>
        </div>

        <div className={["mt-2.5 grid min-h-0 flex-1 gap-2", gridColsClass].join(" ")}>
          {visibleMovies.map((movie, index) => {
            const posterUrl = getPosterUrl(movie) || getBackdropUrl(movie);

            return (
              <div key={`${movie?.id ?? "empty"}-${index}`} className="flex min-h-0 flex-col overflow-hidden rounded-[0.95rem] bg-white/6 shadow-[0_10px_20px_rgba(0,0,0,0.22)]">
                <div
                  className="px-2 py-0.5 text-center"
                  style={{ backgroundColor: labelColors[index] || RELEASE_BOARD_DEFAULT_COLORS[index] || "#1f2937" }}
                >
                  <p style={titleFontStyle} className="mt-px text-[11px] font-normal tracking-[0.02em] text-white">{formatReleaseBoardDate(dateLabels[index] || "") || `SLOT ${index + 1}`}</p>
                </div>
                <div className="relative min-h-0 flex-1 bg-white">
                  {posterUrl ? (
                    <img alt="" src={posterUrl} className="h-full w-full object-cover" crossOrigin="anonymous" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/90 text-center text-[12px] font-bold tracking-[0.08em] text-slate-400">
                      ADD MOVIE
                    </div>
                  )}
                  {movie?.providerLogoPath ? (
                    <div className="absolute right-2 top-2 rounded-[0.45rem] bg-white/92 p-0.5 shadow-[0_6px_18px_rgba(15,23,42,0.18)]">
                      <img
                        alt={movie.providerLogoName || "Provider logo"}
                        src={getProviderLogoUrl(movie.providerLogoPath)}
                        className="h-7 w-7 rounded-[0.45rem] object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="pt-0.5 text-center">
          <span className="text-[10px] font-semibold tracking-[0.01em] text-white/92">35Film</span>
        </div>
      </div>
    </div>
  );
}


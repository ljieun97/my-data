import { CaptureMovie, sanitizeSinglePreviewSubbody } from "@/context/CaptureContentContext";
import {
  buildImageCandidates,
  CaptureFooter,
  CaptureV2Header,
  getBackdropUrl,
  getPosterUrl,
  getTextOverlayClass,
  handleImageFallback,
  titleFontStyle,
} from "@/components/contents/capture/content-capture-utils";
import { CAPTURE_TEXT } from "@/lib/capture-defaults";
import type { CSSProperties } from "react";

export type MovieListMetaMode = "year" | "release-date";

const rankingNumberStyle: CSSProperties = {
  fontFamily: '"Helvetica Neue", Arial, sans-serif',
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "0",
  lineHeight: 1,
};

function hexToRgba(hexColor: string, alpha: number, fallback: string) {
  const hex = hexColor.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return fallback;

  const [r, g, b] = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

function getMovieListMetaLabel(movie: CaptureMovie | undefined, mode: MovieListMetaMode) {
  const releaseDate = movie?.release_date?.trim();
  if (!releaseDate) return "";

  if (mode === "release-date") {
    const [, , month, day] = releaseDate.match(/^(\d{4})-(\d{2})-(\d{2})$/) ?? [];
    if (!month || !day) return releaseDate;
    return `${Number(month)}/${Number(day)} 개봉`;
  }

  const yearMatch = releaseDate.match(/^(\d{4})/);
  return yearMatch?.[1] ?? releaseDate;
}

function getMovieListSubbodyLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      if (/^감독\s*[:|]/.test(line)) {
        return [];
      }

      if (/^출연\s*[:|]/.test(line)) {
        return [];
      }

      return [line.replace(/\s*\/\s*/g, "/")];
    });
}

export function ReleaseBoardTemplate({
  movies,
  title,
  titleSize,
  footerRight,
}: {
  movies: Array<CaptureMovie | undefined>;
  title: string;
  titleSize: number;
  footerRight: string;
}) {
  const visibleMovies = movies.slice(0, 24).filter(Boolean) as CaptureMovie[];
  const columnCount = visibleMovies.length <= 4 ? 2 : visibleMovies.length <= 12 ? 3 : 4;
  const isDense = visibleMovies.length > 12;
  const isVeryDense = visibleMovies.length > 18;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#221f2e] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.34),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_36%),linear-gradient(180deg,#7a3f52_0%,#4a364a_52%,#262b3d_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.18)_0.8px,transparent_0.8px)] [background-size:11px_11px]" />

      <div className="relative z-[1] flex h-full min-h-0 flex-col px-4 pb-2 pt-4">
        <CaptureV2Header title={title} titleSize={titleSize} />

        <div
          className={[
            "relative mt-2 grid min-h-0 flex-1 auto-rows-fr overflow-hidden px-0.5 pb-0 pt-1.5",
            isDense ? "gap-1" : "gap-2",
          ].join(" ")}
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        >
          {visibleMovies.map((movie, index) => {
            const posterUrl = getPosterUrl(movie) || getBackdropUrl(movie);

            return (
              <div
                key={`${movie.id}-${index}`}
                className={[
                  "flex min-h-0 flex-col overflow-hidden bg-white/6 shadow-[0_10px_20px_rgba(0,0,0,0.22)]",
                  isDense ? "rounded-[0.55rem]" : "rounded-[0.95rem]",
                ].join(" ")}
              >
                <div className="relative min-h-0 flex-1 bg-white">
                  {posterUrl ? (
                    <>
                      <img alt="" src={posterUrl} className="h-full w-full object-cover" crossOrigin="anonymous" />
                      <div className={["absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.66)_64%,rgba(0,0,0,0.86)_100%)]", isDense ? "px-1 pb-1 pt-4" : "px-1.5 pb-1.5 pt-5"].join(" ")}>
                        <p
                          style={titleFontStyle}
                          className={[
                            "line-clamp-2 break-keep text-center font-medium leading-[1.18] tracking-[-0.04em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.72)]",
                            isVeryDense ? "text-[7px]" : isDense ? "text-[8px]" : "text-[9px]",
                          ].join(" ")}
                        >
                          {movie.title}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/90 text-center text-[12px] font-bold tracking-[0.08em] text-slate-400">
                      ADD MOVIE
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="pt-0 text-center">
          <span className="text-[10px] font-semibold tracking-[0.03em] text-white/45">{footerRight || CAPTURE_TEXT.footerRight}</span>
        </div>
      </div>
    </div>
  );
}

export function RankingV2Template({
  movies,
  title,
  titleSize,
  footerRight,
  dateLabel,
  backgroundStart = "#07131a",
  backgroundEnd = "#221f2e",
  rowBackgroundColors = [],
  backgroundMovie,
  showDailyAudience = true,
  showTotalAudience = false,
  showRanks = true,
  showImages = true,
  showRowBackgrounds = true,
}: {
  movies: Array<CaptureMovie | undefined>;
  title: string;
  titleSize: number;
  footerRight: string;
  dateLabel?: string;
  backgroundStart?: string;
  backgroundEnd?: string;
  rowBackgroundColors?: string[];
  backgroundMovie?: CaptureMovie;
  showDailyAudience?: boolean;
  showTotalAudience?: boolean;
  showRanks?: boolean;
  showImages?: boolean;
  showRowBackgrounds?: boolean;
}) {
  const rankingRows = Array.from({ length: 10 }, (_, index) => movies[index]);
  const titleValue = title.trim() || `${movies[0]?.title ?? "1위 작품"} 박스오피스 1위`;
  const getRankText = (movie: CaptureMovie | undefined, index: number) =>
    movie?.rankingText?.trim() || String(index + 1);
  const getDailyAudience = (movie?: CaptureMovie) => movie?.release_date?.trim() ?? "";
  const getTotalAudience = (movie?: CaptureMovie) => movie?.rankingTotalAudience?.trim() ?? "";
  const backgroundCandidates = buildImageCandidates(getPosterUrl(backgroundMovie), getBackdropUrl(backgroundMovie));

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#221f2e] text-white">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at top right, rgba(236,72,153,0.12), transparent 34%), radial-gradient(circle at bottom left, rgba(59,130,246,0.1), transparent 36%), linear-gradient(180deg, ${backgroundStart} 0%, ${backgroundEnd} 100%)`,
        }}
      />
      {backgroundCandidates[0] ? (
        <>
          <img
            alt=""
            src={backgroundCandidates[0]}
            data-fallback-index="0"
            onError={(event) => handleImageFallback(event, backgroundCandidates)}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: `center ${backgroundMovie?.imagePosition ?? 34}%` }}
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.58)_42%,rgba(2,6,23,0.9)_100%)]" />
        </>
      ) : null}
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.18)_0.8px,transparent_0.8px)] [background-size:11px_11px]" />

      <div className="relative z-[1] flex h-full min-h-0 flex-col px-4 pb-2 pt-4">
        <CaptureV2Header title={titleValue} titleSize={titleSize} />
        {dateLabel?.trim() ? (
          <p
            style={titleFontStyle}
            className="ml-2 mt-1 max-w-[calc(100%-0.5rem)] truncate pl-[2px] text-left text-[10px] font-black leading-none tracking-[-0.03em] text-white/72 drop-shadow-[0_1px_4px_rgba(0,0,0,0.48)]"
          >
            {dateLabel.trim()}
          </p>
        ) : null}

        <div className="relative mt-2 min-h-0 flex-1 overflow-hidden px-0.5 pb-0 pt-1.5">
          <div className="flex h-full flex-col gap-1">
              {rankingRows.map((movie, index) => {
              const imageCandidates = buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));
              const rowBackgroundColor = rowBackgroundColors[index] || "#221f2e";
              const rowBackgroundFull = hexToRgba(rowBackgroundColor, 0.96, "rgba(34,31,46,0.96)");
              const rowBackgroundStrong = hexToRgba(rowBackgroundColor, 1, "rgba(34,31,46,1)");
              const rowBackgroundMid = hexToRgba(rowBackgroundColor, 0.38, "rgba(34,31,46,0.38)");
              const rowBackgroundSoft = hexToRgba(rowBackgroundColor, 0.74, "rgba(34,31,46,0.74)");
              const rowBackgroundBase =
                showImages
                  ? `linear-gradient(90deg,rgba(6,8,14,0.98) 0%,rgba(12,13,20,0.96) 22%,${rowBackgroundStrong} 72%,${rowBackgroundStrong} 100%)`
                  : `linear-gradient(90deg,rgba(6,8,14,0.98) 0%,rgba(12,13,20,0.98) 34%,${rowBackgroundFull} 100%)`;

              return (
                <div
                  key={movie ? `${movie.media_type ?? "movie"}-${movie.id}-${index}` : `ranking-v2-placeholder-${index}`}
                  className="grid min-h-0 flex-1 items-stretch"
                  style={{
                    gridTemplateColumns: showDailyAudience ? "minmax(0,1fr) 5.2rem" : "minmax(0,1fr)",
                  }}
                >
                  <div
                    className={[
                      "grid min-w-0 overflow-hidden rounded-[0.2rem]",
                      showRowBackgrounds ? "shadow-[0_5px_12px_rgba(0,0,0,0.18)]" : "",
                    ].join(" ")}
                    style={{
                      gridTemplateColumns: "minmax(0,1fr)",
                      clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)",
                    }}
                  >
                    <div
                      className="relative min-w-0 overflow-hidden"
                      style={{ background: showRowBackgrounds ? rowBackgroundBase : undefined }}
                    >
                      {showRowBackgrounds && showImages && imageCandidates[0] ? (
                        <img
                          alt=""
                          src={imageCandidates[0]}
                          data-fallback-index="0"
                          onError={(event) => handleImageFallback(event, imageCandidates)}
                          className="absolute inset-y-0 right-0 block h-full object-cover"
                          style={{
                            objectPosition: `center ${movie?.imagePosition ?? 35}%`,
                            width: "50%",
                          }}
                          crossOrigin="anonymous"
                        />
                      ) : null}
                      {showRowBackgrounds ? (
                        <div
                          className="absolute inset-0"
                          style={{
                            background: showImages
                              ? `linear-gradient(90deg,rgba(6,8,14,0.98) 0%,rgba(12,13,20,0.96) 24%,${rowBackgroundStrong} 46%,${rowBackgroundFull} 55%,${rowBackgroundMid} 68%,rgba(34,31,46,0) 84%)`
                              : `linear-gradient(90deg,rgba(6,8,14,0.98) 0%,rgba(12,13,20,0.98) 34%,${rowBackgroundSoft} 100%)`,
                          }}
                        />
                      ) : null}
                      <div className={["relative z-[1] flex h-full min-w-0 items-center pr-7", showRanks ? "gap-3 pl-2" : "gap-0 pl-2.5"].join(" ")}>
                        {showRanks ? (
                          <span
                            style={titleFontStyle}
                            className="flex w-6 shrink-0 justify-center text-center text-[13px] font-black leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                          >
                            {getRankText(movie, index)}
                          </span>
                        ) : null}
                        <div className="min-w-0 translate-y-[0.75px]">
                          <p
                            style={titleFontStyle}
                            className="truncate text-[13px] font-black uppercase leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                          >
                            {movie?.title ?? CAPTURE_TEXT.addMovie}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {showDailyAudience ? (
                    <div
                      style={rankingNumberStyle}
                      className="flex h-full min-w-0 flex-col items-end justify-center py-[1px] text-right font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.28)]"
                    >
                      <span className="w-full whitespace-nowrap text-[12px] leading-[1.05]">{getDailyAudience(movie)}</span>
                      {showTotalAudience ? (
                        <span className="mt-[1px] w-full whitespace-nowrap text-[8px] leading-[1.05] text-white/68">
                          {getTotalAudience(movie)}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className="pt-0 text-center">
          <span className="text-[10px] font-semibold tracking-[0.03em] text-white/45">{footerRight || CAPTURE_TEXT.footerRight}</span>
        </div>
      </div>
    </div>
  );
}

function MovieCaptureRow({
  movie,
  index,
  rounded = true,
  stackCount = 5,
  bottomAligned = false,
  titleLayout = "corner",
  showTitle = true,
  showImageOverlay = true,
  metaMode = "year",
}: {
  movie?: CaptureMovie;
  index: number;
  rounded?: boolean;
  stackCount?: number;
  bottomAligned?: boolean;
  titleLayout?: "corner" | "center";
  showTitle?: boolean;
  showImageOverlay?: boolean;
  metaMode?: MovieListMetaMode;
}) {
  const imageCandidates = buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));
  const subbodyLines = getMovieListSubbodyLines(sanitizeSinglePreviewSubbody(movie?.singlePreviewSubbody));
  const [subbodyMetaLine, ...subbodyRestLines] = subbodyLines;
  const legacySubbodyOverview = subbodyRestLines.join(" ");
  const bodyValue = (movie?.singlePreviewBody ?? movie?.overview ?? legacySubbodyOverview).trim();
  const subbodyValue = [subbodyMetaLine, bodyValue].filter(Boolean).join("\n");
  const objectPosition = `center ${movie?.imagePosition ?? 20}%`;
  const isCenterTitle = titleLayout === "center";
  const metaValue = getMovieListMetaLabel(movie, metaMode);
  const titleSizeClass = stackCount >= 3 ? "text-[14px]" : "text-[16px]";
  const metaSizeClass = stackCount >= 3 ? "text-[9px]" : "text-[10px]";
  const overviewClampClass = stackCount >= 3 ? "line-clamp-3" : "line-clamp-4";

  if (!isCenterTitle) {
    return (
      <div className={["relative h-full min-h-0 w-full flex-1 overflow-hidden bg-slate-900 text-white", rounded ? "" : "rounded-none"].join(" ")}>
        {imageCandidates[0] ? (
          <img
            alt=""
            src={imageCandidates[0]}
            data-fallback-index="0"
            onError={(event) => handleImageFallback(event, imageCandidates)}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition }}
            crossOrigin="anonymous"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.76)_0%,rgba(0,0,0,0.34)_24%,rgba(0,0,0,0.06)_52%,rgba(0,0,0,0.82)_100%)]" />
        {showTitle ? (
          <div className="absolute inset-x-0 top-0 z-[2] px-4 pt-3">
            <div className="flex min-w-0 items-start gap-2">
              <span className="h-[2.15rem] w-0.5 shrink-0 bg-amber-400/90" />
              <div className="min-w-0 flex-1">
                <p
                  style={titleFontStyle}
                  className={[
                    "line-clamp-2 break-normal font-black leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
                    titleSizeClass,
                  ].join(" ")}
                >
                  {movie?.title ?? CAPTURE_TEXT.addMovie}
                </p>
                {metaValue ? (
                  <p style={titleFontStyle} className={[metaSizeClass, "mt-0.5 leading-tight text-white/78"].join(" ")}>
                    {metaValue}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
        {subbodyValue ? (
          <div className="absolute inset-x-0 bottom-0 z-[2] px-4 pb-4">
            {subbodyMetaLine ? (
              <p
                style={titleFontStyle}
                className="max-w-[58%] truncate text-left text-[8px] font-normal leading-[1.2] text-white/56 drop-shadow-[0_1px_2px_rgba(0,0,0,0.72)]"
              >
                {subbodyMetaLine}
              </p>
            ) : null}
            {bodyValue ? (
              <p
                style={titleFontStyle}
                className={[
                  "mt-1.5 whitespace-pre-line text-left text-[9px] font-normal leading-[1.22] text-white/88 drop-shadow-[0_1px_2px_rgba(0,0,0,0.72)]",
                  overviewClampClass,
                ].join(" ")}
              >
                {bodyValue}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={["relative h-full min-h-0 w-full flex-1 overflow-hidden bg-slate-900 text-white", rounded ? "" : "rounded-none"].join(" ")}>
      {imageCandidates[0] ? (
        <img
          alt=""
          src={imageCandidates[0]}
          data-fallback-index="0"
          onError={(event) => handleImageFallback(event, imageCandidates)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition, transform: "scale(1.1)" }}
          crossOrigin="anonymous"
        />
      ) : null}

      {showImageOverlay ? (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.10)_28%,rgba(0,0,0,0)_58%,rgba(0,0,0,0.18)_100%)]" />
          <div
            className={[
              "absolute inset-0",
              isCenterTitle
                ? "bg-[linear-gradient(180deg,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.38)_50%,rgba(0,0,0,0.10)_100%)]"
                : bottomAligned
                ? "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_42%,rgba(0,0,0,0.32)_72%,rgba(0,0,0,0.68)_100%)]"
                : "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_46%,rgba(0,0,0,0.14)_100%)]",
            ].join(" ")}
          />
        </>
      ) : null}

      {showTitle || subbodyValue ? (
        <div
          className={[
            isCenterTitle
              ? "relative z-[1] flex h-full items-center justify-center px-[16px] py-[14px] text-center"
              : bottomAligned
              ? "absolute inset-x-0 bottom-0 z-[2] px-4 pb-3 pt-10"
              : "relative z-[1] flex items-stretch gap-1 px-[16px] py-[14px]",
            !isCenterTitle && bottomAligned
              ? "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.62)_38%,rgba(0,0,0,0.78)_100%)]"
              : "",
          ].join(" ")}
        >
          {showTitle && !isCenterTitle ? <span className="w-0.5 shrink-0 bg-amber-400/90" /> : null}
          <div className={["min-w-0", isCenterTitle ? "w-full" : "pl-[2px]"].join(" ")}>
            {showTitle ? (
              <p
                style={titleFontStyle}
                className={[
                  "leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)] break-normal",
                  isCenterTitle ? "line-clamp-2 text-center text-[14px] font-black whitespace-normal" : titleSizeClass,
                  !isCenterTitle && bottomAligned ? "line-clamp-2 whitespace-normal" : "",
                  !isCenterTitle && !bottomAligned ? "truncate" : "",
                ].join(" ")}
              >
                {movie?.title ?? CAPTURE_TEXT.addMovie}
              </p>
            ) : null}
            {showTitle && !isCenterTitle && metaValue ? (
              <p style={titleFontStyle} className={[metaSizeClass, "leading-tight text-white/72"].join(" ")}>
                {metaValue}
              </p>
            ) : null}
            {subbodyValue ? (
              <p
                style={titleFontStyle}
                className="mt-1 line-clamp-3 whitespace-pre-line text-left text-[10px] font-medium leading-[1.24] text-white/86 drop-shadow-[0_1px_2px_rgba(0,0,0,0.58)]"
              >
                {subbodyValue}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MovieListTemplate({
  slots,
  columns,
  twoColumnTextMode,
  centerTitles,
  metaMode,
  footerLeft,
  footerRight,
}: {
  slots: Array<CaptureMovie | undefined>;
  columns: 1 | 2;
  twoColumnTextMode: "corner" | "center";
  centerTitles: string[];
  metaMode: MovieListMetaMode;
  footerLeft: string;
  footerRight: string;
}) {
  const isTwoColumn = columns === 2;
  const titleLayout = isTwoColumn ? twoColumnTextMode : "corner";
  const shouldUseSharedRowTitle = isTwoColumn && twoColumnTextMode === "center";
  const sharedRowTitleSizeClass = slots.length >= 8 ? "text-[13px]" : slots.length >= 6 ? "text-[14px]" : "text-[16px]";
  const leftSlots = isTwoColumn ? slots.filter((_, index) => index % 2 === 0) : slots;
  const rightSlots = isTwoColumn ? slots.filter((_, index) => index % 2 === 1) : [];
  const pairedSlots = shouldUseSharedRowTitle
    ? Array.from({ length: Math.ceil(slots.length / 2) }, (_, index) => ({
        left: slots[index * 2],
        right: slots[index * 2 + 1],
        rowIndex: index,
      }))
    : [];

  return (
    <div className="relative flex h-full flex-col bg-slate-950 text-white">
      {shouldUseSharedRowTitle ? (
        <div className="flex min-h-0 flex-1 flex-col gap-0 bg-slate-950 px-0 pt-0">
          {pairedSlots.map(({ left, right, rowIndex }) => {
            const defaultTitle = [left?.title, right?.title].filter(Boolean).join(CAPTURE_TEXT.movieListPairSeparator) || CAPTURE_TEXT.addMovie;
            const title = centerTitles[rowIndex]?.trim() || defaultTitle;

            return (
              <div key={`preview-row-${rowIndex}`} className="relative grid min-h-0 flex-1 grid-cols-2 overflow-hidden">
                <div className="relative min-h-0">
                  <MovieCaptureRow
                    movie={left}
                    index={rowIndex * 2}
                    rounded={false}
                    stackCount={pairedSlots.length}
                    bottomAligned
                    titleLayout="center"
                    showTitle={false}
                    showImageOverlay={false}
                    metaMode={metaMode}
                  />
                </div>
                <div className="min-h-0">
                  <MovieCaptureRow
                    movie={right}
                    index={rowIndex * 2 + 1}
                    rounded={false}
                    stackCount={pairedSlots.length}
                    bottomAligned
                    titleLayout="center"
                    showTitle={false}
                    showImageOverlay={false}
                    metaMode={metaMode}
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-5 text-center">
                  <p
                    style={titleFontStyle}
                    className={[
                      "line-clamp-2 max-w-[82%] shrink-0 break-normal text-center font-black leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)]",
                      sharedRowTitleSizeClass,
                    ].join(" ")}
                  >
                    {title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={[
            "min-h-0 flex-1 bg-slate-950",
            isTwoColumn ? "grid grid-cols-2" : "flex flex-col",
            "gap-0 px-0 pt-0",
          ].join(" ")}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-0">
            {leftSlots.map((movie, index) => (
              <div
                key={movie ? `${movie.media_type ?? "movie"}-${movie.id}-left-${index}` : `preview-left-${index}`}
                className="relative min-h-0 flex-1"
              >
                <MovieCaptureRow
                  movie={movie}
                  index={index}
                  rounded={false}
                  stackCount={leftSlots.length}
                  bottomAligned={isTwoColumn}
                  titleLayout={titleLayout}
                  metaMode={metaMode}
                />
              </div>
            ))}
          </div>
          {isTwoColumn ? (
            <div className="relative flex min-h-0 flex-1 flex-col gap-0">
              {rightSlots.map((movie, index) => (
                <div
                  key={movie ? `${movie.media_type ?? "movie"}-${movie.id}-right-${index}` : `preview-right-${index * 2 + 1}`}
                  className="relative min-h-0 flex-1"
                >
                  <MovieCaptureRow
                    movie={movie}
                    index={index * 2 + 1}
                    rounded={false}
                    stackCount={rightSlots.length}
                    bottomAligned={isTwoColumn}
                    titleLayout={titleLayout}
                    metaMode={metaMode}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] px-0 pb-2">
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
      </div>
    </div>
  );
}

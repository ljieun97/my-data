import { CaptureMovie, sanitizeSinglePreviewSubbody } from "@/context/CaptureContentContext";
import {
  buildImageCandidates,
  CaptureFooter,
  CaptureHeadlineBlock,
  getBackdropUrl,
  getPosterUrl,
  getTextOverlayClass,
  handleImageFallback,
  titleFontStyle,
} from "@/components/contents/capture/content-capture-utils";
import { CAPTURE_TEXT } from "@/lib/capture-defaults";
import type { CSSProperties } from "react";

export type MovieListMetaMode = "year" | "release-date";
export type MovieListTextStyle = "box" | "plain";
export type MovieListTextSize = "small" | "large";
export type ReleaseBoardTextPlacement = "inside" | "below" | "none";
export type RankingV2TitleDisplay = "title" | "logo";

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

function parseAudienceCount(value: string | undefined) {
  const normalizedValue = value?.trim();
  if (!normalizedValue) return null;

  const numericValue = Number(normalizedValue.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numericValue)) return null;

  return numericValue;
}

function getRankingDailyAudience(movie?: CaptureMovie) {
  if (!movie) return "";
  const audience = movie.rankingDailyAudience?.trim() || "1,000";
  const unit = movie.rankingDailyAudienceUnit?.trim() || "만명";
  return `${audience}${unit}`;
}

function getMovieListMetaLabel(movie: CaptureMovie | undefined, mode: MovieListMetaMode) {
  const releaseDate = movie?.release_date?.trim();
  if (!releaseDate) return "";

  if (mode === "release-date") {
    const [, , month, day] = releaseDate.match(/^(\d{4})-(\d{2})-(\d{2})$/) ?? [];
    if (!month || !day) return releaseDate;
    return `${Number(month)}/${Number(day)} 개봉`;
  }

  const [, year] = releaseDate.match(/^(\d{4})-\d{2}-\d{2}$/) ?? [];
  return year ? `${year} ·` : releaseDate;
}

function getReleaseBoardDateLabel(movie: CaptureMovie | undefined) {
  const releaseDate = movie?.release_date?.trim();
  if (!releaseDate) return "";
  const [, month, day] = releaseDate.match(/^\d{4}-(\d{2})-(\d{2})$/) ?? [];
  if (!month || !day) return releaseDate;
  return `${Number(month)}/${Number(day)}`;
}

function getLogoUrl(movie: CaptureMovie | undefined) {
  if (movie?.releaseLogoDisabled) return "";
  const logoPath = movie?.logo_path || movie?.logoOptions?.[0];
  if (!logoPath) return "";
  return `https://image.tmdb.org/t/p/original${logoPath}`;
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
  subtitle,
  titleSize,
  columns,
  textPlacement = "inside",
  showLogos = true,
  footerRight,
}: {
  movies: Array<CaptureMovie | undefined>;
  title: string;
  subtitle?: string;
  titleSize: number;
  columns: number;
  textPlacement?: ReleaseBoardTextPlacement;
  showLogos?: boolean;
  footerRight: string;
}) {
  const visibleMovies = movies.filter(Boolean) as CaptureMovie[];
  const columnCount = Math.max(1, Math.min(12, Math.round(columns)));
  const rowCount = Math.max(1, Math.ceil(visibleMovies.length / columnCount));
  const isDense = rowCount >= 4 || columnCount >= 5;
  const isVeryDense = rowCount >= 6 || columnCount >= 6;
  const gapPx = isDense ? 4 : 8;
  const belowTextSpaceClass = textPlacement === "below" ? (isVeryDense ? "pb-4" : isDense ? "pb-5" : "pb-6") : "";
  const rows = Array.from({ length: rowCount }, (_, rowIndex) =>
    visibleMovies.slice(rowIndex * columnCount, rowIndex * columnCount + columnCount),
  );
  const subtextValue = subtitle?.trim().replace(/\s*\n\s*/g, " ");

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#221f2e] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.34),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_36%),linear-gradient(180deg,#7a3f52_0%,#4a364a_52%,#262b3d_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.18)_0.8px,transparent_0.8px)] [background-size:11px_11px]" />

      <div className="relative z-[1] flex h-full min-h-0 flex-col px-4 pb-2 pt-4">
        <CaptureHeadlineBlock
          title={title}
          titleSize={titleSize}
          subtitle={subtextValue}
          subtitlePlacement="below"
          subtitleTone="light"
        />

        <div
          className={[
            "relative mt-2 flex min-h-0 flex-1 flex-col px-2 pb-0 pt-1.5",
          ].join(" ")}
          style={{ gap: `${gapPx}px` }}
        >
          {rows.map((rowMovies, rowIndex) => (
            <div
              key={`release-row-${rowIndex}`}
              className={["flex min-h-0 flex-1 justify-center", belowTextSpaceClass].join(" ")}
              style={{ gap: `${gapPx}px` }}
            >
              {rowMovies.map((movie, index) => {
                const posterUrl = getPosterUrl(movie) || getBackdropUrl(movie);
                const releaseDateLabel = getReleaseBoardDateLabel(movie);
                const logoUrl = getLogoUrl(movie);
                const showLogo = showLogos && Boolean(logoUrl);
                const showTitleAsLogo = textPlacement === "inside" && showLogos && (movie.releaseLogoDisabled || !logoUrl);
                const showInsideText = textPlacement === "inside" && !showLogo && !showTitleAsLogo;

                return (
                  <div
                    key={`${movie.id}-${rowIndex}-${index}`}
                    className="relative min-h-0 shadow-[0_10px_20px_rgba(0,0,0,0.22)]"
                    style={{ flex: `0 0 calc((100% - ${gapPx * (columnCount - 1)}px) / ${columnCount})` }}
                  >
                    <div className={["relative h-full min-h-0 overflow-hidden bg-white", isDense ? "rounded-[0.25rem]" : "rounded-[0.45rem]"].join(" ")}>
                      {posterUrl ? (
                        <>
                          <img alt="" src={posterUrl} className="h-full w-full object-cover" crossOrigin="anonymous" />
                          {showLogo ? (
                            <div className="absolute inset-x-[12%] bottom-[7%] z-[2] flex justify-center">
                              <img
                                alt=""
                                src={logoUrl}
                                className="max-h-[22px] max-w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.78)]"
                                crossOrigin="anonymous"
                              />
                            </div>
                          ) : null}
                          {showTitleAsLogo ? (
                            <div className="absolute inset-x-[12%] bottom-[7%] z-[2] flex justify-center">
                              <p
                                style={{
                                  ...titleFontStyle,
                                  textShadow: "0 1px 2px rgba(0,0,0,0.95), 0 2px 7px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.78)",
                                }}
                                className={[
                                  "break-keep text-center font-black leading-[1.06] tracking-[-0.04em] text-white",
                                  isVeryDense ? "text-[8px]" : isDense ? "text-[9px]" : "text-[10px]",
                                ].join(" ")}
                              >
                                {movie.title}
                              </p>
                            </div>
                          ) : null}
                          {movie.releaseBadge ? (
                            <div
                              style={titleFontStyle}
                              className={[
                                "absolute right-1 top-1 z-[2] flex items-center justify-center rounded-full bg-[#b58a45]/95 font-medium leading-none text-white shadow-[0_1px_4px_rgba(0,0,0,0.42)]",
                                isVeryDense ? "h-3.5 w-3.5 text-[7px]" : isDense ? "h-4 w-4 text-[8px]" : "h-5 w-5 text-[9px]",
                              ].join(" ")}
                            >
                              재
                            </div>
                          ) : null}
                          {showInsideText ? (
                            <div className={["absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.66)_64%,rgba(0,0,0,0.86)_100%)]", isDense ? "px-1 pb-1 pt-4" : "px-1.5 pb-1.5 pt-5"].join(" ")}>
                              <p
                                style={titleFontStyle}
                                className={[
                                  "truncate break-keep text-center font-medium leading-[1.15] tracking-[-0.04em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.72)]",
                                  isVeryDense ? "text-[7px]" : isDense ? "text-[8px]" : "text-[9px]",
                                ].join(" ")}
                              >
                                {movie.title}
                              </p>
                              {releaseDateLabel ? (
                                <p
                                  style={titleFontStyle}
                                  className={[
                                    "mt-0.5 truncate text-center font-normal leading-none text-white/72 drop-shadow-[0_1px_2px_rgba(0,0,0,0.72)]",
                                    isVeryDense ? "text-[6px]" : isDense ? "text-[7px]" : "text-[8px]",
                                  ].join(" ")}
                                >
                                  {releaseDateLabel}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center bg-white/90 text-center text-[12px] font-bold tracking-[0.08em] text-slate-400">
                          ADD MOVIE
                        </div>
                      )}
                    </div>
                    {textPlacement === "below" ? (
                      <div className={["pointer-events-none absolute inset-x-0 top-full text-center", isDense ? "mt-1" : "mt-1.5"].join(" ")}>
                        <p
                          style={titleFontStyle}
                          className={[
                            "truncate break-keep font-medium leading-[1.15] tracking-[-0.04em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.72)]",
                            isVeryDense ? "text-[7px]" : isDense ? "text-[8px]" : "text-[9px]",
                          ].join(" ")}
                        >
                          {movie.title}
                        </p>
                        {releaseDateLabel ? (
                          <p
                            style={titleFontStyle}
                            className={[
                              "mt-0.5 truncate font-normal leading-none text-white/68 drop-shadow-[0_1px_2px_rgba(0,0,0,0.72)]",
                              isVeryDense ? "text-[6px]" : isDense ? "text-[7px]" : "text-[8px]",
                            ].join(" ")}
                          >
                            {releaseDateLabel}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="pt-1.5 text-center">
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
  titleDisplay = "title",
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
  titleDisplay?: RankingV2TitleDisplay;
}) {
  const rankingRows = movies;
  const isDenseRanking = rankingRows.length > 10;
  const titleValue = title.trim() || `${movies[0]?.title ?? "1위 작품"} 박스오피스 1위`;
  const subtextValue = dateLabel?.trim().replace(/\s*\n\s*/g, " ");
  const dailyAudienceCounts = rankingRows.map((movie) => parseAudienceCount(movie?.rankingDailyAudience));
  const validDailyAudienceCounts = dailyAudienceCounts.filter((value): value is number => value !== null);
  const maxDailyAudienceCount = Math.max(0, ...validDailyAudienceCounts);
  const minDailyAudienceCount = Math.min(maxDailyAudienceCount, ...validDailyAudienceCounts);
  const dailyAudienceRange = maxDailyAudienceCount - minDailyAudienceCount;
  const maxRowTipInsetPx = isDenseRanking ? 64 : 78;
  const getRankText = (movie: CaptureMovie | undefined, index: number) =>
    movie?.rankingText?.trim() || String(index + 1);
  const getDailyAudience = getRankingDailyAudience;
  const getTotalAudience = (movie?: CaptureMovie) => movie?.rankingTotalAudience?.trim() ?? "";
  const audienceColumnCharacterCount = Math.max(
    0,
    ...rankingRows.map((movie) =>
      Math.max(getDailyAudience(movie).length, showTotalAudience ? getTotalAudience(movie).length : 0),
    ),
  );
  const audienceColumnWidthRem = Math.max(showTotalAudience ? 3.5 : 3, Math.min(showTotalAudience ? 4.7 : 3.9, audienceColumnCharacterCount * 0.41));
  const backgroundCandidates = buildImageCandidates(getPosterUrl(backgroundMovie), getBackdropUrl(backgroundMovie));
  const useLogoTitles = titleDisplay === "logo";

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
        <CaptureHeadlineBlock
          title={titleValue}
          titleSize={titleSize}
          subtitle={subtextValue}
          subtitlePlacement="below"
          subtitleTone="light"
        />

        <div className="relative mt-2 min-h-0 flex-1 overflow-hidden px-0.5 pb-0 pt-1.5">
          <div className={["flex h-full flex-col", isDenseRanking ? "gap-0.5" : "gap-1"].join(" ")}>
            {rankingRows.map((movie, index) => {
              const imageCandidates = buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));
              const rowBackgroundColor = rowBackgroundColors[index] || "#221f2e";
              const audienceCount = dailyAudienceCounts[index];
              const rowTipInsetPx =
                audienceCount === null || dailyAudienceRange <= 0
                  ? 0
                  : Math.round(Math.pow((maxDailyAudienceCount - audienceCount) / dailyAudienceRange, 0.78) * maxRowTipInsetPx);
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
                    columnGap: showDailyAudience ? "0.12rem" : undefined,
                    gridTemplateColumns: showDailyAudience ? `minmax(0,1fr) ${audienceColumnWidthRem.toFixed(2)}rem` : "minmax(0,1fr)",
                  }}
                >
                  <div
                    className={[
                      "grid min-w-0 overflow-hidden rounded-[0.2rem]",
                      showRowBackgrounds ? "shadow-[0_5px_12px_rgba(0,0,0,0.18)]" : "",
                    ].join(" ")}
                    style={{
                      gridTemplateColumns: "minmax(0,1fr)",
                      justifySelf: "start",
                      width: `calc(100% - ${rowTipInsetPx}px)`,
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
                            className={[
                              "flex w-6 shrink-0 justify-center text-center font-black leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
                              isDenseRanking ? "text-[13px]" : "text-[14px]",
                            ].join(" ")}
                          >
                            {getRankText(movie, index)}
                          </span>
                        ) : null}
                        <div className="flex h-full min-w-0 translate-y-[0.75px] items-center">
                          {useLogoTitles && getLogoUrl(movie) ? (
                            <img
                              alt={movie?.title ?? ""}
                              src={getLogoUrl(movie)}
                              className={["max-w-full object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]", isDenseRanking ? "max-h-[17px]" : "max-h-[19px]"].join(" ")}
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <p
                              style={titleFontStyle}
                              className={[
                                "truncate font-bold uppercase leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
                                isDenseRanking ? "text-[13px]" : "text-[14px]",
                              ].join(" ")}
                            >
                              {movie?.title ?? CAPTURE_TEXT.addMovie}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {showDailyAudience ? (
                    <div
                      style={rankingNumberStyle}
                      className="flex h-full min-w-0 flex-col items-end justify-center py-[1px] text-right font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.28)]"
                    >
                      <span
                        className={[
                          "w-full whitespace-nowrap leading-none text-white",
                          isDenseRanking ? "text-[13px]" : "text-[14px]",
                        ].join(" ")}
                      >
                        {getDailyAudience(movie)}
                      </span>
                      {showTotalAudience ? (
                        <span className="mt-[1px] w-full whitespace-nowrap text-[8px] font-extrabold leading-none text-white/58">
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
  showBody = true,
  textStyle = "box",
  subbodyTextSize = "small",
  bodyTextSize = "small",
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
  showBody?: boolean;
  textStyle?: MovieListTextStyle;
  subbodyTextSize?: MovieListTextSize;
  bodyTextSize?: MovieListTextSize;
  metaMode?: MovieListMetaMode;
}) {
  const imageCandidates = buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));
  const subbodyLines = getMovieListSubbodyLines(sanitizeSinglePreviewSubbody(movie?.singlePreviewSubbody));
  const [subbodyMetaLine, ...subbodyRestLines] = subbodyLines;
  const legacySubbodyOverview = subbodyRestLines.join(" ");
  const bodyValue = showBody ? (movie?.singlePreviewBody ?? movie?.overview ?? legacySubbodyOverview).trim() : "";
  const objectPosition = `center ${movie?.imagePosition ?? 20}%`;
  const isCenterTitle = titleLayout === "center";
  const metaValue = getMovieListMetaLabel(movie, metaMode);
  const subbodyMetaValue = subbodyMetaLine;
  const bodyMetaValue = metaValue;
  const bodyDisplayValue = [bodyMetaValue, bodyValue].filter(Boolean).join("\n");
  const subbodyValue = showBody ? [subbodyMetaValue, bodyDisplayValue].filter(Boolean).join("\n") : "";
  const logoUrl = getLogoUrl(movie);
  const titleSizeClass = stackCount >= 3 ? "text-[13px]" : "text-[15px]";
  const logoSizeClass = stackCount >= 3 ? "max-h-[22px]" : "max-h-[30px]";
  const logoWidthClass = stackCount >= 3 ? "max-w-[116px]" : "max-w-[150px]";
  const overviewClampClass = stackCount >= 3 ? "line-clamp-3" : "line-clamp-4";
  const isPlainText = textStyle === "plain";
  const subbodyTextSizeClass = subbodyTextSize === "large" ? "text-[15px] leading-[1.18]" : "text-[10px] leading-[1.2]";
  const bodyTextSizeClass = bodyTextSize === "large" ? "text-[17px] leading-[1.18]" : "text-[11px] leading-[1.22]";
  const centerSubbodyTextSizeClass = subbodyTextSize === "large" ? "text-[15px] leading-[1.18]" : "text-[11px] leading-[1.2]";
  const centerBodyTextSizeClass = bodyTextSize === "large" ? "text-[17px] leading-[1.18]" : "text-[12px] leading-[1.24]";
  const bottomTextPaddingClass = "pb-4";

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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_45%,rgba(0,0,0,0.46)_100%)]" />
        {showTitle || subbodyValue ? (
          <div className={["absolute inset-x-0 bottom-0 z-[2] px-4", bottomTextPaddingClass].join(" ")}>
            {showTitle ? (
              <div className="mb-4 flex min-w-0 justify-center text-center">
              {logoUrl ? (
                <img
                  alt=""
                  src={logoUrl}
                  className={["object-contain object-center drop-shadow-[0_2px_5px_rgba(0,0,0,0.72)]", logoSizeClass, logoWidthClass].join(" ")}
                  crossOrigin="anonymous"
                />
              ) : (
                <p
                  style={titleFontStyle}
                  className={[
                    "line-clamp-2 max-w-[86%] break-normal text-center font-medium leading-tight",
                    "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
                    titleSizeClass,
                  ].join(" ")}
                >
                  {movie?.title ?? CAPTURE_TEXT.addMovie}
                </p>
              )}
              </div>
            ) : null}
            {subbodyValue ? (
            <div
              className={[
                "w-full px-3 py-2 text-center",
                isPlainText ? "bg-transparent text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.70)]" : "bg-white/82",
              ].join(" ")}
            >
            {subbodyMetaValue ? (
              <p
                style={titleFontStyle}
                className={[
                  "truncate text-center font-medium",
                  subbodyTextSizeClass,
                  isPlainText ? "text-white" : "text-slate-800",
                ].join(" ")}
              >
                {subbodyMetaValue}
              </p>
            ) : null}
            {bodyDisplayValue ? (
              <>
              {bodyMetaValue ? (
                <p
                  style={titleFontStyle}
                  className={[
                    "mt-1 whitespace-pre-line text-center font-normal",
                    bodyTextSizeClass,
                    isPlainText ? "text-white" : "text-slate-800",
                  ].join(" ")}
                >
                  {bodyMetaValue}
                </p>
              ) : null}
              {bodyValue ? (
              <p
                style={titleFontStyle}
                className={[
                  "mt-1 whitespace-pre-line text-center font-normal",
                  bodyTextSizeClass,
                  isPlainText ? "text-white" : "text-slate-800",
                  overviewClampClass,
                ].join(" ")}
              >
                {bodyValue}
              </p>
              ) : null}
              </>
            ) : null}
            </div>
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
                ? "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_58%,rgba(0,0,0,0.10)_100%)]"
                : "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_46%,rgba(0,0,0,0.14)_100%)]",
            ].join(" ")}
          />
        </>
      ) : null}

      {showTitle || subbodyValue ? (
        <div
          className={[
            isCenterTitle
              ? "absolute inset-x-0 bottom-0 z-[2] px-4 pb-4 text-center"
              : bottomAligned
              ? "absolute inset-x-0 bottom-0 z-[2] px-4 pb-3 pt-10"
              : "relative z-[1] flex items-stretch gap-1 px-[16px] py-[14px]",
          ].join(" ")}
        >
          {showTitle && !isCenterTitle ? <span className="w-0.5 shrink-0 bg-amber-400/90" /> : null}
          <div className={["min-w-0", isCenterTitle ? "w-full" : "pl-[2px]"].join(" ")}>
            {showTitle ? (
              <p
                style={titleFontStyle}
                className={[
                  "font-medium leading-tight break-normal",
                  "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)]",
                  isCenterTitle ? "line-clamp-2 text-center whitespace-normal" : "",
                  isCenterTitle ? "text-[13px]" : titleSizeClass,
                  !isCenterTitle && bottomAligned ? "line-clamp-2 whitespace-normal" : "",
                  !isCenterTitle && !bottomAligned ? "truncate" : "",
                ].join(" ")}
              >
                {movie?.title ?? CAPTURE_TEXT.addMovie}
              </p>
            ) : null}
            {subbodyValue ? (
              <div
                className={[
                  "mt-4 px-3 py-2 text-center",
                  isPlainText ? "w-full" : "mx-auto max-w-full",
                  isPlainText
                    ? "bg-transparent text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.70)]"
                    : "bg-white/82",
                ].join(" ")}
              >
                {subbodyMetaValue ? (
                  <p
                    style={titleFontStyle}
                    className={[
                      "truncate text-center font-medium",
                      centerSubbodyTextSizeClass,
                      isPlainText ? "text-white" : "text-slate-800",
                    ].join(" ")}
                  >
                    {subbodyMetaValue}
                  </p>
                ) : null}
                {bodyDisplayValue ? (
                  <>
                  {bodyMetaValue ? (
                    <p
                      style={titleFontStyle}
                      className={[
                        "mt-1 whitespace-pre-line text-center font-normal",
                        centerBodyTextSizeClass,
                        isPlainText ? "text-white" : "text-slate-800",
                      ].join(" ")}
                    >
                      {bodyMetaValue}
                    </p>
                  ) : null}
                  {bodyValue ? (
                  <p
                    style={titleFontStyle}
                    className={[
                      "mt-1 line-clamp-3 whitespace-pre-line text-center font-normal",
                      centerBodyTextSizeClass,
                      isPlainText ? "text-white" : "text-slate-800",
                    ].join(" ")}
                  >
                    {bodyValue}
                  </p>
                  ) : null}
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MovieListTemplate({
  slots,
  headline,
  subtitle,
  titleSize,
  showHeadline,
  columns,
  twoColumnTextMode,
  centerTitles,
  metaMode,
  showBody,
  textStyle,
  subbodyTextSize,
  bodyTextSize,
  footerLeft,
  footerRight,
}: {
  slots: Array<CaptureMovie | undefined>;
  headline: string;
  subtitle?: string;
  titleSize: number;
  showHeadline: boolean;
  columns: 1 | 2;
  twoColumnTextMode: "corner" | "center";
  centerTitles: string[];
  metaMode: MovieListMetaMode;
  showBody: boolean;
  textStyle: MovieListTextStyle;
  subbodyTextSize: MovieListTextSize;
  bodyTextSize: MovieListTextSize;
  footerLeft: string;
  footerRight: string;
}) {
  const isTwoColumn = columns === 2;
  const titleLayout = isTwoColumn ? twoColumnTextMode : "corner";
  const shouldUseSharedRowTitle = isTwoColumn && twoColumnTextMode === "center";
  const sharedRowTitleSizeClass = slots.length >= 8 ? "text-[12px]" : slots.length >= 6 ? "text-[13px]" : "text-[15px]";
  const leftSlots = isTwoColumn ? slots.filter((_, index) => index % 2 === 0) : slots;
  const rightSlots = isTwoColumn ? slots.filter((_, index) => index % 2 === 1) : [];
  const pairedSlots = shouldUseSharedRowTitle
    ? Array.from({ length: Math.ceil(slots.length / 2) }, (_, index) => ({
        left: slots[index * 2],
        right: slots[index * 2 + 1],
        rowIndex: index,
      }))
    : [];
  const headlineValue = headline.trim() || CAPTURE_TEXT.movieListCenterTitleFallback;
  const subtitleValue = subtitle?.trim().replace(/\s*\n\s*/g, " ");

  return (
    <div className="relative flex h-full flex-col bg-slate-950 text-white">
      {showHeadline ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[4] px-4 pt-4">
          <CaptureHeadlineBlock
            title={headlineValue}
            titleSize={titleSize}
            subtitle={subtitleValue}
            subtitlePlacement="below"
            subtitleTone="light"
          />
        </div>
      ) : null}
      {shouldUseSharedRowTitle ? (
        <div className="flex min-h-0 flex-1 flex-col gap-0 bg-slate-950 px-0 pt-0">
          {pairedSlots.map(({ left, right, rowIndex }) => {
            const defaultTitle = [left?.title, right?.title].filter(Boolean).join(CAPTURE_TEXT.movieListPairSeparator) || CAPTURE_TEXT.addMovie;
            const title = centerTitles[rowIndex]?.trim() || defaultTitle;
            const hasMovie = Boolean(left || right);

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
                    showBody={showBody}
                    textStyle={textStyle}
                    subbodyTextSize={subbodyTextSize}
                    bodyTextSize={bodyTextSize}
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
                    showBody={showBody}
                    textStyle={textStyle}
                    subbodyTextSize={subbodyTextSize}
                    bodyTextSize={bodyTextSize}
                    metaMode={metaMode}
                  />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex justify-center px-5 pb-[86px] text-center">
                  <p
                    style={titleFontStyle}
                    className={[
                      "line-clamp-2 max-w-[82%] shrink-0 break-normal text-center font-medium leading-tight",
                      "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)]",
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
                  showBody={showBody}
                  textStyle={textStyle}
                  subbodyTextSize={subbodyTextSize}
                  bodyTextSize={bodyTextSize}
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
                    showBody={showBody}
                    textStyle={textStyle}
                    subbodyTextSize={subbodyTextSize}
                    bodyTextSize={bodyTextSize}
                    metaMode={metaMode}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <div className="pointer-events-none absolute right-6 top-[8px] z-[10]">
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
      </div>
    </div>
  );
}

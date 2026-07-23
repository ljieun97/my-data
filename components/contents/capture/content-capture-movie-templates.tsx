import { CaptureMovie } from "@/context/CaptureContentContext";
import {
  buildImageCandidates,
  CaptureFooter,
  getBackdropUrl,
  getPosterUrl,
  getTextOverlayClass,
  getTitleGroupStyle,
  handleImageFallback,
  titleFontStyle,
} from "@/components/contents/capture/content-capture-utils";
import type { CSSProperties } from "react";

const rankingNumberStyle: CSSProperties = {
  fontFamily: '"Helvetica Neue", Arial, sans-serif',
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "0",
  lineHeight: 1,
};

const releaseBoardDefaultColors = [
  "#b91c1c",
  "#315f90",
  "#374151",
  "#111827",
  "#d14d72",
  "#7c1d5a",
  "#caa13f",
  "#ea6b00",
];

export function getReleaseBoardDefaultColors() {
  return [...releaseBoardDefaultColors];
}

export function formatReleaseBoardDate(value: string) {
  return value.trim();
}

export function getReleaseBoardAutoDate(movie?: CaptureMovie) {
  const rawDate = String(movie?.release_date ?? "").slice(0, 10);
  if (!rawDate) return "";

  const [year, month, day] = rawDate.split("-").map(Number);
  if (!year || !month || !day) return rawDate;

  return `${month}/${day}`;
}

export function ReleaseBoardTemplate({
  movies,
  title,
  titleSize,
  labelColors,
  dateLabels,
  footerRight,
}: {
  movies: Array<CaptureMovie | undefined>;
  title: string;
  titleSize: number;
  labelColors: string[];
  dateLabels: string[];
  footerRight: string;
}) {
  const visibleMovies = movies.slice(0, 8).filter(Boolean) as CaptureMovie[];
  const gridColsClass =
    visibleMovies.length <= 2 ? "grid-cols-2" : visibleMovies.length <= 6 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#221f2e] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.34),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_36%),linear-gradient(180deg,#7a3f52_0%,#4a364a_52%,#262b3d_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.18)_0.8px,transparent_0.8px)] [background-size:11px_11px]" />

      <div className="relative z-[1] flex h-full min-h-0 flex-col px-4 pb-2 pt-4">
        <div className="-mx-4 flex flex-col items-start">
          <div className="flex items-end justify-start">
            <div className="inline-flex max-w-full items-end gap-2 rounded-l-none rounded-r-[1.1rem] bg-white pb-0.5 pl-2 pr-4 pt-1.5">
              <h1
                style={{ ...titleFontStyle, fontSize: `${titleSize}px` }}
                className="min-w-0 text-left font-black leading-[0.94] tracking-[-0.09em] text-slate-950 [text-shadow:0_1px_0_rgba(255,255,255,0.3)] break-keep whitespace-pre-line"
              >
                {title}
              </h1>
            </div>
          </div>
        </div>

        <div className={["relative mt-2 min-h-0 flex-1 overflow-hidden px-0.5 pb-0 pt-1.5 grid gap-2", gridColsClass].join(" ")}>
          {visibleMovies.map((movie, index) => {
            const posterUrl = getPosterUrl(movie) || getBackdropUrl(movie);

            return (
              <div
                key={`${movie.id}-${index}`}
                className="flex min-h-0 flex-col overflow-hidden rounded-[0.95rem] bg-white/6 shadow-[0_10px_20px_rgba(0,0,0,0.22)]"
              >
                <div
                  className="px-2 py-0.5 text-center"
                  style={{ backgroundColor: labelColors[index] || releaseBoardDefaultColors[index] || "#1f2937" }}
                >
                  <p style={titleFontStyle} className="text-[12px] font-black tracking-[0.06em] text-white">
                    {formatReleaseBoardDate(dateLabels[index] || "") || `SLOT ${index + 1}`}
                  </p>
                </div>
                <div className="relative min-h-0 flex-1 bg-white">
                  {posterUrl ? (
                    <img alt="" src={posterUrl} className="h-full w-full object-cover" crossOrigin="anonymous" />
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
          <span className="text-[10px] font-semibold tracking-[0.03em] text-white/45">{footerRight || "35Film"}</span>
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
  backgroundMovie,
  showDailyAudience = true,
  showTotalAudience = false,
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
  backgroundMovie?: CaptureMovie;
  showDailyAudience?: boolean;
  showTotalAudience?: boolean;
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
        <div className="-mx-4 flex flex-col items-start">
          <div className="flex items-end justify-start">
            <div className="inline-flex max-w-full items-end gap-2 rounded-l-none rounded-r-[1.1rem] bg-white pb-0.5 pl-2 pr-4 pt-1.5">
              <h1
                style={{ ...titleFontStyle, fontSize: `${titleSize}px` }}
                className="min-w-0 text-left font-black leading-[0.94] tracking-[-0.09em] text-slate-950 [text-shadow:0_1px_0_rgba(255,255,255,0.3)] break-keep whitespace-pre-line"
              >
                {titleValue}
              </h1>
              {dateLabel?.trim() ? (
                <span
                  style={titleFontStyle}
                  className="shrink-0 pb-0.5 text-[10px] font-black leading-none tracking-[-0.03em] text-slate-500"
                >
                  {dateLabel.trim()}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative mt-2 min-h-0 flex-1 overflow-hidden px-0.5 pb-0 pt-1.5">
          <div className="flex h-full flex-col gap-1">
              {rankingRows.map((movie, index) => {
              const imageCandidates = buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));

              return (
                <div
                  key={movie?.id ?? `ranking-v2-placeholder-${index}`}
                  className="grid min-h-0 flex-1 items-stretch gap-2"
                  style={{
                    gridTemplateColumns: showDailyAudience ? "minmax(0,1fr) 3.65rem" : "minmax(0,1fr)",
                  }}
                >
                  <div
                    className={[
                      "grid min-w-0 overflow-hidden rounded-[0.2rem]",
                      showRowBackgrounds ? "shadow-[0_5px_12px_rgba(0,0,0,0.18)]" : "",
                    ].join(" ")}
                    style={{
                      gridTemplateColumns: "minmax(0,1fr)",
                      clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)",
                    }}
                  >
                    <div className={["relative min-w-0 overflow-hidden", showRowBackgrounds ? "bg-white/10" : ""].join(" ")}>
                      {showRowBackgrounds && showImages && imageCandidates[0] ? (
                        <img
                          alt=""
                          src={imageCandidates[0]}
                          data-fallback-index="0"
                          onError={(event) => handleImageFallback(event, imageCandidates)}
                          className="absolute inset-y-0 right-0 block h-full w-1/2 object-cover"
                          style={{ objectPosition: `center ${movie?.imagePosition ?? 35}%` }}
                          crossOrigin="anonymous"
                        />
                      ) : null}
                      {showRowBackgrounds ? (
                        <div
                          className="absolute inset-0"
                          style={{
                            background: showImages
                              ? "linear-gradient(90deg,rgba(34,31,46,0.96) 0%,rgba(34,31,46,0.92) 50%,rgba(34,31,46,0.18) 100%)"
                              : "linear-gradient(90deg,rgba(34,31,46,0.96) 0%,rgba(34,31,46,0.74) 100%)",
                          }}
                        />
                      ) : null}
                      <div className="relative z-[1] flex h-full min-w-0 items-center gap-3 pl-2 pr-7">
                        <span
                          style={titleFontStyle}
                          className="flex w-6 shrink-0 justify-center text-center text-[13px] font-black leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                        >
                          {getRankText(movie, index)}
                        </span>
                        <div className="min-w-0 translate-y-[0.75px]">
                          <p
                            style={titleFontStyle}
                            className="truncate text-[13px] font-black uppercase leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                          >
                            {movie?.title ?? "영화를 추가하세요"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {showDailyAudience ? (
                    <div
                      style={titleFontStyle}
                      className="flex h-full min-w-0 flex-col items-end justify-center py-[1px] text-right font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.28)]"
                    >
                      <span className="w-full truncate text-[12px] leading-[1.05]">{getDailyAudience(movie)}</span>
                      {showTotalAudience ? (
                        <span className="mt-[1px] w-full truncate text-[8px] leading-[1.05] text-white/68">
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
          <span className="text-[10px] font-semibold tracking-[0.03em] text-white/45">{footerRight || "35Film"}</span>
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
}: {
  movie?: CaptureMovie;
  index: number;
  rounded?: boolean;
  stackCount?: number;
  bottomAligned?: boolean;
  titleLayout?: "corner" | "center";
  showTitle?: boolean;
  showImageOverlay?: boolean;
}) {
  const imageCandidates = buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));
  const noteValue = movie?.note ?? "";
  const textSizeClass = stackCount >= 8 ? "text-[13px]" : stackCount >= 6 ? "text-[14px]" : "text-[16px]";
  const objectPosition = `center ${movie?.imagePosition ?? 20}%`;
  const isCenterTitle = titleLayout === "center";

  return (
    <div className={["relative min-h-0 flex-1 overflow-hidden bg-slate-900 text-white", rounded ? "" : "rounded-none"].join(" ")}>
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

      {showTitle ? (
        <div
          className={[
            "relative z-[1] flex px-[16px] py-[14px]",
            isCenterTitle ? "h-full items-center justify-center text-center" : "items-stretch gap-1",
            !isCenterTitle && bottomAligned ? "items-end" : "",
            !isCenterTitle && !bottomAligned ? "items-start" : "",
          ].join(" ")}
        >
          {!isCenterTitle ? <span className="w-0.5 shrink-0 bg-amber-400/90" /> : null}
          <p
            style={titleFontStyle}
            className={[
              "leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)] break-normal",
              isCenterTitle ? "line-clamp-2 text-center text-[12px] font-black whitespace-normal" : "text-[10px]",
              !isCenterTitle && bottomAligned ? "line-clamp-2 whitespace-normal" : "",
              !isCenterTitle && !bottomAligned ? "truncate" : "",
            ].join(" ")}
          >
            {movie?.title ?? "영화를 추가하세요"}
            {!isCenterTitle ? <br /> : null}
            {!isCenterTitle && movie?.release_date ? (
              <span className={"text-[8px] text-white/72"}>{movie?.release_date.split("-")[0]}</span>
            ) : null}
          </p>
        </div>
      ) : null}

      {movie?.note && !isCenterTitle ? (
         <div
            style={titleFontStyle}
            className={[
              "absolute right-[16px] top-1/2 -translate-y-1/2 z-[1]",
              "shrink-0 text-right font-black leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)] break-normal",
              bottomAligned ? "line-clamp-2 whitespace-normal" : "truncate",
              textSizeClass,
            ].join(" ")}
          >
          {noteValue}
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
  footerLeft,
  footerRight,
}: {
  slots: Array<CaptureMovie | undefined>;
  columns: 1 | 2;
  twoColumnTextMode: "corner" | "center";
  centerTitles: string[];
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
            const defaultTitle = [left?.title, right?.title].filter(Boolean).join(" · ") || "영화를 추가하세요";
            const title = centerTitles[rowIndex]?.trim() || defaultTitle;

            return (
              <div key={`preview-row-${rowIndex}`} className="relative grid min-h-0 flex-1 grid-cols-2 overflow-hidden">
                <MovieCaptureRow
                  movie={left}
                  index={rowIndex * 2}
                  rounded={false}
                  stackCount={pairedSlots.length}
                  bottomAligned
                  titleLayout="center"
                  showTitle={false}
                  showImageOverlay={false}
                />
                <MovieCaptureRow
                  movie={right}
                  index={rowIndex * 2 + 1}
                  rounded={false}
                  stackCount={pairedSlots.length}
                  bottomAligned
                  titleLayout="center"
                  showTitle={false}
                  showImageOverlay={false}
                />
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
              <MovieCaptureRow
                key={movie?.id ?? `preview-left-${index}`}
                movie={movie}
                index={index}
                rounded={false}
                stackCount={leftSlots.length}
                bottomAligned={isTwoColumn}
                titleLayout={titleLayout}
              />
            ))}
          </div>
          {isTwoColumn ? (
            <div className="flex min-h-0 flex-1 flex-col gap-0">
              {rightSlots.map((movie, index) => (
                <MovieCaptureRow
                  key={movie?.id ?? `preview-right-${index * 2 + 1}`}
                  movie={movie}
                  index={index * 2 + 1}
                  rounded={false}
                  stackCount={rightSlots.length}
                  bottomAligned={isTwoColumn}
                  titleLayout={titleLayout}
                />
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

export function SingleMovieTemplate({
  movie,
  titleSize,
  subtitleChipClass,
  variant,
  rank,
  footerLeft,
  footerRight,
}: {
  movie: CaptureMovie | undefined;
  titleSize: number;
  subtitleChipClass: string;
  variant: "default" | "spotlight";
  rank: number;
  footerLeft: string;
  footerRight: string;
}) {
  const imageCandidates = buildImageCandidates(getPosterUrl(movie), getBackdropUrl(movie));
  const backgroundCandidates = buildImageCandidates(getPosterUrl(movie));
  const title = movie?.singlePreviewTitle ?? movie?.title ?? "영화를 추가하세요";
  const subtitle = movie?.singlePreviewSubtitle ?? movie?.original_title ?? movie?.title ?? "설명 텍스트";
  const subbody = movie?.singlePreviewSubbody ?? "";
  const body = movie?.singlePreviewBody ?? movie?.overview ?? "?ш린???ㅻ챸???곸뼱二쇱꽭??\n??以꾧퉴吏 ?쒖떆?⑸땲??";
  const showTitle = movie?.singlePreviewShowTitle ?? true;
  const showSubtitle = movie?.singlePreviewShowSubtitle ?? false;
  const showSubbody = movie?.singlePreviewShowSubbody ?? true;
  const showBody = movie?.singlePreviewShowBody ?? true;
  const subtitleValue = movie?.note || subtitle;
  const subbodyClass = "mt-1 whitespace-pre-line text-[11px] font-normal leading-[1.4] text-white/72";
  const bodyClass = "mt-1 whitespace-pre-line text-[13px] font-normal leading-[1.42] text-white";
  const hasDetailText = (showSubbody && Boolean(subbody)) || showBody;

  if (variant === "spotlight") {
    return (
      <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-white">
        {backgroundCandidates[0] ? (
          <img
            alt=""
            src={backgroundCandidates[0]}
            data-fallback-index="0"
            onError={(event) => handleImageFallback(event, backgroundCandidates)}
            className="absolute inset-0 h-full w-full object-cover object-center blur-md"
            crossOrigin="anonymous"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/32" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_28%,rgba(0,0,0,0)_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.48)_0%,rgba(0,0,0,0.18)_25%,rgba(0,0,0,0.16)_52%,rgba(0,0,0,0.72)_100%)]" />

        <div className="relative z-[1] flex h-full flex-col items-center px-10 pb-10 pt-10 text-center">
          {/* <p style={titleFontStyle} className="text-[26px] font-black leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.48)]">
            {rank}??
          </p> */}

          <div className="flex min-h-0 flex-1 -translate-y-5 items-center justify-center py-5">
            <div className="w-[50%]">
              {imageCandidates[0] ? (
                <img
                  alt=""
                  src={imageCandidates[0]}
                  data-fallback-index="0"
                  onError={(event) => handleImageFallback(event, imageCandidates)}
                  className="w-full rounded-[0.25rem] object-cover shadow-[0_12px_28px_rgba(0,0,0,0.3)]"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="aspect-[2/3] w-full rounded-[0.25rem] bg-white/12" />
              )}
            </div>
          </div>

          <div className="flex w-full -translate-y-5 items-stretch gap-3 text-left">
            <span className="w-0.5 shrink-0 bg-red-500/90" />
            <div className="min-w-0 py-0.5">
              {showTitle ? (
                <p
                  style={{ ...titleFontStyle, fontSize: `${titleSize}px` }}
                  className="line-clamp-2 whitespace-pre-line text-left font-black leading-[1.14] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)] [word-break:keep-all]"
                >
                  {title || "영화를 추가하세요"}
                </p>
              ) : null}
              {subtitleValue ? (
                <p style={titleFontStyle} className="mt-2 text-left text-[11px] font-normal leading-tight text-white/88">
                  {subtitleValue}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-[2] px-10 pb-2">
          <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-white">
      {imageCandidates[0] ? (
        <img
          alt=""
          src={imageCandidates[0]}
          data-fallback-index="0"
          onError={(event) => handleImageFallback(event, imageCandidates)}
          className="absolute inset-0 h-full w-full object-cover object-center"
          crossOrigin="anonymous"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_38%,rgba(0,0,0,0.35)_68%,rgba(0,0,0,0.78)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-[1] px-10 pb-2 pt-24">
        <div className={["w-full text-left", hasDetailText ? "pb-1" : "pb-[36px]"].join(" ")}>
          <div className="flex flex-col justify-end" style={getTitleGroupStyle(titleSize)}>
            {showSubtitle ? <p style={titleFontStyle} className={["truncate", subtitleChipClass].join(" ")}>{subtitleValue || "설명 텍스트"}</p> : null}
            {showTitle ? (
              <div className="mt-2">
                <h1 style={{ ...titleFontStyle, fontSize: `${titleSize}px` }} className="min-w-0 flex-1 break-keep whitespace-pre-line font-black leading-[1.06] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.38)]">
                  {title || movie?.title || "영화를 추가하세요"}
                </h1>
              </div>
            ) : null}
          </div>
          {showSubbody && subbody ? <p style={titleFontStyle} className={subbodyClass}>{subbody}</p> : null}
          {showBody ? <p style={titleFontStyle} className={bodyClass}>{body || "?ш린???ㅻ챸???곸뼱二쇱꽭??\n??以꾧퉴吏 ?쒖떆?⑸땲??"}</p> : null}
        </div>
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
      </div>
    </div>
  );
}


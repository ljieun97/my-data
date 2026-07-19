import { CaptureMovie } from "@/context/CaptureContentContext";
import {
  buildImageCandidates,
  formatYear,
  getBackdropUrl,
  getPosterUrl,
  handleImageFallback,
  titleFontStyle,
} from "@/components/contents/capture/content-capture-utils";
import type { CSSProperties } from "react";

const serifTitleStyle = {
  fontFamily: '"RIDI Batang", "Batang", "Georgia", serif',
  letterSpacing: "-0.055em",
};

const rankingNumberStyle: CSSProperties = {
  fontFamily: '"Helvetica Neue", Arial, sans-serif',
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "0",
  lineHeight: 1,
};

export type TitleFontMode = "gmarket" | "serif";

export const titleColorOptions = [
  { key: "cream", label: "Cream", value: "#fff3d0" },
  { key: "ivory", label: "Ivory", value: "#fffaf0" },
  { key: "butter", label: "Butter", value: "#ffe7a8" },
  { key: "rose", label: "Rose", value: "#f7d7c8" },
  { key: "mist", label: "Mist", value: "#e8edf2" },
] as const;

export type TitleColorKey = (typeof titleColorOptions)[number]["key"];

export function getTitleColorValue(key: TitleColorKey) {
  return titleColorOptions.find((option) => option.key === key)?.value ?? titleColorOptions[0].value;
}

function getMovieImageCandidates(movie?: CaptureMovie) {
  return buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));
}

function EmptyBackdrop() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(135deg,#0f172a_0%,#020617_54%,#111827_100%)]" />
  );
}

function FilmToneOverlay({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_38%,rgba(255,236,190,0.1)_0%,rgba(58,31,16,0.12)_52%,rgba(0,0,0,0.2)_100%)] mix-blend-soft-light" />
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.13] [background-image:radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.8)_0_0.6px,transparent_0.8px),radial-gradient(circle_at_70%_60%,rgba(0,0,0,0.75)_0_0.7px,transparent_0.9px)] [background-size:7px_7px,11px_11px]" />
    </>
  );
}

const filmImageStyle = {
  filter: "contrast(1.08) saturate(0.86) sepia(0.14) brightness(0.96)",
};

function renderHeadlineWithHighlight(headline: string, highlightText: string, highlightColor: string) {
  const keyword = highlightText.trim();
  if (!keyword || !headline.includes(keyword)) return headline;

  const parts = headline.split(keyword);
  return parts.map((part, index) => (
    <span key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 ? <span style={{ color: highlightColor }}>{keyword}</span> : null}
    </span>
  ));
}

function renderGmarketHeadline(headline: string, highlightText: string, highlightColor: string) {
  const lines = headline.split("\n");
  return lines.map((line, index) => (
    <span key={`${line}-${index}`} className={index === 0 && lines.length > 1 ? "font-light" : "font-black"}>
      {renderHeadlineWithHighlight(line, highlightText, highlightColor)}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

function renderBodyHeadline(headline: string) {
  return headline.split("\n").map((line, index) => (
    <span key={`${line}-${index}`} className="block leading-none">
      <span className="inline bg-white px-1.5 pt-0.5 leading-[1.56] text-neutral-950">
        {line || " "}
      </span>
    </span>
  ));
}

function TitleBlock({
  headline,
  titleSize,
  titleColor,
  titleFontMode,
  highlightText,
  footerRight,
  bodyCard = false,
  shadowClass = "drop-shadow-[0_2px_10px_rgba(0,0,0,0.62)]",
}: {
  headline: string;
  titleSize: number;
  titleColor: string;
  titleFontMode: TitleFontMode;
  highlightText: string;
  footerRight: string;
  bodyCard?: boolean;
  shadowClass?: string;
}) {
  const isSerif = titleFontMode === "serif";
  const headlineStyle = isSerif ? serifTitleStyle : titleFontStyle;
  const headlineColor = isSerif ? "#fff3d0" : "#ffffff";
  const footerColor = bodyCard ? "#ffffff" : headlineColor;
  const hasHeadline = headline.length > 0;
  const content = isSerif || bodyCard
    ? bodyCard ? renderBodyHeadline(headline) : headline
    : renderGmarketHeadline(headline, highlightText, titleColor);

  return (
    <>
    {hasHeadline ? (
      <div className={bodyCard ? "text-left" : ""}>
        <h1
          style={{ ...headlineStyle, fontSize: `${titleSize}px` }}
          className={[
            "break-keep whitespace-pre-line leading-[1.08]",
            isSerif ? "font-black" : bodyCard ? "flex flex-col items-start gap-[2px] font-medium" : "",
            bodyCard ? "" : shadowClass,
          ].join(" ")}
        >
          {bodyCard ? content : <span style={{ color: headlineColor }}>{content}</span>}
        </h1>
      </div>
    ) : null}
    <p style={{ ...titleFontStyle, color: footerColor }} className="mt-3 text-[10px] font-semibold tracking-[0.01em] opacity-45">
      {footerRight || "35Film"}
    </p>
    </>
  );
}

export function NewsCoverTemplate({
  movie,
  headline,
  accentText,
  titleSize,
  titleColor,
  titleFontMode = "serif",
  highlightText = "",
  bodyCard = false,
  useFilmFilter,
  footerRight,
}: {
  movie?: CaptureMovie;
  headline: string;
  accentText: string;
  titleSize: number;
  titleColor: string;
  titleFontMode?: TitleFontMode;
  highlightText?: string;
  bodyCard?: boolean;
  useFilmFilter: boolean;
  footerRight: string;
}) {
  const imageCandidates = getMovieImageCandidates(movie);
  const headlineValue = headline.trim() || movie?.singlePreviewTitle || movie?.title || "영화 소식";
  const displayHeadline = bodyCard ? headline.trim() : headlineValue;
  const accentColor = titleFontMode === "serif" ? "#fff3d0" : "#ffffff";

  return (
    <div className="relative h-full overflow-hidden bg-neutral-950 text-white">
      {imageCandidates[0] ? (
        <img
          alt=""
          src={imageCandidates[0]}
          data-fallback-index="0"
          onError={(event) => handleImageFallback(event, imageCandidates)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `center ${movie?.imagePosition ?? 42}%`, ...(useFilmFilter ? filmImageStyle : {}) }}
          crossOrigin="anonymous"
        />
      ) : (
        <EmptyBackdrop />
      )}
      <FilmToneOverlay enabled={useFilmFilter} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.06)_42%,rgba(0,0,0,0.48)_78%,rgba(0,0,0,0.78)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 px-9 pb-8 text-center">
        <TitleBlock
          headline={displayHeadline}
          titleSize={titleSize}
          titleColor={titleColor}
          titleFontMode={titleFontMode}
          highlightText={highlightText}
          footerRight={footerRight}
          bodyCard={bodyCard}
        />
        {accentText ? (
          <p
            style={{ ...titleFontStyle, borderColor: `${accentColor}8c`, color: accentColor }}
            className="mt-4 inline-flex border px-3 py-1.5 text-[12px] font-bold leading-none tracking-[-0.02em] opacity-90"
          >
            {accentText}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function RankingCoverTemplate({
  movies,
  headline,
  titleSize,
  titleColor,
  titleFontMode = "gmarket",
  highlightText = "",
  useFilmFilter,
  footerRight,
  coverMovieId,
  coverRankText,
}: {
  movies: Array<CaptureMovie | undefined>;
  headline: string;
  titleSize: number;
  titleColor: string;
  titleFontMode?: TitleFontMode;
  highlightText?: string;
  useFilmFilter: boolean;
  footerRight: string;
  coverMovieId?: number;
  coverRankText?: string;
}) {
  const topMovie = movies[0];
  const coverMovie = coverMovieId ? movies.find((movie) => movie?.id === coverMovieId) ?? topMovie : topMovie;
  const imageCandidates = getMovieImageCandidates(coverMovie);
  const rankingRows = Array.from({ length: 10 }, (_, index) => movies[index]);
  const headlineValue = headline.trim() || `${topMovie?.title ?? "1위 작품"} 박스오피스 1위`;
  const coverRankTextValue = coverRankText?.trim();

  return (
    <div className="relative h-full overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-x-0 top-0 h-[58%] bg-neutral-950" />
      <div className="absolute inset-x-0 bottom-0 h-[52%] overflow-hidden bg-neutral-900">
        {imageCandidates[0] ? (
          <img
            alt=""
            src={imageCandidates[0]}
            data-fallback-index="0"
            onError={(event) => handleImageFallback(event, imageCandidates)}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: `center ${coverMovie?.imagePosition ?? 30}%`, ...(useFilmFilter ? filmImageStyle : {}) }}
            crossOrigin="anonymous"
          />
        ) : (
          <EmptyBackdrop />
        )}
        <FilmToneOverlay enabled={useFilmFilter} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.12)_46%,rgba(0,0,0,0.72)_100%)]" />
      </div>
      <div className="absolute inset-x-0 top-[42%] h-[18%] bg-[linear-gradient(180deg,#050505_0%,rgba(5,5,5,0.84)_36%,rgba(5,5,5,0)_100%)]" />
      <div className="absolute inset-x-0 top-0 bg-[#050505] px-8 pb-3 pt-4">
        <div className="space-y-[4px]">
          {rankingRows.map((movie, index) => (
            <div
              key={movie?.id ?? `ranking-placeholder-${index}`}
              className={[
                "grid grid-cols-[1.65rem_minmax(0,1fr)_4.4rem] items-baseline gap-1.5 py-[2px]",
              ].join(" ")}
            >
              <span style={rankingNumberStyle} className={["text-[12px] font-black tabular-nums", movie?.id === coverMovie?.id ? "text-white" : "text-white/42"].join(" ")}>
                {movie?.id === coverMovie?.id && coverRankTextValue ? coverRankTextValue : String(index + 1).padStart(2, "0")}
              </span>
              <p
                style={{ ...rankingNumberStyle, fontWeight: 500, transform: "translateY(0.35px)" }}
                className={["truncate text-[13px] font-medium", movie?.id === coverMovie?.id ? "text-white" : "text-white/42"].join(" ")}
              >
                {movie?.title ?? "영화를 추가하세요"}
              </p>
              <span className={["truncate text-right text-[10px] font-bold", movie?.id === coverMovie?.id ? "text-white" : "text-white/42"].join(" ")}>{movie ? formatYear(movie) : ""}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 px-9 pb-8 text-center">
        <TitleBlock
          headline={headlineValue}
          titleSize={titleSize}
          titleColor={titleColor}
          titleFontMode={titleFontMode}
          highlightText={highlightText}
          footerRight={footerRight}
          shadowClass="drop-shadow-[0_2px_12px_rgba(0,0,0,0.72)]"
        />
      </div>
    </div>
  );
}

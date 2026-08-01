import { CaptureMovie } from "@/context/CaptureContentContext";
import { CAPTURE_TEXT } from "@/lib/capture-defaults";
import type { CSSProperties, SyntheticEvent } from "react";

export function formatYear(movie: CaptureMovie) {
  if (!movie.release_date) return "";
  const releaseLabel = movie.release_date.trim();
  const yearMatch = releaseLabel.match(/^(\d{4})(?:-\d{2}-\d{2})?$/);
  return yearMatch ? yearMatch[1] : releaseLabel;
}

export function getExternalImageUrl(imagePath: string) {
  const normalizedPath = imagePath.startsWith("//") ? `https:${imagePath}` : imagePath;
  return `/api/proxy?url=${encodeURIComponent(normalizedPath)}`;
}

export function getBackdropUrl(movie?: CaptureMovie) {
  if (!movie?.backdrop_path) return "";
  if (isExternalImageUrl(movie.backdrop_path)) return getExternalImageUrl(movie.backdrop_path);
  return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
}

export function getPosterUrl(movie?: CaptureMovie) {
  if (!movie?.poster_path) return "";
  if (isExternalImageUrl(movie.poster_path)) return getExternalImageUrl(movie.poster_path);
  return `https://image.tmdb.org/t/p/original${movie.poster_path}`;
}

export function getPosterThumbUrl(posterPath?: string) {
  if (!posterPath) return "";
  if (isExternalImageUrl(posterPath)) return getExternalImageUrl(posterPath);
  return `https://image.tmdb.org/t/p/w185${posterPath}`;
}

export function isExternalImageUrl(imagePath?: string) {
  return Boolean(imagePath?.startsWith("http://") || imagePath?.startsWith("https://") || imagePath?.startsWith("//"));
}

export function buildImageCandidates(...values: Array<string | undefined>) {
  return values.filter((value, index, list): value is string => Boolean(value) && list.indexOf(value) === index);
}

export function handleImageFallback(event: SyntheticEvent<HTMLImageElement>, candidates: string[]) {
  const nextIndex = Number(event.currentTarget.dataset.fallbackIndex ?? "0") + 1;

  if (nextIndex >= candidates.length) {
    event.currentTarget.onerror = null;
    event.currentTarget.style.display = "none";
    return;
  }

  event.currentTarget.dataset.fallbackIndex = String(nextIndex);
  event.currentTarget.src = candidates[nextIndex];
}

export const titleFontStyle: CSSProperties = {
  fontFamily: '"Gmarket Sans", "지마켓 산스", sans-serif',
  letterSpacing: "-0.02em",
};

export function getTitleBlockStyle(titleSize: number): CSSProperties {
  return {
    minHeight: `${Math.round(titleSize * 2.12)}px`,
  };
}

export function getTitleGroupStyle(titleSize: number): CSSProperties {
  return {
    minHeight: `${Math.round(titleSize * 2.7)}px`,
  };
}

export function getTextOverlayClass(textPosition: "top" | "center" | "bottom") {
  if (textPosition === "top") {
    return "bg-[linear-gradient(180deg,rgba(0,0,0,0.46)_0%,rgba(0,0,0,0.18)_28%,rgba(0,0,0,0)_58%)]";
  }

  if (textPosition === "center") {
    return "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.2)_28%,rgba(0,0,0,0.42)_50%,rgba(0,0,0,0.2)_72%,rgba(0,0,0,0)_100%)]";
  }

  return "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_38%,rgba(0,0,0,0.35)_68%,rgba(0,0,0,0.78)_100%)]";
}

export function CaptureFooter({
  footerRight,
}: {
  footerLeft: string;
  footerRight: string;
  borderless?: boolean;
}) {
  return (
    <footer className="pt-0 text-center">
      <span className="text-[10px] font-semibold tracking-[0.03em] text-white/45">{footerRight || CAPTURE_TEXT.footerRight}</span>
    </footer>
  );
}

export function CaptureHeadlineBlock({
  title,
  titleSize,
  subtitle,
  subtitlePlacement = "inline",
  subtitleTone = "dark",
}: {
  title: string;
  titleSize: number;
  subtitle?: string;
  subtitlePlacement?: "inline" | "below";
  subtitleTone?: "dark" | "light";
}) {
  const subtitleValue = subtitle?.trim();

  return (
    <div className="-mx-4 flex flex-col items-start">
      <div className="flex items-end justify-start">
        <div className="inline-flex max-w-full items-end gap-2 rounded-l-none rounded-r-[1.1rem] bg-white pb-0.5 pl-4 pr-4 pt-1.5">
          <h1
            style={{ ...titleFontStyle, fontSize: `${titleSize}px` }}
            className="min-w-0 break-keep whitespace-pre-line pl-[2px] text-left font-black leading-[0.94] tracking-[-0.095em] text-slate-950 [text-shadow:0_1px_0_rgba(255,255,255,0.3)]"
          >
            {title}
          </h1>
          {subtitlePlacement === "inline" && subtitleValue ? (
            <span
              style={titleFontStyle}
              className="shrink-0 whitespace-pre-line pb-0.5 pl-[2px] text-right text-[10px] font-black leading-[1.05] tracking-[-0.03em] text-slate-500"
            >
              {subtitleValue}
            </span>
          ) : null}
        </div>
      </div>
      {subtitlePlacement === "below" && subtitleValue ? (
        <p
          style={titleFontStyle}
          className={[
            "ml-4 mt-1.5 max-w-[calc(100%-1.5rem)] truncate pl-[2px] text-left text-[10px] font-black leading-[1.15] tracking-[-0.03em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.48)]",
            subtitleTone === "light" ? "text-white/72" : "text-slate-500",
          ].join(" ")}
        >
          {subtitleValue}
        </p>
      ) : null}
    </div>
  );
}

export function CaptureV2Header({
  title,
  titleSize,
  dateLabel,
}: {
  title: string;
  titleSize: number;
  dateLabel?: string;
}) {
  return <CaptureHeadlineBlock title={title} titleSize={titleSize} subtitle={dateLabel} />;
}

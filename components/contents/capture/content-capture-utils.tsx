import { CaptureMovie, CapturePerson } from "@/context/CaptureContentContext";
import type { CSSProperties, SyntheticEvent } from "react";

export type ProviderLogoOption = {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
};

export function formatYear(movie: CaptureMovie) {
  return movie.release_date ? movie.release_date.slice(0, 4) : "";
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
  return `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
}

export function getPosterThumbUrl(posterPath?: string) {
  if (!posterPath) return "";
  if (isExternalImageUrl(posterPath)) return getExternalImageUrl(posterPath);
  return `https://image.tmdb.org/t/p/w185${posterPath}`;
}

export function getProfileUrl(profilePath?: string) {
  if (!profilePath) return "";
  if (isExternalImageUrl(profilePath)) return getExternalImageUrl(profilePath);
  return `https://image.tmdb.org/t/p/original${profilePath}`;
}

export function getProfileThumbUrl(profilePath?: string) {
  if (!profilePath) return "";
  if (isExternalImageUrl(profilePath)) return getExternalImageUrl(profilePath);
  return `https://image.tmdb.org/t/p/w185${profilePath}`;
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

export function getCalendarPosterUrl(item: any) {
  const raw = String(item?.poster_path ?? item?.posterPath ?? item?.poster ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return `https://image.tmdb.org/t/p/w500${raw}`;
  return "";
}

export function getCalendarBackdropUrl(item: any) {
  const raw = String(item?.backdrop_path ?? item?.backdropPath ?? item?.backdrop ?? item?.src ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return `https://image.tmdb.org/t/p/original${raw}`;
  return "";
}

export function formatEnglishMonthBadge(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date).toUpperCase();
}

export function formatEnglishDateBadge(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(date).toUpperCase();
}

export function formatReleaseBoardDate(value: string) {
  return value.trim();
}

export function getProviderLogoUrl(logoPath?: string | null) {
  if (!logoPath) return "";
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) return logoPath;
  return `https://image.tmdb.org/t/p/w185${logoPath}`;
}

export function getReleaseBoardAutoDate(movie?: CaptureMovie) {
  const rawDate = String(movie?.release_date ?? "").slice(0, 10);
  if (!rawDate) return "";

  const [year, month, day] = rawDate.split("-").map(Number);
  if (!year || !month || !day) return "";

  return `${month}/${day}`;
}

export const RELEASE_BOARD_DEFAULT_COLORS = [
  "#b91c1c",
  "#315f90",
  "#374151",
  "#111827",
  "#d14d72",
  "#7c1d5a",
  "#caa13f",
  "#ea6b00",
];

export function toSafeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, "-").trim().replace(/\s+/g, " ");
}

export function CaptureFooter({
  footerRight,
}: {
  footerLeft: string;
  footerRight: string;
  borderless?: boolean;
}) {
  return (
    <footer className="pt-0.5 text-center">
      <span className="text-[10px] font-semibold tracking-[0.01em] text-white/72">{footerRight || "35Film"}</span>
    </footer>
  );
}

export type SubtitleChipTone = "burgundy" | "navy" | "slate" | "olive" | "amber";

export const subtitleChipToneOptions: Array<{ key: SubtitleChipTone; label: string; swatchClass: string }> = [
  { key: "burgundy", label: "Burgundy", swatchClass: "bg-rose-900" },
  { key: "navy", label: "Navy", swatchClass: "bg-sky-950" },
  { key: "slate", label: "Slate", swatchClass: "bg-slate-900" },
  { key: "olive", label: "Olive", swatchClass: "bg-lime-900" },
  { key: "amber", label: "Amber", swatchClass: "bg-amber-500" },
];

export function getCoverSubtitleClass(tone: SubtitleChipTone) {
  const base =
    "inline-flex w-fit max-w-full self-start rounded-full px-3 pb-[4px] pt-[5px] text-[12px] font-medium leading-none tracking-[-0.01em]";

  if (tone === "navy") {
    return `${base} border border-sky-300/18 bg-sky-950/38 text-white shadow-[0_4px_14px_rgba(8,47,73,0.18)]`;
  }

  if (tone === "slate") {
    return `${base} border border-slate-200/14 bg-slate-950/44 text-white shadow-[0_4px_14px_rgba(2,6,23,0.2)]`;
  }

  if (tone === "olive") {
    return `${base} border border-lime-200/16 bg-lime-950/40 text-white shadow-[0_4px_14px_rgba(26,46,5,0.18)]`;
  }

  if (tone === "amber") {
    return `${base} border border-amber-200/16 bg-amber-950/34 text-white shadow-[0_4px_14px_rgba(120,53,15,0.16)]`;
  }

  return `${base} border border-rose-200/16 bg-rose-950/42 text-white shadow-[0_4px_14px_rgba(76,5,25,0.18)]`;
}

export function getDualPersonTitle(persons: CapturePerson[]) {
  if (!persons.length) return "인물 이름";
  return persons.map((person) => person.name).join(" & ");
}


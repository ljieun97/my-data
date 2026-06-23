"use client";

import Title from "@/components/common/title";
import { CalendarCaptureControls } from "@/components/contents/content-capture-calendar-controls";
import { CaptureSizeControls, CaptureTextArea, CaptureToggleButton } from "@/components/contents/content-capture-controls";
import CalendarView from "@/components/contents/calendar-view";
import { MovieSlotsPanel } from "@/components/contents/content-capture-movie-controls";
import { CAPTURE_PERSON_MAX_COUNT, CaptureMovie, CapturePerson, getCaptureMovieMaxCount, useCaptureContent } from "@/context/CaptureContentContext";
import { faDownload, faRotateLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, SyntheticEvent } from "react";

type ProviderLogoOption = {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
};

function formatYear(movie: CaptureMovie) {
  return movie.release_date ? movie.release_date.slice(0, 4) : "";
}

function getBackdropUrl(movie?: CaptureMovie) {
  if (!movie?.backdrop_path) return "";
  return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
}

function getPosterUrl(movie?: CaptureMovie) {
  if (!movie?.poster_path) return "";
  return `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
}

function getPosterThumbUrl(posterPath?: string) {
  if (!posterPath) return "";
  return `https://image.tmdb.org/t/p/w185${posterPath}`;
}

function getProfileUrl(profilePath?: string) {
  if (!profilePath) return "";
  if (profilePath.startsWith("http://") || profilePath.startsWith("https://")) return `/api/proxy?url=${encodeURIComponent(profilePath)}`;
  if (profilePath.startsWith("//")) return `/api/proxy?url=${encodeURIComponent(`https:${profilePath}`)}`;
  return `https://image.tmdb.org/t/p/original${profilePath}`;
}

function getProfileThumbUrl(profilePath?: string) {
  if (!profilePath) return "";
  if (profilePath.startsWith("http://") || profilePath.startsWith("https://")) return `/api/proxy?url=${encodeURIComponent(profilePath)}`;
  if (profilePath.startsWith("//")) return `/api/proxy?url=${encodeURIComponent(`https:${profilePath}`)}`;
  return `https://image.tmdb.org/t/p/w185${profilePath}`;
}

function isExternalImageUrl(imagePath?: string) {
  return Boolean(imagePath?.startsWith("http://") || imagePath?.startsWith("https://") || imagePath?.startsWith("//"));
}

function buildImageCandidates(...values: Array<string | undefined>) {
  return values.filter((value, index, list): value is string => Boolean(value) && list.indexOf(value) === index);
}

function handleImageFallback(event: SyntheticEvent<HTMLImageElement>, candidates: string[]) {
  const nextIndex = Number(event.currentTarget.dataset.fallbackIndex ?? "0") + 1;

  if (nextIndex >= candidates.length) {
    event.currentTarget.onerror = null;
    event.currentTarget.style.display = "none";
    return;
  }

  event.currentTarget.dataset.fallbackIndex = String(nextIndex);
  event.currentTarget.src = candidates[nextIndex];
}

const titleFontStyle: CSSProperties = {
  fontFamily: '"Gmarket Sans", "지마켓 산스", sans-serif',
  letterSpacing: "-0.02em",
};

function getTitleBlockStyle(titleSize: number): CSSProperties {
  return {
    minHeight: `${Math.round(titleSize * 2.12)}px`,
  };
}

function getTitleGroupStyle(titleSize: number): CSSProperties {
  return {
    minHeight: `${Math.round(titleSize * 2.7)}px`,
  };
}

function getTextOverlayClass(textPosition: "top" | "center" | "bottom") {
  if (textPosition === "top") {
    return "bg-[linear-gradient(180deg,rgba(0,0,0,0.46)_0%,rgba(0,0,0,0.18)_28%,rgba(0,0,0,0)_58%)]";
  }

  if (textPosition === "center") {
    return "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.2)_28%,rgba(0,0,0,0.42)_50%,rgba(0,0,0,0.2)_72%,rgba(0,0,0,0)_100%)]";
  }

  return "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_38%,rgba(0,0,0,0.35)_68%,rgba(0,0,0,0.78)_100%)]";
}

function getCalendarPosterUrl(item: any) {
  const raw = String(item?.poster_path ?? item?.posterPath ?? item?.poster ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return `https://image.tmdb.org/t/p/w500${raw}`;
  return "";
}

function getCalendarBackdropUrl(item: any) {
  const raw = String(item?.backdrop_path ?? item?.backdropPath ?? item?.backdrop ?? item?.src ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return `https://image.tmdb.org/t/p/original${raw}`;
  return "";
}

function formatEnglishMonthBadge(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date).toUpperCase();
}

function formatEnglishDateBadge(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(date).toUpperCase();
}

function formatReleaseBoardDate(value: string) {
  return value.trim();
}

function getProviderLogoUrl(logoPath?: string | null) {
  if (!logoPath) return "";
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) return logoPath;
  return `https://image.tmdb.org/t/p/w185${logoPath}`;
}

function getReleaseBoardAutoDate(movie?: CaptureMovie) {
  const rawDate = String(movie?.release_date ?? "").slice(0, 10);
  if (!rawDate) return "";

  const [year, month, day] = rawDate.split("-").map(Number);
  if (!year || !month || !day) return "";

  return `${month}/${day}`;
}

const RELEASE_BOARD_DEFAULT_COLORS = [
  "#b91c1c",
  "#315f90",
  "#374151",
  "#111827",
  "#d14d72",
  "#7c1d5a",
  "#caa13f",
  "#ea6b00",
];

function toSafeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, "-").trim().replace(/\s+/g, " ");
}

function CaptureFooter({
  footerRight,
}: {
  footerLeft: string;
  footerRight: string;
  borderless?: boolean;
}) {
  return (
    <footer className="pt-0.5 text-center">
      <span className="text-[10px] font-semibold tracking-[0.01em] text-white/72">{footerRight || "@scena.kr"}</span>
    </footer>
  );
}

type SubtitleChipTone = "burgundy" | "navy" | "slate" | "olive" | "amber";

const subtitleChipToneOptions: Array<{ key: SubtitleChipTone; label: string; swatchClass: string }> = [
  { key: "burgundy", label: "Burgundy", swatchClass: "bg-rose-900" },
  { key: "navy", label: "Navy", swatchClass: "bg-sky-950" },
  { key: "slate", label: "Slate", swatchClass: "bg-slate-900" },
  { key: "olive", label: "Olive", swatchClass: "bg-lime-900" },
  { key: "amber", label: "Amber", swatchClass: "bg-amber-500" },
];

function getCoverSubtitleClass(tone: SubtitleChipTone) {
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

function getDualPersonTitle(persons: CapturePerson[]) {
  if (!persons.length) return "인물 이름";
  return persons.map((person) => person.name).join(" & ");
}

function MovieCaptureRow({
  movie,
  index,
  rounded = true,
  stackCount = 5,
  bottomAligned = false,
}: {
  movie?: CaptureMovie;
  index: number;
  rounded?: boolean;
  stackCount?: number;
  bottomAligned?: boolean;
}) {
  const imageCandidates = buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));
  const noteValue = movie?.note ?? "";
  const textSizeClass = stackCount >= 8 ? "text-[13px]" : stackCount >= 6 ? "text-[14px]" : "text-[16px]";
  const objectPosition = `center ${movie?.imagePosition ?? 20}%`;

  return (
    <div className={["relative min-h-0 flex-1 overflow-hidden bg-slate-900 text-white", rounded ? "rounded-md" : "rounded-none"].join(" ")}>
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

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.10)_28%,rgba(0,0,0,0)_58%,rgba(0,0,0,0.18)_100%)]" />
      <div
        className={[
          "absolute inset-0",
          bottomAligned
            ? "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_42%,rgba(0,0,0,0.32)_72%,rgba(0,0,0,0.68)_100%)]"
            : "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_46%,rgba(0,0,0,0.14)_100%)]",
        ].join(" ")}
      />

      <div className={["items-stretch relative z-[1] flex gap-2 p-[17px]", bottomAligned ? "items-end" : "items-start"].join(" ")}>
        {/* <div className="flex w-8 shrink-0 items-baseline">
          <span className="text-xl font-black leading-tight text-white drop-shadow">
            {index + 1}위
          </span>
        </div> */}
        <span className="w-0.5 shrink-0 bg-amber-400/90" />
        <div className="min-w-0 flex-1">
          <p
            style={titleFontStyle}
            className={[
              "leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.52)] break-normal",
              bottomAligned ? "line-clamp-2 whitespace-normal" : "truncate",
              textSizeClass,
            ].join(" ")}
          >
            {movie?.title ?? "영화를 추가하세요"}
            <br/>
            {movie?.note ? (
              <span className={"text-[11px] text-white/72"}>{noteValue}</span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}

function MovieListTemplate({
  slots,
  title,
  titleSize,
  variant,
  columns,
  footerLeft,
  footerRight,
}: {
  slots: Array<CaptureMovie | undefined>;
  title: string;
  titleSize: number;
  variant: "default" | "edge";
  columns: 1 | 2;
  footerLeft: string;
  footerRight: string;
}) {
  const isEdgeVariant = variant === "edge";
  const isTwoColumn = columns === 2;
  const leftSlots = isTwoColumn ? slots.filter((_, index) => index % 2 === 0) : slots;
  const rightSlots = isTwoColumn ? slots.filter((_, index) => index % 2 === 1) : [];

  return (
    <div className="relative flex h-full flex-col bg-slate-950 text-white">
      {!isEdgeVariant && title ? (
        <div className="px-[26px] py-4">
          <div className="flex items-end justify-center">
            <h1 style={{ ...titleFontStyle, fontSize: `${titleSize}px` }} className="break-keep whitespace-pre-line text-center font-black leading-[1.08] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.38)]">
              {title}
            </h1>
          </div>
        </div>
      ) : null}
      <div
        className={[
          "min-h-0 flex-1 bg-slate-950",
          isTwoColumn ? "grid grid-cols-2" : "flex flex-col",
          isEdgeVariant ? "gap-0 px-0 pt-0" : "gap-1 px-[26px] pt-0",
        ].join(" ")}
      >
        <div className={["flex min-h-0 flex-1 flex-col", isEdgeVariant ? "gap-0" : "gap-1"].join(" ")}>
          {leftSlots.map((movie, index) => (
            <MovieCaptureRow
              key={movie?.id ?? `preview-left-${index}`}
              movie={movie}
              index={index}
              rounded={!isEdgeVariant}
              stackCount={leftSlots.length}
              bottomAligned={isTwoColumn}
            />
          ))}
        </div>
        {isTwoColumn ? (
          <div className={["flex min-h-0 flex-1 flex-col", isEdgeVariant ? "gap-0" : "gap-1"].join(" ")}>
            {rightSlots.map((movie, index) => (
              <MovieCaptureRow
                key={movie?.id ?? `preview-right-${index * 2 + 1}`}
                movie={movie}
                index={index * 2 + 1}
                rounded={!isEdgeVariant}
                stackCount={rightSlots.length}
                bottomAligned={isTwoColumn}
              />
            ))}
          </div>
        ) : null}
      </div>

      {isEdgeVariant ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] px-0 pb-1">
          <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
        </div>
      ) : (
        <div className="px-[26px] pb-1">
          <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
        </div>
      )}
    </div>
  );
}

function SingleMovieTemplate({
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
  const body = movie?.singlePreviewBody ?? movie?.overview ?? "여기에 설명을 적어주세요.\n네 줄까지 표시됩니다.";
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

        <div className="relative z-[1] flex h-full flex-col items-center px-7 pb-10 pt-10 text-center">
          <p style={titleFontStyle} className="text-[26px] font-black leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.48)]">
            {rank}위
          </p>

          <div className="flex min-h-0 flex-1 -translate-y-5 items-center justify-center py-5">
            <div className="w-[42%]">
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
        <div className="absolute inset-x-0 bottom-0 z-[2] px-7 pb-1">
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
      <div className="absolute inset-x-0 bottom-0 z-[1] px-7 pb-1 pt-24">
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
          {showBody ? <p style={titleFontStyle} className={bodyClass}>{body || "여기에 설명을 적어주세요.\n네 줄까지 표시됩니다."}</p> : null}
        </div>
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
      </div>
    </div>
  );
}

function PersonCoverTemplate({
  persons,
  headline,
  titleSize,
  kicker,
  subtitleChipClass,
  subbody,
  body,
  showTitle,
  showSubtitle,
  showSubbody,
  showBody,
  footerLeft,
  footerRight,
}: {
  persons: CapturePerson[];
  headline: string;
  titleSize: number;
  kicker: string;
  subtitleChipClass: string;
  subbody: string;
  body: string;
  showTitle: boolean;
  showSubtitle: boolean;
  showSubbody: boolean;
  showBody: boolean;
  footerLeft: string;
  footerRight: string;
}) {
  const primaryPerson = persons[0] ?? null;
  const secondaryPerson = persons[1] ?? null;
  const tertiaryPerson = persons[2] ?? null;
  const profileUrl = getProfileUrl(primaryPerson?.profile_path);
  const secondaryProfileUrl = getProfileUrl(secondaryPerson?.profile_path);
  const tertiaryProfileUrl = getProfileUrl(tertiaryPerson?.profile_path);
  const bodyValue = body || primaryPerson?.biography || "";
  const isDualLayout = Boolean(primaryPerson && secondaryPerson);
  const isTripleLayout = Boolean(primaryPerson && secondaryPerson && tertiaryPerson);
  const hasDetailText = (showSubbody && Boolean(subbody)) || (showBody && Boolean(bodyValue));

  return (
    <div className="relative h-full overflow-hidden bg-slate-950 text-white">
      {isTripleLayout ? (
        <div className="absolute inset-0 flex">
          {[
            { person: primaryPerson, url: profileUrl },
            { person: secondaryPerson, url: secondaryProfileUrl },
            { person: tertiaryPerson, url: tertiaryProfileUrl },
          ].map(({ person, url }) => (
            <div key={person?.id} className="h-full w-1/3 bg-slate-900">
              {url ? (
                <img
                  alt=""
                  src={url}
                  className="h-full w-full object-cover object-bottom"
                  crossOrigin={isExternalImageUrl(person?.profile_path) ? undefined : "anonymous"}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : isDualLayout ? (
        <>
          {profileUrl ? (
            <img
              alt=""
              src={profileUrl}
              className="absolute inset-y-0 left-0 h-full w-1/2 object-cover object-bottom"
              crossOrigin={isExternalImageUrl(primaryPerson?.profile_path) ? undefined : "anonymous"}
            />
          ) : null}
          {secondaryProfileUrl ? (
            <img
              alt=""
              src={secondaryProfileUrl}
              className="absolute inset-y-0 right-0 h-full w-1/2 object-cover object-bottom"
              crossOrigin={isExternalImageUrl(secondaryPerson?.profile_path) ? undefined : "anonymous"}
            />
          ) : null}
        </>
      ) : profileUrl ? (
        <img
          alt=""
          src={profileUrl}
          className="absolute inset-0 h-full w-full object-cover object-bottom"
          crossOrigin={isExternalImageUrl(primaryPerson?.profile_path) ? undefined : "anonymous"}
        />
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.04)_38%,rgba(0,0,0,0.35)_68%,rgba(0,0,0,0.78)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-[1] px-7 pb-1 pt-24">
        <div className={hasDetailText ? "pb-1" : "pb-[36px]"}>
          <div className="flex flex-col justify-end" style={getTitleGroupStyle(titleSize)}>
            {showSubtitle ? <p style={titleFontStyle} className={subtitleChipClass}>{kicker || "TOVIE PERSON"}</p> : null}
            {showTitle ? (
              <div className="mt-2">
                <h1 style={{ ...titleFontStyle, fontSize: `${titleSize}px` }} className="break-keep whitespace-pre-line font-black leading-[1.06] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.38)]">
                  {headline || getDualPersonTitle(persons)}
                </h1>
              </div>
            ) : null}
          </div>
          {showSubbody && subbody ? (
            <p style={titleFontStyle} className="mt-1 whitespace-pre-line text-[11px] font-normal leading-[1.4] text-white/72">
              {subbody}
            </p>
          ) : null}
          {showBody && bodyValue ? (
            <p style={titleFontStyle} className="mt-1 whitespace-pre-line text-[13px] font-normal leading-[1.42] text-white">
              {bodyValue}
            </p>
          ) : null}
        </div>
        <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
      </div>
    </div>
  );
}

function CalendarCoverTemplate({
  results,
  option,
  title,
  titleSize,
  showTitle,
  footerLeft,
  footerRight,
}: {
  results: any[];
  option: any;
  title: string;
  titleSize: number;
  showTitle: boolean;
  footerLeft: string;
  footerRight: string;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-white text-slate-900">
      <CalendarView results={results} option={option} hideCaptureButton embedCalendarOnly />
      <div
        className={[
          "pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex flex-col justify-end px-7 pb-1 pt-24",
          showTitle ? "" : "bg-gradient-to-t from-black/18 via-black/0 to-transparent",
        ].join(" ")}
      >
        {showTitle ? (
          <div className="mt-2 flex items-end" style={getTitleBlockStyle(titleSize)}>
            <h1 style={{ ...titleFontStyle, fontSize: `${titleSize}px` }} className="inline-flex w-fit break-keep whitespace-pre-line bg-black px-3 py-2 font-black leading-[1.06] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.38)]">
              {title || "TOVIE CALENDAR"}
            </h1>
          </div>
        ) : null}
        {showTitle ? (
          <div className="h-[36px]" aria-hidden="true" />
        ) : (
          <CaptureFooter footerLeft={footerLeft} footerRight={footerRight} />
        )}
      </div>
    </div>
  );
}

function CalendarDayPreviewTemplate({
  dateKey,
  items,
  footerLeft,
  footerRight,
}: {
  dateKey: string;
  items: any[];
  footerLeft: string;
  footerRight: string;
}) {
  const date = new Date(`${dateKey}T00:00:00`);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const showBackdropGrid = items.length >= 2;
  const isDense = items.length >= 4;
  const leadTitle = String(items[0]?.title ?? "");

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 z-[2] h-12 bg-gradient-to-b from-black/36 via-black/12 to-transparent px-7">
        <div className="flex h-full items-center justify-between gap-3">
          <p style={titleFontStyle} className="text-[14px] font-black leading-tight text-white">{date.getMonth() + 1}월 {date.getDate()}일 ({weekdays[date.getDay()]})</p>
          <span className="shrink-0 text-[11px] font-bold text-white">@scena.kr</span>
        </div>
      </div>

      {showBackdropGrid ? (
        <div className={["absolute inset-x-0 top-12 bottom-0 grid", isDense ? "grid-cols-2" : "grid-cols-1"].join(" ")}>
          {items.map((item, idx) => {
            const backdrop = getCalendarBackdropUrl(item);
            const title = String(item?.title ?? "");
            const isLastOddWide = isDense && items.length % 2 === 1 && idx === items.length - 1;
            return (
              <div key={`${dateKey}-${idx}`} className={["relative overflow-hidden bg-slate-800", isLastOddWide ? "col-span-2" : ""].join(" ")}>
                {backdrop ? (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${backdrop})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center top",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_56%,rgba(0,0,0,0.34)_100%)]" />
                <p style={titleFontStyle} className="absolute inset-x-2 bottom-2 z-[1] line-clamp-2 whitespace-normal text-center [word-break:keep-all] text-[12px] font-bold leading-tight text-white">{title}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="absolute inset-x-0 top-12 bottom-0 bg-slate-900">
          {getCalendarPosterUrl(items[0]) || getCalendarBackdropUrl(items[0]) ? (
            <img
              alt=""
              src={getCalendarPosterUrl(items[0]) || getCalendarBackdropUrl(items[0])}
              className="block h-full w-full object-cover object-top"
              crossOrigin="anonymous"
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.03)_42%,rgba(0,0,0,0.44)_100%)]" />
        </div>
      )}

      <div className={["pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/44 via-black/12 to-transparent px-7 pb-6 pt-0"].join(" ")}>
        {!showBackdropGrid ? (
          <h2 style={titleFontStyle} className="mb-0 whitespace-pre-line [word-break:keep-all] text-[36px] font-black leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.38)]">
            {leadTitle}
          </h2>
        ) : null}
      </div>
    </div>
  );
}

function CalendarReleaseBoardTemplate({
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
          <span className="text-[10px] font-semibold tracking-[0.01em] text-white/92">@scena.kr</span>
        </div>
      </div>
    </div>
  );
}

export default function ContentCapturePage() {
  const {
    captureMode,
    setCaptureMode,
    selectedMovies,
    selectedPerson,
    selectedPersons,
    removeMovie,
    removePerson,
    reorderMovie,
    updateMovieTitle,
    updateMovieNote,
    updateMovieImagePosition,
    updateMovieProviderLogo,
    updateMoviePoster,
    updateMovieSinglePreview,
    updatePersonProfilePath,
    clearMovies,
    clearPerson,
  } = useCaptureContent();
  const captureRef = useRef<HTMLDivElement | null>(null);
  const singleMovieCaptureRef = useRef<HTMLDivElement | null>(null);
  const personCaptureRef = useRef<HTMLDivElement | null>(null);
  const calendarCaptureRef = useRef<HTMLDivElement | null>(null);
  const calendarReleaseCaptureRef = useRef<HTMLDivElement | null>(null);
  const calendarDayPreviewCaptureRef = useRef<HTMLDivElement | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const [personTitle, setPersonTitle] = useState("인물 이름");
  const [personSubtitle, setPersonSubtitle] = useState("관객수가 증명한 배우");
  const [personSubbody, setPersonSubbody] = useState("");
  const [personBody, setPersonBody] = useState("");
  const [personShowTitle, setPersonShowTitle] = useState(true);
  const [personShowSubtitle, setPersonShowSubtitle] = useState(false);
  const [personShowSubbody, setPersonShowSubbody] = useState(true);
  const [personShowBody, setPersonShowBody] = useState(true);
  const [movieListTitle, setMovieListTitle] = useState("영화 목록");
  const [movieListTitleSize, setMovieListTitleSize] = useState(16);
  const [movieListVariant, setMovieListVariant] = useState<"default" | "edge">("default");
  const [movieListColumns, setMovieListColumns] = useState<1 | 2>(1);
  const [subtitleChipTone, setSubtitleChipTone] = useState<SubtitleChipTone>("burgundy");
  const [singlePreviewTitleSize, setSinglePreviewTitleSize] = useState(28);
  const [singlePreviewVariant, setSinglePreviewVariant] = useState<"default" | "spotlight">("default");
  const [personTitleSize, setPersonTitleSize] = useState(28);
  const [footerLeft, setFooterLeft] = useState("셰나코리아");
  const [footerRight, setFooterRight] = useState("@scena.kr");
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewMovieIndex, setPreviewMovieIndex] = useState(0);
  const [releaseBoardPreviewIndex, setReleaseBoardPreviewIndex] = useState(0);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [didCopyText, setDidCopyText] = useState(false);
  const [calendarResults, setCalendarResults] = useState<any[]>([]);
  const [calendarOption, setCalendarOption] = useState<any>({ initialView: "dayGridMonth" });
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState("");
  const [calendarTitle, setCalendarTitle] = useState(`${new Date().getMonth() + 1}월 개봉 일정`);
  const [calendarTitleSize, setCalendarTitleSize] = useState(28);
  const [showCalendarTitle, setShowCalendarTitle] = useState(true);
  const [calendarPreviewDateKey, setCalendarPreviewDateKey] = useState("");
  const [calendarReleaseTitle, setCalendarReleaseTitle] = useState("6월 개봉예정 영화 라인업");
  const [calendarReleaseTitleSize, setCalendarReleaseTitleSize] = useState(23);
  const [calendarReleaseLabelColors, setCalendarReleaseLabelColors] = useState(RELEASE_BOARD_DEFAULT_COLORS);
  const [calendarReleaseDates, setCalendarReleaseDates] = useState(() => Array.from({ length: 8 }, () => ""));
  const [releaseBoardProviderOptions, setReleaseBoardProviderOptions] = useState<ProviderLogoOption[]>([]);
  const subtitleChipClass = getCoverSubtitleClass(subtitleChipTone);

  const isPersonMode = captureMode === "person-cover";
  const isMovieListMode = captureMode === "movie-list";
  const isCalendarMode = captureMode === "calendar";
  const isCalendarReleaseMode = captureMode === "calendar-release";
  const isCalendarDataMode = isCalendarMode;
  const isMovieMode = isMovieListMode || isCalendarReleaseMode;
  const movieMinCount = 3;
  const movieMaxCount = getCaptureMovieMaxCount(captureMode);
  const movieSlotCount = Math.min(Math.max(selectedMovies.length, movieMinCount), movieMaxCount);
  const currentSingleMovie = selectedMovies[previewMovieIndex];
  const calendarPreviewGroups = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const groups = new Map<string, any[]>();

    calendarResults.forEach((item: any) => {
      const type = String(item?.type ?? "");
      const title = String(item?.title ?? "");
      const isHoliday = type.includes("공휴일") || title.includes("공휴일") || type.includes("대체공휴일") || title.includes("대체공휴일");
      const isAdmin = type === "관리자";
      if (isHoliday || isAdmin) return;

      const dateKey = String(item?.release_date ?? item?.start ?? "").slice(0, 10);
      if (!dateKey) return;
      const date = new Date(`${dateKey}T00:00:00`);
      if (date.getFullYear() !== currentYear || date.getMonth() !== currentMonth) return;
      if (!(item?.backdrop_path ?? item?.backdropPath)) return;
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)?.push(item);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, items]) => ({ dateKey, items }))
      .filter((group) => group.items.length > 0);
  }, [calendarResults]);
  const activeCalendarPreview =
    calendarPreviewGroups.find((group) => group.dateKey === calendarPreviewDateKey) ?? calendarPreviewGroups[0] ?? null;
  const releaseBoardSlots = Array.from({ length: 8 }, (_, index) => selectedMovies[index]);
  const releaseBoardDateLabels = releaseBoardSlots.map((movie, index) => formatReleaseBoardDate(calendarReleaseDates[index]) || getReleaseBoardAutoDate(movie));
  const currentReleaseBoardMovie = releaseBoardSlots[releaseBoardPreviewIndex];
  const currentReleaseBoardProviderOptions = releaseBoardProviderOptions;

  useEffect(() => {
    if (selectedPersons.length === 1 && selectedPersons[0]?.name) {
      setPersonTitle(selectedPersons[0].name);
      return;
    }
    if (selectedPersons.length >= 2) {
      setPersonTitle(getDualPersonTitle(selectedPersons));
    }
  }, [movieSlotCount, selectedPersons]);

  useEffect(() => {
    setPersonBody(selectedPerson?.biography || "");
  }, [selectedPerson?.id, selectedPerson?.biography]);

  useEffect(() => {
    if (!selectedMovies.length) {
      setPreviewMovieIndex(0);
      return;
    }

    setPreviewMovieIndex((current) => Math.min(current, selectedMovies.length - 1));
  }, [selectedMovies.length]);

  useEffect(() => {
    if (!isCalendarReleaseMode || releaseBoardProviderOptions.length) {
      return;
    }

    let cancelled = false;

    const loadProviderOptions = async () => {
      try {
        const response = await fetch("/api/provider-catalog");

        if (!response.ok) {
          throw new Error(`Failed to load provider catalog: ${response.status}`);
        }

        const payload = (await response.json()) as {
          results?: ProviderLogoOption[];
        };

        if (!cancelled) {
          setReleaseBoardProviderOptions(Array.isArray(payload.results) ? payload.results : []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
        }
      }
    };

    void loadProviderOptions();

    return () => {
      cancelled = true;
    };
  }, [isCalendarReleaseMode, releaseBoardProviderOptions.length]);

  useEffect(() => {
    if (!calendarPreviewGroups.length) {
      setCalendarPreviewDateKey("");
      return;
    }
    if (!calendarPreviewGroups.some((group) => group.dateKey === calendarPreviewDateKey)) {
      setCalendarPreviewDateKey(calendarPreviewGroups[0].dateKey);
    }
  }, [calendarPreviewDateKey, calendarPreviewGroups]);

  useEffect(() => {
    if (!isCalendarMode || calendarResults.length) return;

    const loadCalendarData = async () => {
      try {
        setIsCalendarLoading(true);
        setCalendarError("");
        const response = await fetch("/api/capture/calendar", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error("Failed to load calendar data");
        }

        setCalendarResults(Array.isArray(payload?.results) ? payload.results : []);
        if (payload?.option?.initialView) {
          setCalendarOption(payload.option);
        }
      } catch (error) {
        console.error("Failed to load calendar capture data", error);
        setCalendarError("달력 데이터를 불러오지 못했습니다.");
      } finally {
        setIsCalendarLoading(false);
      }
    };

    void loadCalendarData();
  }, [calendarResults.length, isCalendarMode]);

  const handleCapture = async () => {
    const targetRef = isCalendarMode
      ? calendarCaptureRef
      : isCalendarReleaseMode
        ? calendarReleaseCaptureRef
      : isPersonMode
        ? personCaptureRef
        : captureRef;
    if (!targetRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const rect = targetRef.current.getBoundingClientRect();
      const captureWidth = Math.max(1, Math.round(rect.width));
      const captureHeight = Math.max(1, Math.round(rect.height) - (isCalendarMode ? 2 : 0));

      const dataUrl = await toPng(targetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: isCalendarMode ? "#ffffff" : isCalendarReleaseMode ? "#221f2e" : "#111827",
        width: captureWidth,
        height: captureHeight,
        canvasWidth: captureWidth * 2,
        canvasHeight: captureHeight * 2,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `tovie-${captureMode}-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadEachMovie = async () => {
    if (!isMovieListMode || !selectedMovies.length || isCapturing) return;

    try {
      setIsCapturing(true);

      for (let index = 0; index < selectedMovies.length; index += 1) {
        setPreviewMovieIndex(index);

        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

        if (!singleMovieCaptureRef.current) continue;

        const dataUrl = await toPng(singleMovieCaptureRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#111827",
        });

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `tovie-${toSafeFilename(selectedMovies[index]?.title || `movie-${index + 1}`)}-${new Date().toISOString().slice(0, 10)}.png`;
        link.click();

        await new Promise((resolve) => window.setTimeout(resolve, 120));
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadEachCalendarPreview = async () => {
    if (!isCalendarMode || !calendarPreviewGroups.length || isCapturing) return;

    try {
      setIsCapturing(true);

      for (const group of calendarPreviewGroups) {
        setCalendarPreviewDateKey(group.dateKey);

        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

        if (!calendarDayPreviewCaptureRef.current) continue;

        const rect = calendarDayPreviewCaptureRef.current.getBoundingClientRect();
        const captureWidth = Math.max(1, Math.round(rect.width));
        const captureHeight = Math.max(1, Math.round(rect.height));

        const dataUrl = await toPng(calendarDayPreviewCaptureRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#111827",
          width: captureWidth,
          height: captureHeight,
          canvasWidth: captureWidth * 2,
          canvasHeight: captureHeight * 2,
        });

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `tovie-calendar-preview-${group.dateKey}.png`;
        link.click();

        await new Promise((resolve) => window.setTimeout(resolve, 120));
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const slots = Array.from({ length: movieSlotCount }, (_, index) => selectedMovies[index]);
  const movieTextForCopy = useMemo(
    () =>
      selectedMovies
        .map((movie, index) => {
          const year = formatYear(movie);
          return [`-`, movie.title, year ? `(${year})` : ""].filter(Boolean).join(" ");
        })
        .join("\n"),
    [selectedMovies],
  );
  const calendarTextForCopy = useMemo(() => {
    const groups = new Map<string, any[]>();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const getPriority = (item: any) => {
      if (item?.type === "공휴일" || item?.type === "대체공휴일") return 4;
      if (item?.type === "관리자") return 3;
      if (item?.type === "박스오피스") return 2;
      if (item?.type === "재개봉") return 1;
      return 0;
    };

    calendarResults.forEach((item: any) => {
      const type = String(item?.type ?? "");
      const title = String(item?.title ?? "");
      const isHoliday = type.includes("공휴일") || title.includes("공휴일") || type.includes("대체공휴일") || title.includes("대체공휴일");
      const isAdmin = type === "관리자";
      if (isHoliday || isAdmin) return;

      const dateKey = String(item?.release_date ?? item?.start ?? "").slice(0, 10);
      if (!dateKey) return;
      const date = new Date(`${dateKey}T00:00:00`);
      if (date.getFullYear() !== currentYear || date.getMonth() !== currentMonth) return;
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)?.push(item);
    });

    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, items]) => {
        const date = new Date(`${dateKey}T00:00:00`);
        const head = `${date.getMonth() + 1}/${date.getDate()} (${weekdays[date.getDay()]})`;
        const lines = items
          .sort((a, b) => {
            const pa = getPriority(a);
            const pb = getPriority(b);
            if (pa !== pb) return pb - pa;
            return String(a?.title ?? "").localeCompare(String(b?.title ?? ""), "ko");
          })
          .map((entry: any) => `- ${entry?.title}${entry?.type === "재개봉" ? " (재개봉)" : ""}`);
        return [head, ...lines].join("\n");
      })
      .join("\n\n");
  }, [calendarResults]);

  const updateCurrentSinglePreview = (
    patch: Partial<
      Pick<
        CaptureMovie,
        | "singlePreviewTitle"
        | "singlePreviewSubtitle"
        | "singlePreviewSubbody"
        | "singlePreviewBody"
        | "singlePreviewTextPosition"
        | "singlePreviewShowTitle"
        | "singlePreviewShowSubtitle"
        | "singlePreviewShowSubbody"
        | "singlePreviewShowBody"
      >
    >,
  ) => {
    if (!currentSingleMovie) return;
    updateMovieSinglePreview(currentSingleMovie.id, patch);
  };

  const handleCopyMovieText = async () => {
    if (!movieTextForCopy) return;

    await navigator.clipboard.writeText(movieTextForCopy);
    setDidCopyText(true);
    window.setTimeout(() => setDidCopyText(false), 1200);
  };
  const handleCopyCalendarText = async () => {
    if (!calendarTextForCopy) return;

    await navigator.clipboard.writeText(calendarTextForCopy);
    setDidCopyText(true);
    window.setTimeout(() => setDidCopyText(false), 1200);
  };

  const handleDragStart = (index: number) => {
    draggedIndexRef.current = index;
  };

  const handleDrop = (index: number) => {
    const fromIndex = draggedIndexRef.current;
    draggedIndexRef.current = null;
    setDragOverIndex(null);

    if (fromIndex === null) return;
    reorderMovie(fromIndex, index);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Title title="Capture" sub="Instagram content maker" />
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={isPersonMode ? clearPerson : clearMovies}
            disabled={isCalendarMode ? true : isPersonMode ? !selectedPerson : !selectedMovies.length}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Reset selected movies"
            title="Reset"
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={isCapturing || (isCalendarMode ? isCalendarLoading || !calendarResults.length : isPersonMode ? !selectedPerson : !selectedMovies.length)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 border border-slate-900 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-default disabled:opacity-45 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white sm:flex-none"
          >
            <FontAwesomeIcon icon={faDownload} />
            {isCapturing ? "capturing" : "download"}
          </button>
          {isMovieListMode ? (
            <button
              type="button"
              onClick={handleDownloadEachMovie}
              disabled={isCapturing || !selectedMovies.length}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 sm:flex-none"
            >
              <FontAwesomeIcon icon={faDownload} />
              개별
            </button>
          ) : null}
          {isCalendarMode ? (
            <button
              type="button"
              onClick={handleDownloadEachCalendarPreview}
              disabled={isCapturing || !calendarPreviewGroups.length}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 sm:flex-none"
            >
              <FontAwesomeIcon icon={faDownload} />
              ?좎쭨蹂?            </button>
          ) : null}
        </div>
      </div>

      <div className="flex w-full flex-wrap border border-slate-200 bg-white/72 p-1 dark:border-slate-800 dark:bg-slate-950/70 sm:inline-flex sm:w-fit">
        {[
          { key: "person-cover", label: "Person Cover" },
          { key: "movie-list", label: "Movie List" },
          { key: "calendar", label: "Calendar" },
          { key: "calendar-release", label: "Release Board" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setCaptureMode(item.key as "movie-list" | "person-cover" | "calendar" | "calendar-release")}
            className={[
              "h-9 min-w-0 flex-[1_1_calc(50%-0.25rem)] px-3 text-sm font-bold transition sm:flex-none sm:px-4",
              captureMode === item.key
                ? "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4">
          {isCalendarMode || isCalendarReleaseMode ? (
              <CalendarCaptureControls
              isCalendarReleaseMode={isCalendarReleaseMode}
              isCalendarMode={isCalendarMode}
              isCalendarLoading={isCalendarLoading}
              calendarError={calendarError}
              selectedMoviesCount={selectedMovies.length}
              calendarResultsCount={calendarResults.length}
              calendarReleaseTitle={calendarReleaseTitle}
              setCalendarReleaseTitle={setCalendarReleaseTitle}
              calendarReleaseTitleSize={calendarReleaseTitleSize}
              setCalendarReleaseTitleSize={setCalendarReleaseTitleSize}
              calendarReleaseLabelColors={calendarReleaseLabelColors}
              setCalendarReleaseLabelColors={setCalendarReleaseLabelColors}
              calendarReleaseDates={calendarReleaseDates}
              setCalendarReleaseDates={setCalendarReleaseDates}
              releaseBoardPlaceholders={releaseBoardSlots.map((movie) => getReleaseBoardAutoDate(movie) || "6/5")}
              calendarTitle={calendarTitle}
              setCalendarTitle={setCalendarTitle}
              calendarTitleSize={calendarTitleSize}
              setCalendarTitleSize={setCalendarTitleSize}
              showCalendarTitle={showCalendarTitle}
              setShowCalendarTitle={setShowCalendarTitle}
              footerLeft={footerLeft}
              setFooterLeft={setFooterLeft}
              footerRight={footerRight}
              setFooterRight={setFooterRight}
              handleCopyCalendarText={handleCopyCalendarText}
              calendarTextForCopy={calendarTextForCopy}
              didCopyText={didCopyText}
            />
          ) : isMovieMode ? (
          <>
            <MovieSlotsPanel
              isCalendarReleaseMode={isCalendarReleaseMode}
              isMovieListMode={isMovieListMode}
              selectedMoviesCount={selectedMovies.length}
              movieSlotCount={movieSlotCount}
              movies={isCalendarReleaseMode ? releaseBoardSlots : slots}
              dragOverIndex={dragOverIndex}
              onDragStart={handleDragStart}
              onDragOver={(index) => setDragOverIndex(index)}
              onDragLeave={(index) => setDragOverIndex((current) => (current === index ? null : current))}
              onDrop={handleDrop}
              onDragEnd={() => {
                draggedIndexRef.current = null;
                setDragOverIndex(null);
              }}
              removeMovie={removeMovie}
              updateMovieTitle={updateMovieTitle}
              updateMovieNote={updateMovieNote}
              updateMovieImagePosition={updateMovieImagePosition}
            />

          {isMovieListMode ? (
            <>
              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Text</p>
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Preview Version</span>
                  <div className="grid grid-cols-2 gap-2">
                    <CaptureToggleButton type="button" active={movieListVariant === "default"} onClick={() => setMovieListVariant("default")}>
                      기본
                    </CaptureToggleButton>
                    <CaptureToggleButton type="button" active={movieListVariant === "edge"} onClick={() => setMovieListVariant("edge")}>
                      여백 없음
                    </CaptureToggleButton>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Columns</span>
                  <div className="grid grid-cols-2 gap-2">
                    <CaptureToggleButton type="button" active={movieListColumns === 1} onClick={() => setMovieListColumns(1)}>
                      1열
                    </CaptureToggleButton>
                    <CaptureToggleButton type="button" active={movieListColumns === 2} onClick={() => setMovieListColumns(2)}>
                      2열
                    </CaptureToggleButton>
                  </div>
                </div>
                {movieListVariant === "default" ? (
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                  <CaptureTextArea
                    value={movieListTitle}
                    onChange={(event) => setMovieListTitle(event.target.value)}
                    rows={2}
                  />
                  <CaptureSizeControls value={movieListTitleSize} defaultValue={16} onChange={setMovieListTitleSize} step={1} min={12} max={28} />
                </label>
                ) : null}
              </div>

              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Copy Text</p>
                  <button
                    type="button"
                    onClick={handleCopyMovieText}
                    disabled={!movieTextForCopy}
                    className="h-8 border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {didCopyText ? "copied" : "copy"}
                  </button>
                </div>
                <pre className="min-h-24 whitespace-pre-wrap border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                  {movieTextForCopy || "영화를 추가하면 복사용 텍스트가 표시됩니다."}
                </pre>
              </div>
            </>
          ) : null}
          {isMovieListMode ? (
            <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Single Preview Text</p>
              <div className="mb-3">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Preview Version</span>
                <div className="grid grid-cols-2 gap-2">
                  <CaptureToggleButton type="button" active={singlePreviewVariant === "default"} onClick={() => setSinglePreviewVariant("default")}>
                    기본
                  </CaptureToggleButton>
                  <CaptureToggleButton type="button" active={singlePreviewVariant === "spotlight"} onClick={() => setSinglePreviewVariant("spotlight")}>
                    포스터형
                  </CaptureToggleButton>
                </div>
              </div>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                <CaptureTextArea
                  value={currentSingleMovie?.singlePreviewTitle ?? currentSingleMovie?.title ?? ""}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewTitle: event.target.value })}
                  placeholder={currentSingleMovie?.title ?? "제목"}
                  rows={2}
                />
                <CaptureSizeControls value={singlePreviewTitleSize} defaultValue={28} onChange={setSinglePreviewTitleSize} step={2} min={16} max={48} />
              </label>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle</span>
                <input
                  value={currentSingleMovie?.singlePreviewSubtitle ?? currentSingleMovie?.original_title ?? currentSingleMovie?.title ?? ""}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewSubtitle: event.target.value })}
                  placeholder="서브타이틀"
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <div className="mb-3">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle Chip</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {subtitleChipToneOptions.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSubtitleChipTone(item.key)}
                      className={[
                        "flex h-9 items-center gap-2 border px-2 text-xs font-bold transition",
                        subtitleChipTone === item.key
                          ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                      ].join(" ")}
                    >
                      <span className={["h-3 w-3 rounded-full", item.swatchClass].join(" ")} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subbody</span>
                <textarea
                  value={currentSingleMovie?.singlePreviewSubbody ?? ""}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewSubbody: event.target.value })}
                  rows={2}
                  className="w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Body</span>
                <textarea
                  value={currentSingleMovie?.singlePreviewBody ?? currentSingleMovie?.overview ?? "여기에 설명을 적어주세요.\n두 줄까지 표시됩니다."}
                  onChange={(event) => updateCurrentSinglePreview({ singlePreviewBody: event.target.value })}
                  rows={4}
                  className="w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    key: "title",
                    label: "Title",
                    checked: currentSingleMovie?.singlePreviewShowTitle ?? true,
                    setChecked: (next: boolean | ((current: boolean) => boolean)) => {
                      const current = currentSingleMovie?.singlePreviewShowTitle ?? true;
                      updateCurrentSinglePreview({ singlePreviewShowTitle: typeof next === "function" ? next(current) : next });
                    },
                  },
                  {
                    key: "subtitle",
                    label: "Subtitle",
                    checked: currentSingleMovie?.singlePreviewShowSubtitle ?? false,
                    setChecked: (next: boolean | ((current: boolean) => boolean)) => {
                      const current = currentSingleMovie?.singlePreviewShowSubtitle ?? false;
                      updateCurrentSinglePreview({ singlePreviewShowSubtitle: typeof next === "function" ? next(current) : next });
                    },
                  },
                  {
                    key: "subbody",
                    label: "Subbody",
                    checked: currentSingleMovie?.singlePreviewShowSubbody ?? true,
                    setChecked: (next: boolean | ((current: boolean) => boolean)) => {
                      const current = currentSingleMovie?.singlePreviewShowSubbody ?? true;
                      updateCurrentSinglePreview({ singlePreviewShowSubbody: typeof next === "function" ? next(current) : next });
                    },
                  },
                  {
                    key: "body",
                    label: "Body",
                    checked: currentSingleMovie?.singlePreviewShowBody ?? true,
                    setChecked: (next: boolean | ((current: boolean) => boolean)) => {
                      const current = currentSingleMovie?.singlePreviewShowBody ?? true;
                      updateCurrentSinglePreview({ singlePreviewShowBody: typeof next === "function" ? next(current) : next });
                    },
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => item.setChecked((current) => !current)}
                    className={[
                      "h-8 border px-2 text-xs font-bold transition",
                      item.checked
                        ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          </>
          ) : (
            <>
              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Person</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedPersons.length}/{CAPTURE_PERSON_MAX_COUNT}</p>
                </div>
                <div className="flex flex-col gap-3">
                  {selectedPersons.length ? (
                    selectedPersons.map((person, index) => (
                      <div key={person.id} className="border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="flex items-start gap-3">
                          {person.profile_path ? (
                            <img
                              alt=""
                              src={getProfileThumbUrl(person.profile_path)}
                              className="h-20 w-14 shrink-0 object-cover"
                            />
                          ) : (
                            <div className="h-20 w-14 shrink-0 bg-slate-200 dark:bg-slate-800" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{person.name}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{person.known_for_department ?? "프로필 이미지를 선택할 수 있습니다"}</p>
                            <p className="mt-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">인물 {index + 1}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePerson(person.id)}
                            className="inline-flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            aria-label={`${person.name} remove`}
                            title="Remove"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>

                        <label className="mt-3 block">
                          <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Custom image URL</span>
                          <input
                            value={person.profile_path?.startsWith("http") || person.profile_path?.startsWith("//") ? person.profile_path : ""}
                            onChange={(event) => updatePersonProfilePath(person.id, event.target.value.trim())}
                            placeholder="https://..."
                            className="h-9 w-full border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100"
                          />
                        </label>

                        {person.profileOptions?.length ? (
                          <div className="mt-3 grid grid-cols-5 gap-2">
                            {person.profileOptions.map((profilePath) => (
                              <button
                                key={`${person.id}-${profilePath}`}
                                type="button"
                                onClick={() => updatePersonProfilePath(person.id, profilePath)}
                                className={[
                                  "aspect-[4/5] overflow-hidden border transition",
                                  person.profile_path === profilePath ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20" : "border-slate-200 dark:border-slate-800",
                                ].join(" ")}
                                aria-label="Select profile image"
                              >
                                <img alt="" src={`https://image.tmdb.org/t/p/w185${profilePath}`} className="h-full w-full object-cover" />
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                      상단 검색으로 인물을 최대 {CAPTURE_PERSON_MAX_COUNT}명까지 추가하세요
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Cover Text</p>
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Title</span>
                  <CaptureTextArea
                    value={personTitle}
                    onChange={(event) => setPersonTitle(event.target.value)}
                    rows={2}
                  />
                  <CaptureSizeControls value={personTitleSize} defaultValue={28} onChange={setPersonTitleSize} step={2} min={24} max={48} />
                </label>
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle</span>
                  <input
                    value={personSubtitle}
                    onChange={(event) => setPersonSubtitle(event.target.value)}
                    className="h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <div className="mb-3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtitle Chip</span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {subtitleChipToneOptions.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSubtitleChipTone(item.key)}
                        className={[
                          "flex h-9 items-center gap-2 border px-2 text-xs font-bold transition",
                          subtitleChipTone === item.key
                            ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                        ].join(" ")}
                      >
                        <span className={["h-3 w-3 rounded-full", item.swatchClass].join(" ")} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Body</span>
                  <textarea
                    value={personBody}
                    onChange={(event) => setPersonBody(event.target.value)}
                    placeholder={selectedPerson?.biography ? "" : "인물 설명"}
                    rows={2}
                    className="min-h-20 w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Subbody</span>
                  <textarea
                    value={personSubbody}
                    onChange={(event) => setPersonSubbody(event.target.value)}
                    rows={2}
                    className="min-h-16 w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                </label>
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {[
                    { key: "title", label: "Title", checked: personShowTitle, setChecked: setPersonShowTitle },
                    { key: "subtitle", label: "Subtitle", checked: personShowSubtitle, setChecked: setPersonShowSubtitle },
                    { key: "subbody", label: "Subbody", checked: personShowSubbody, setChecked: setPersonShowSubbody },
                    { key: "body", label: "Body", checked: personShowBody, setChecked: setPersonShowBody },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => item.setChecked((current) => !current)}
                      className={[
                        "h-8 border px-2 text-xs font-bold transition",
                        item.checked
                          ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[min(100%,390px)] sm:max-w-[420px]">
            <div
              ref={isCalendarMode ? calendarCaptureRef : isCalendarReleaseMode ? calendarReleaseCaptureRef : captureMode === "person-cover" ? personCaptureRef : captureRef}
              className={[
                isCalendarMode ? "aspect-[4/5] w-full overflow-hidden bg-white text-slate-900" : isCalendarReleaseMode ? "aspect-[4/5] w-full overflow-hidden bg-[#221f2e] text-white" : "aspect-[4/5] w-full overflow-hidden bg-slate-950 text-white",
                "shadow-[0_24px_64px_rgba(15,23,42,0.24)]",
              ].join(" ")}
            >
              {isCalendarMode ? (
                <CalendarCoverTemplate
                  results={calendarResults}
                  option={calendarOption}
                  title={calendarTitle}
                  titleSize={calendarTitleSize}
                  showTitle={showCalendarTitle}
                  footerLeft={footerLeft}
                  footerRight={footerRight}
                />
              ) : isCalendarReleaseMode ? (
                <CalendarReleaseBoardTemplate
                  movies={releaseBoardSlots}
                  title={calendarReleaseTitle}
                  titleSize={calendarReleaseTitleSize}
                  labelColors={calendarReleaseLabelColors}
                  dateLabels={releaseBoardDateLabels}
                />
              ) : captureMode === "person-cover" ? (
                <PersonCoverTemplate
                  persons={selectedPersons}
                  headline={personTitle}
                  titleSize={personTitleSize}
                  kicker={personSubtitle}
                  subtitleChipClass={subtitleChipClass}
                  subbody={personSubbody}
                  body={personBody}
                  showTitle={personShowTitle}
                  showSubtitle={personShowSubtitle}
                  showSubbody={personShowSubbody}
                  showBody={personShowBody}
                  footerLeft={footerLeft}
                  footerRight={footerRight}
                />
              ) : (
              <MovieListTemplate
                slots={slots}
                title={movieListTitle}
                titleSize={movieListTitleSize}
                variant={movieListVariant}
                columns={movieListColumns}
                footerLeft={footerLeft}
                footerRight={footerRight}
              />
              )}
            </div>
            {isCalendarMode ? (
              <div className="mt-4 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                  {calendarPreviewGroups.map((group) => (
                    <button
                      key={group.dateKey}
                      type="button"
                      onClick={() => setCalendarPreviewDateKey(group.dateKey)}
                      className={[
                        "inline-flex h-8 min-w-12 items-center justify-center border px-2 text-xs font-bold transition",
                        (activeCalendarPreview?.dateKey ?? "") === group.dateKey
                          ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                      ].join(" ")}
                    >
                      {group.dateKey.slice(5).replace("-", "/")}
                    </button>
                  ))}
                </div>
                {activeCalendarPreview ? (
                  <div ref={calendarDayPreviewCaptureRef} className="overflow-hidden bg-slate-950">
                    <CalendarDayPreviewTemplate
                      dateKey={activeCalendarPreview.dateKey}
                      items={activeCalendarPreview.items}
                      footerLeft={footerLeft}
                      footerRight={footerRight}
                    />
                  </div>
                ) : (
                  <div className="flex h-56 items-center justify-center border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    ?대깽?멸? ?덈뒗 ?좎쭨媛 ?놁뒿?덈떎.
                  </div>
                )}
              </div>
            ) : null}
            {isCalendarReleaseMode ? (
              <div className="mt-4 overflow-hidden border border-slate-200 bg-white/72 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="p-4 pb-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Release Board Poster</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {selectedMovies.length ? `${releaseBoardPreviewIndex + 1}/${Math.min(selectedMovies.length, 8)}` : "empty"}
                    </p>
                  </div>

                  {selectedMovies.length ? (
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {releaseBoardSlots.map((movie, index) => (
                        <button
                          key={`${movie?.id ?? "release-slot"}-${index}`}
                          type="button"
                          onClick={() => setReleaseBoardPreviewIndex(index)}
                          className={[
                            "inline-flex h-8 min-w-8 items-center justify-center border px-2 text-xs font-bold transition",
                            releaseBoardPreviewIndex === index
                              ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                          ].join(" ")}
                          disabled={!movie}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {currentReleaseBoardMovie?.posterOptions?.length ? (
                  <div className="m-4 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Poster</p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {currentReleaseBoardMovie.posterOptions.length}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {currentReleaseBoardMovie.posterOptions.map((posterPath) => (
                        <button
                          key={posterPath}
                          type="button"
                          onClick={() => updateMoviePoster(currentReleaseBoardMovie.id, posterPath)}
                          className={[
                            "aspect-[4/5] overflow-hidden border transition",
                            currentReleaseBoardMovie.poster_path === posterPath
                              ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20"
                              : "border-slate-200 dark:border-slate-800",
                          ].join(" ")}
                          aria-label="Select release board poster"
                        >
                          <img alt="" src={getPosterThumbUrl(posterPath)} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-400">
                    {selectedMovies.length ? "선택한 영화에 포스터 옵션이 없으면 현재 포스터가 그대로 사용됩니다." : "영화를 추가하면 포스터 선택이 표시됩니다."}
                  </div>
                )}

                {currentReleaseBoardMovie ? (
                  <div className="m-4 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Provider Logo</p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {currentReleaseBoardProviderOptions.length}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      <button
                        type="button"
                        onClick={() => updateMovieProviderLogo(currentReleaseBoardMovie.id, "")}
                        className={[
                          "flex aspect-square items-center justify-center border text-[11px] font-bold transition",
                          !currentReleaseBoardMovie.providerLogoPath
                            ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                        ].join(" ")}
                      >
                        없음
                      </button>
                      {currentReleaseBoardProviderOptions.map((provider) => (
                        <button
                          key={`${provider.provider_id}-${provider.logo_path ?? "none"}`}
                          type="button"
                          onClick={() => updateMovieProviderLogo(currentReleaseBoardMovie.id, provider.logo_path ?? "", provider.provider_name)}
                          className={[
                            "aspect-square overflow-hidden border p-0.5 transition",
                            currentReleaseBoardMovie.providerLogoPath === provider.logo_path
                              ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20"
                              : "border-slate-200 dark:border-slate-800",
                          ].join(" ")}
                          title={provider.provider_name}
                          aria-label={`Select ${provider.provider_name} logo`}
                        >
                          <img
                            alt={provider.provider_name}
                            src={getProviderLogoUrl(provider.logo_path)}
                            className="h-full w-full rounded-md object-cover"
                            crossOrigin="anonymous"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {isMovieListMode ? (
              <div className="mt-4 overflow-hidden border border-slate-200 bg-white/72 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="p-4 pb-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Single Preview</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {selectedMovies.length ? `${previewMovieIndex + 1}/${selectedMovies.length}` : "empty"}
                    </p>
                  </div>

                  {selectedMovies.length ? (
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {selectedMovies.map((movie, index) => (
                          <button
                            key={movie.id}
                            type="button"
                            onClick={() => setPreviewMovieIndex(index)}
                            className={[
                              "inline-flex h-8 min-w-8 items-center justify-center border px-2 text-xs font-bold transition",
                              previewMovieIndex === index
                                ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                            ].join(" ")}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                    ) : null}
                </div>

                {selectedMovies.length ? (
                  <>
                    <div className="aspect-[4/5] overflow-hidden bg-slate-950 text-white">
                      <div ref={singleMovieCaptureRef} className="h-full w-full">
                        <SingleMovieTemplate
                          movie={selectedMovies[previewMovieIndex]}
                          titleSize={singlePreviewTitleSize}
                          subtitleChipClass={subtitleChipClass}
                          variant={singlePreviewVariant}
                          rank={previewMovieIndex + 1}
                          footerLeft={footerLeft}
                          footerRight={footerRight}
                        />
                      </div>
                    </div>

                    {selectedMovies[previewMovieIndex]?.posterOptions?.length ? (
                      <div className="m-4 border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Poster</p>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {selectedMovies[previewMovieIndex]?.posterOptions?.length ?? 0}
                          </p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                          {selectedMovies[previewMovieIndex]?.posterOptions?.map((posterPath) => (
                            <button
                              key={posterPath}
                              type="button"
                              onClick={() => updateMoviePoster(selectedMovies[previewMovieIndex].id, posterPath)}
                              className={[
                                "aspect-[4/5] overflow-hidden border transition",
                                selectedMovies[previewMovieIndex]?.poster_path === posterPath
                                  ? "border-slate-950 ring-2 ring-slate-950/15 dark:border-white dark:ring-white/20"
                                  : "border-slate-200 dark:border-slate-800",
                              ].join(" ")}
                              aria-label="Select poster"
                            >
                              <img alt="" src={getPosterThumbUrl(posterPath)} className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                  </>
                ) : (
                  <div className="flex h-56 items-center justify-center border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    영화를 추가하면 개별 미리보기가 표시됩니다.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

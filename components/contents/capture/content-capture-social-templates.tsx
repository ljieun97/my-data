import { CaptureMovie } from "@/context/CaptureContentContext";
import {
  buildImageCandidates,
  CaptureFooter,
  CaptureHeadlineBlock,
  CaptureV2Header,
  getBackdropUrl,
  getPosterUrl,
  handleImageFallback,
  titleFontStyle,
} from "@/components/contents/capture/content-capture-utils";
import { CAPTURE_TEXT } from "@/lib/capture-defaults";
import type { CSSProperties } from "react";

const rankingNumberStyle: CSSProperties = {
  fontFamily: '"Helvetica Neue", Arial, sans-serif',
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "0",
  lineHeight: 1,
};

function getMovieImageCandidates(movie?: CaptureMovie) {
  return buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));
}

function getRankingDailyAudience(movie?: CaptureMovie) {
  if (!movie) return "";
  const audience = movie.rankingDailyAudience?.trim() || "1,000";
  const unit = movie.rankingDailyAudienceUnit?.trim() || "명";
  return `${audience}${unit}`;
}

function EmptyBackdrop() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(135deg,#0f172a_0%,#020617_54%,#111827_100%)]" />
  );
}

export function RankingCoverTemplate({
  movies,
  headline,
  titleSize,
  footerRight,
  coverMovieId,
  coverMovieIds,
  dateLabel,
  dailyAudienceLabel = "일일 관객",
  totalAudienceLabel = "누적 관객",
  showDailyAudience = true,
  showTotalAudience = false,
  isCapturing = false,
}: {
  movies: Array<CaptureMovie | undefined>;
  headline: string;
  titleSize: number;
  footerRight: string;
  coverMovieId?: number;
  coverMovieIds?: number[];
  dateLabel?: string;
  dailyAudienceLabel?: string;
  totalAudienceLabel?: string;
  showDailyAudience?: boolean;
  showTotalAudience?: boolean;
  isCapturing?: boolean;
}) {
  const topMovie = movies[0];
  const selectedCoverMovies = (coverMovieIds?.length ? coverMovieIds : coverMovieId ? [coverMovieId] : [])
    .map((id) => movies.find((movie) => movie?.id === id))
    .filter(Boolean) as CaptureMovie[];
  const coverMovies = (selectedCoverMovies.length ? selectedCoverMovies : topMovie ? [topMovie] : []).slice(0, 2);
  const rankingRows = Array.from({ length: 10 }, (_, index) => movies[index]);
  const headlineValue = headline.trim() || `${topMovie?.title ?? "1위 작품"} 박스오피스 1위`;
  const subtextValue = dateLabel?.trim().replace(/\s*\n\s*/g, " ");
  const dailyAudienceHeader = dailyAudienceLabel.trim() || "일일 관객";
  const totalAudienceHeader = totalAudienceLabel.trim() || "누적 관객";
  const getRankText = (movie: CaptureMovie | undefined, index: number) =>
    movie?.rankingText?.trim() || String(index + 1);
  const getDailyAudience = getRankingDailyAudience;
  const getTotalAudience = (movie?: CaptureMovie) => movie?.rankingTotalAudience?.trim() ?? "";

  return (
    <div className="relative h-full overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-x-0 top-0 h-[48%] overflow-hidden bg-neutral-900">
        {coverMovies.length ? (
          coverMovies.map((coverMovie, index) => {
            const imageCandidates = getMovieImageCandidates(coverMovie);
            const rankingImagePosition = Math.min(100, (coverMovie?.imagePosition ?? 30) + 15);
            const isSplit = coverMovies.length > 1;

            return (
              <div
                key={`${coverMovie.id}-${index}`}
                className="absolute inset-y-0 overflow-hidden"
                style={{
                  left: isSplit ? (index === 0 ? 0 : "calc(50% - 18px)") : 0,
                  width: isSplit ? "calc(50% + 18px)" : "100%",
                  WebkitMaskImage: isSplit
                    ? index === 0
                      ? "linear-gradient(90deg,#000 0%,#000 calc(100% - 36px),transparent 100%)"
                      : "linear-gradient(90deg,transparent 0%,#000 36px,#000 100%)"
                    : undefined,
                  maskImage: isSplit
                    ? index === 0
                      ? "linear-gradient(90deg,#000 0%,#000 calc(100% - 36px),transparent 100%)"
                      : "linear-gradient(90deg,transparent 0%,#000 36px,#000 100%)"
                    : undefined,
                }}
              >
                {imageCandidates[0] ? (
                  <img
                    alt=""
                    src={imageCandidates[0]}
                    data-fallback-index="0"
                    onError={(event) => handleImageFallback(event, imageCandidates)}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: `center ${rankingImagePosition}%` }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <EmptyBackdrop />
                )}
              </div>
            );
          })
        ) : (
          <EmptyBackdrop />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.01)_34%,rgba(0,0,0,0.48)_100%)]" />
      </div>
      <div className="absolute inset-x-0 top-[36%] h-[18%] bg-[linear-gradient(180deg,rgba(5,5,5,0)_0%,rgba(5,5,5,0.82)_72%,rgba(5,5,5,0.82)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[calc(64%+1rem)] bg-[linear-gradient(180deg,rgba(5,5,5,0)_0%,rgba(5,5,5,0.82)_14%,rgba(5,5,5,0.82)_100%)] px-8 pb-9 pt-11">
        <div className="flex h-full flex-col">
          <div
            style={rankingNumberStyle}
            className={[
              "grid h-4 shrink-0 items-center gap-1 px-1 text-[8px] font-bold leading-none text-white/38",
              showDailyAudience
                ? showTotalAudience
                  ? "grid-cols-[1.45rem_minmax(0,1fr)_4.6rem_4.6rem]"
                  : "grid-cols-[1.45rem_minmax(0,1fr)_4.6rem]"
                : "grid-cols-[1.45rem_minmax(0,1fr)]",
            ].join(" ")}
          >
            <span />
            <span className="truncate pr-px" />
            {showDailyAudience ? <span className="truncate whitespace-nowrap pl-2 pr-px text-right">{dailyAudienceHeader}</span> : null}
            {showDailyAudience && showTotalAudience ? <span className="truncate whitespace-nowrap pl-2 pr-px text-right">{totalAudienceHeader}</span> : null}
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            {rankingRows.map((movie, index) => {
              const isCoverRow = Boolean(movie?.id && coverMovies.some((coverMovie) => coverMovie.id === movie.id));

              return (
                <div
                  key={movie?.id ?? `ranking-placeholder-${index}`}
                  className={[
                    "grid min-h-0 flex-1 items-center gap-1 px-1",
                    isCoverRow ? "rounded-[6px] bg-white/[0.055]" : "",
                    showDailyAudience
                      ? showTotalAudience
                        ? "grid-cols-[1.45rem_minmax(0,1fr)_4.6rem_4.6rem]"
                        : "grid-cols-[1.45rem_minmax(0,1fr)_4.6rem]"
                      : "grid-cols-[1.45rem_minmax(0,1fr)]",
                  ].join(" ")}
                >
                  <span
                    style={rankingNumberStyle}
                    className={[
                      "inline-flex h-[16px] min-w-[22px] -translate-y-[1px] items-center justify-center rounded-[5px] text-[10px] font-black tabular-nums",
                      isCoverRow ? "bg-white/24 text-white" : "bg-neutral-600 text-white",
                    ].join(" ")}
                  >
                    {getRankText(movie, index)}
                  </span>
                  <div className="flex h-full min-w-0 items-center">
                    <p
                      style={{ ...rankingNumberStyle, fontWeight: 500 }}
                      className={[
                        "min-w-0 truncate text-[13px] font-semibold leading-none",
                        isCoverRow ? "text-white" : "text-white/68",
                      ].join(" ")}
                    >
                      {movie?.title ?? CAPTURE_TEXT.addMovie}
                    </p>
                  </div>
                  {showDailyAudience ? (
                    <span
                      style={rankingNumberStyle}
                      className={[
                        "flex h-full min-w-0 items-center justify-end overflow-hidden whitespace-nowrap pl-2 text-right text-[11px] font-black leading-none",
                        isCoverRow ? "text-white" : "text-white/68",
                      ].join(" ")}
                    >
                      {getDailyAudience(movie)}
                    </span>
                  ) : null}
                  {showDailyAudience && showTotalAudience ? (
                    <span
                      style={rankingNumberStyle}
                      className={[
                        "flex h-full min-w-0 items-center justify-end overflow-hidden whitespace-nowrap pl-2 text-right text-[11px] font-black leading-none",
                        isCoverRow ? "text-white" : "text-white/68",
                      ].join(" ")}
                    >
                      {getTotalAudience(movie)}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="relative z-[2] flex h-full flex-col px-4 pb-2 pt-4">
        <CaptureHeadlineBlock
          title={headlineValue}
          titleSize={titleSize}
          subtitle={subtextValue}
          subtitlePlacement="below"
          subtitleTone="light"
        />
        <div className="min-h-0 flex-1" />
        <CaptureFooter footerLeft="" footerRight={footerRight} />
      </div>
    </div>
  );
}

function ReviewBlock({ rating, text }: { rating?: number; text?: string }) {
  const normalizedRating = Math.min(5, Math.max(0, Number(rating) || 0));
  const reviewText = text?.trim() ?? "";
  const hasReview = normalizedRating > 0 || Boolean(reviewText);

  if (!hasReview) return null;

  return (
    <div className="absolute inset-x-0 bottom-[96px] z-[2] px-9 text-center">
      <div className="flex flex-col items-center gap-1.5">
        {normalizedRating > 0 ? (
          <div
            style={{ ...titleFontStyle, textShadow: "0 1px 2px rgba(0,0,0,0.88), 0 2px 8px rgba(0,0,0,0.72)" }}
            className="relative inline-block text-[14px] font-bold leading-none tracking-[0.06em] drop-shadow-[0_2px_7px_rgba(0,0,0,0.72)]"
            aria-label={`별점 ${normalizedRating.toFixed(1)}점`}
          >
            <span className="text-[#555555]">★★★★★</span>
            <span
              className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-[#ffd43b]"
              style={{ width: `${(normalizedRating / 5) * 100}%` }}
            >
              ★★★★★
            </span>
          </div>
        ) : null}
        {reviewText ? (
          <p
            style={{ ...titleFontStyle }}
            className="max-w-full whitespace-pre-line break-keep text-[11px] font-medium leading-snug tracking-[-0.01em] text-white/92 drop-shadow-[0_2px_8px_rgba(0,0,0,0.76)]"
          >
            {reviewText}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function NewsCoverTemplate({
  movie,
  secondaryMovie,
  headline,
  accentText,
  titleSize,
  bodyCard = false,
  bodyText,
  reviewRating,
  reviewText,
  footerRight,
}: {
  movie?: CaptureMovie;
  secondaryMovie?: CaptureMovie;
  headline: string;
  accentText: string;
  titleSize: number;
  bodyCard?: boolean;
  bodyText?: string;
  reviewRating?: number;
  reviewText?: string;
  footerRight: string;
}) {
  const imageCandidates = getMovieImageCandidates(movie);
  const secondaryImageCandidates = getMovieImageCandidates(secondaryMovie);
  const headlineValue = headline.trim() || movie?.singlePreviewTitle || movie?.title || CAPTURE_TEXT.newsFallbackHeadline;
  const displayHeadline = headlineValue;
  const bottomText = bodyText?.trim() || "";
  const accentColor = "#fff3d0";

  return (
    <div className="relative h-full overflow-hidden bg-neutral-950 text-white">
      {bodyCard ? (
        <div className="absolute inset-0 grid grid-cols-2 bg-neutral-950">
          <div className="relative min-w-0 overflow-hidden bg-neutral-900">
            {imageCandidates[0] ? (
              <img
                alt=""
                src={imageCandidates[0]}
                data-fallback-index="0"
                onError={(event) => handleImageFallback(event, imageCandidates)}
                className="h-full w-full object-cover"
                style={{ objectPosition: `center ${movie?.imagePosition ?? 42}%` }}
                crossOrigin="anonymous"
              />
            ) : (
              <EmptyBackdrop />
            )}
          </div>
          <div className="relative min-w-0 overflow-hidden bg-neutral-900">
            {secondaryImageCandidates[0] ? (
              <img
                alt=""
                src={secondaryImageCandidates[0]}
                data-fallback-index="0"
                onError={(event) => handleImageFallback(event, secondaryImageCandidates)}
                className="h-full w-full object-cover"
                style={{ objectPosition: `center ${secondaryMovie?.imagePosition ?? 42}%` }}
                crossOrigin="anonymous"
              />
            ) : imageCandidates[0] ? (
              <img
                alt=""
                src={imageCandidates[0]}
                data-fallback-index="0"
                onError={(event) => handleImageFallback(event, imageCandidates)}
                className="h-full w-full object-cover"
                style={{ objectPosition: `center ${movie?.imagePosition ?? 42}%` }}
                crossOrigin="anonymous"
              />
            ) : (
              <EmptyBackdrop />
            )}
          </div>
        </div>
      ) : imageCandidates[0] ? (
        <img
          alt=""
          src={imageCandidates[0]}
          data-fallback-index="0"
          onError={(event) => handleImageFallback(event, imageCandidates)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `center ${movie?.imagePosition ?? 42}%` }}
          crossOrigin="anonymous"
        />
      ) : (
        <EmptyBackdrop />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.04)_32%,rgba(0,0,0,0.32)_78%,rgba(0,0,0,0.72)_100%)]" />
      {!bodyCard ? <ReviewBlock rating={reviewRating} text={reviewText} /> : null}
      <div className="relative z-[2] flex h-full min-h-0 flex-col px-4 pb-2 pt-4">
        <CaptureV2Header title={displayHeadline} titleSize={titleSize} />
        {!bodyCard && accentText ? (
          <p
            style={{ ...titleFontStyle, borderColor: `${accentColor}8c`, color: accentColor }}
            className="mt-2 inline-flex w-fit border px-3 py-1.5 text-[12px] font-bold leading-none tracking-[-0.02em] opacity-90"
          >
            {accentText}
          </p>
        ) : null}
        <div className="min-h-0 flex-1" />
        {bodyCard && bottomText ? (
          <div className="w-1/2 pb-16 pl-5 pr-3">
            <BodyTextBlock text={bottomText} titleSize={titleSize} />
          </div>
        ) : null}
        <CaptureFooter footerLeft="" footerRight={footerRight} />
      </div>
    </div>
  );
}

function BodyTextBlock({ text }: { text: string; titleSize: number }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {text.split("\n").map((line, index) => (
        <span
          key={`${line}-${index}`}
          style={{
            ...titleFontStyle,
            fontSize: "14px",
          }}
          className="block whitespace-pre-line pl-[2px] font-medium leading-[1.56] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.72)]"
        >
          {line || " "}
        </span>
      ))}
    </div>
  );
}

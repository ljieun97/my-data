import { CaptureMovie } from "@/context/CaptureContentContext";
import {
  buildImageCandidates,
  CaptureFooter,
  CaptureV2Header,
  getBackdropUrl,
  getPosterUrl,
  handleImageFallback,
  titleFontStyle,
} from "@/components/contents/capture/content-capture-utils";

function getMovieImageCandidates(movie?: CaptureMovie) {
  return buildImageCandidates(getBackdropUrl(movie), getPosterUrl(movie));
}

function EmptyBackdrop() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(135deg,#0f172a_0%,#020617_54%,#111827_100%)]" />
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
  headline,
  accentText,
  titleSize,
  bodyCard = false,
  reviewRating,
  reviewText,
  footerRight,
}: {
  movie?: CaptureMovie;
  headline: string;
  accentText: string;
  titleSize: number;
  bodyCard?: boolean;
  reviewRating?: number;
  reviewText?: string;
  footerRight: string;
}) {
  const imageCandidates = getMovieImageCandidates(movie);
  const headlineValue = headline.trim() || movie?.singlePreviewTitle || movie?.title || "?곹솕 ?뚯떇";
  const displayHeadline = bodyCard ? headline.trim() || headlineValue : headlineValue;
  const accentColor = "#fff3d0";

  return (
    <div className="relative h-full overflow-hidden bg-neutral-950 text-white">
      {imageCandidates[0] ? (
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
        {bodyCard ? <BodyTextBlock text={displayHeadline} titleSize={titleSize} /> : <CaptureV2Header title={displayHeadline} titleSize={titleSize} />}
        {!bodyCard && accentText ? (
          <p
            style={{ ...titleFontStyle, borderColor: `${accentColor}8c`, color: accentColor }}
            className="mt-2 inline-flex w-fit border px-3 py-1.5 text-[12px] font-bold leading-none tracking-[-0.02em] opacity-90"
          >
            {accentText}
          </p>
        ) : null}
        <div className="min-h-0 flex-1" />
        <CaptureFooter footerLeft="" footerRight={footerRight} />
      </div>
    </div>
  );
}

function BodyTextBlock({ text, titleSize }: { text: string; titleSize: number }) {
  return (
    <div className="mt-2 flex flex-col items-start gap-[3px]">
      {text.split("\n").map((line, index) => (
        <span
          key={`${line}-${index}`}
          style={{ ...titleFontStyle, fontSize: `${titleSize}px` }}
          className="inline bg-white px-1.5 pb-0.5 pt-1 font-black leading-[1.52] tracking-[-0.06em] text-neutral-950"
        >
          {line || " "}
        </span>
      ))}
    </div>
  );
}


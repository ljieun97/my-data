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

function NewsBackdrop({ movies }: { movies: CaptureMovie[] }) {
  if (!movies.length) return <EmptyBackdrop />;

  if (movies.length === 1) {
    const movie = movies[0];
    const imageCandidates = getMovieImageCandidates(movie);

    return imageCandidates[0] ? (
      <img
        key={imageCandidates[0]}
        alt=""
        src={imageCandidates[0]}
        data-fallback-index="0"
        onError={(event) => handleImageFallback(event, imageCandidates)}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: `${movie.imagePositionX ?? 50}% ${movie.imagePosition ?? 42}%` }}
        crossOrigin="anonymous"
      />
    ) : (
      <EmptyBackdrop />
    );
  }

  return (
    <div className="absolute inset-0 flex">
      {movies.map((movie, index) => {
        const imageCandidates = getMovieImageCandidates(movie);

        return (
          <div key={`${movie.id}-${index}`} className="relative h-full min-w-0 flex-1 overflow-hidden">
            {imageCandidates[0] ? (
              <img
                key={imageCandidates[0]}
                alt=""
                src={imageCandidates[0]}
                data-fallback-index="0"
                onError={(event) => handleImageFallback(event, imageCandidates)}
                className="h-full w-full object-cover"
                style={{ objectPosition: `${movie.imagePositionX ?? 50}% ${movie.imagePosition ?? 42}%` }}
                crossOrigin="anonymous"
              />
            ) : (
              <EmptyBackdrop />
            )}
          </div>
        );
      })}
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
  movies,
  headline,
  titleSize,
  displayMode = "default",
  bottomTitle,
  bodyText,
  reviewRating,
  reviewText,
  footerRight,
}: {
  movie?: CaptureMovie;
  movies?: CaptureMovie[];
  headline: string;
  titleSize: number;
  displayMode?: "default" | "review" | "body";
  bottomTitle?: string;
  bodyText?: string;
  reviewRating?: number;
  reviewText?: string;
  footerRight: string;
}) {
  const backdropMovies = movies?.length ? movies : movie ? [movie] : [];
  const primaryMovie = backdropMovies[0];
  const headlineValue = headline.trim() || primaryMovie?.singlePreviewTitle || primaryMovie?.title || "?곹솕 ?뚯떇";
  const bottomTitleValue = bottomTitle?.trim() || primaryMovie?.singlePreviewTitle || primaryMovie?.title || headlineValue;
  const bodyValue = bodyText?.trim() ?? "";
  const isDefaultMode = displayMode === "default";
  const isReviewMode = displayMode === "review";
  const isBodyMode = displayMode === "body";

  return (
    <div className="relative h-full overflow-hidden bg-neutral-950 text-white">
      <NewsBackdrop movies={backdropMovies} />
      <div
        className={
          isBodyMode
            ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.06)_28%,rgba(0,0,0,0.56)_70%,rgba(0,0,0,0.9)_100%)]"
            : "absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.04)_32%,rgba(0,0,0,0.32)_78%,rgba(0,0,0,0.72)_100%)]"
        }
      />
      {isReviewMode ? <ReviewBlock rating={reviewRating} text={reviewText} /> : null}
      <div className="relative z-[2] flex h-full min-h-0 flex-col px-4 pb-2 pt-4">
        <CaptureV2Header title={headlineValue} titleSize={titleSize} />
        <div className="min-h-0 flex-1" />
        {isDefaultMode ? <BottomHeadlineBlock title={bottomTitleValue} titleSize={titleSize} /> : null}
        {isBodyMode && bodyValue ? <BodyTextBlock text={bodyValue} /> : null}
        <CaptureFooter footerLeft="" footerRight={footerRight} />
      </div>
    </div>
  );
}

function BottomHeadlineBlock({
  title,
  titleSize,
}: {
  title: string;
  titleSize: number;
}) {
  return (
    <div className="mb-7 flex flex-col items-center text-center">
      <h1
        style={{ ...titleFontStyle, fontSize: `${titleSize}px`, textShadow: "0 2px 12px rgba(0,0,0,0.72)" }}
        className="max-w-full whitespace-pre-line break-keep text-center font-black leading-[1.14] text-white"
      >
        {title}
      </h1>
    </div>
  );
}

function BodyTextBlock({ text }: { text: string }) {
  return (
    <div className="mb-7 px-3">
      <p
        style={{ ...titleFontStyle, textShadow: "0 2px 10px rgba(0,0,0,0.72)" }}
        className="whitespace-pre-line break-keep text-[16px] font-medium leading-[1.55] text-white/94"
      >
        {text}
      </p>
    </div>
  );
}

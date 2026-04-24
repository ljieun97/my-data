"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MediaSliderCard from "@/components/cards/slider-media-card";
import MediaSliderNavButton from "@/components/media/media-slider-nav-button";

export type MediaSliderItem = {
  id: string;
  title: string;
  year?: string;
  englishTitle?: string | null;
  originalTitle?: string | null;
  rank: string;
  rankChangeLabel?: string;
  rankChangeTone?: string;
  tmdbId?: number | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  overview?: string | null;
  detailLine?: string;
  subdetailLine?: string;
  rottenTomatoesUrl?: string | null;
  rottenTomatometer?: string | null;
  rottenPopcornmeter?: string | null;
  userRating?: number | null;
};

type MediaSliderImageType = "poster" | "backdrop";

const MAX_PAGE_SIZE = 5;
const SLIDER_GAP_PX = 12;
const SWIPE_THRESHOLD = 40;

export default function MediaSlider({
  title,
  emptyMessage,
  results,
  showRank = true,
  showDetail = true,
  showYear = true,
  isLoading = false,
  isScoreLoading = false,
  desktopPageSize = MAX_PAGE_SIZE,
  imageType = "poster",
}: {
  title: string;
  emptyMessage?: string;
  results?: MediaSliderItem[];
  showRank?: boolean;
  showDetail?: boolean;
  showYear?: boolean;
  isLoading?: boolean;
  isScoreLoading?: boolean;
  desktopPageSize?: number;
  imageType?: MediaSliderImageType;
}) {
  const router = useRouter();
  const safeResults = Array.isArray(results) ? results : [];
  const [pageSize, setPageSize] = useState<number | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [posterMidpoint, setPosterMidpoint] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    const updateVisibleItems = () => {
      if (window.innerWidth < 640) {
        setPageSize(3);
        return;
      }

      if (window.innerWidth < 1024) {
        setPageSize(4);
        return;
      }

      setPageSize(desktopPageSize);
    };

    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);

    return () => {
      window.removeEventListener("resize", updateVisibleItems);
    };
  }, [desktopPageSize]);

  const isViewportReady = pageSize !== null;

  useEffect(() => {
    if (!isViewportReady) {
      return;
    }

    const maxStartIndex = Math.max(0, safeResults.length - pageSize);
    setStartIndex((prev) => {
      const clamped = Math.min(prev, maxStartIndex);
      return Math.floor(clamped / pageSize) * pageSize;
    });
  }, [isViewportReady, pageSize, safeResults.length]);

  useEffect(() => {
    if (!isViewportReady) {
      return;
    }

    const element = viewportRef.current;

    if (!element) {
      return;
    }

    const updatePosterMidpoint = () => {
      const viewportWidth = element.clientWidth;
      const nextCardWidth = Math.max((viewportWidth - SLIDER_GAP_PX * (pageSize - 1)) / pageSize, 0);
      const cardHeight = imageType === "backdrop" ? nextCardWidth * (9 / 16) : nextCardWidth * 1.5;
      setCardWidth(nextCardWidth);
      setPosterMidpoint(cardHeight / 2);
    };

    updatePosterMidpoint();

    const resizeObserver = new ResizeObserver(updatePosterMidpoint);
    resizeObserver.observe(element);
    window.addEventListener("resize", updatePosterMidpoint);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosterMidpoint);
    };
  }, [imageType, isViewportReady, pageSize]);

  if (isLoading || !safeResults.length) {
    return (
      <section className="content-panel py-8">
        <div className="mx-auto max-w-7xl">
          <div className="page-shell min-h-[24rem]">
            <div className="flex min-h-[21rem] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                {isLoading ? (
                  <span
                    className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100"
                    aria-label="Loading"
                  />
                ) : null}
                <p className="home-copy text-sm">{emptyMessage ?? "No results available."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!isViewportReady) {
    return (
      <section>
        <div className="flex flex-col gap-2">
            <h1 className="home-title text-lg font-semibold tracking-[-0.05em]">{title}</h1>
          <div className="h-[18rem] sm:h-[22rem]" aria-hidden="true" />
        </div>
      </section>
    );
  }

  const maxStartIndex = Math.max(0, safeResults.length - pageSize);
  const canGoPrevious = startIndex > 0;
  const canGoNext = startIndex + pageSize < safeResults.length;
  const translateX = -(startIndex * (cardWidth + SLIDER_GAP_PX));
  const isTouchSwipeEnabled = pageSize <= 4;
  const buttonPositionStyle = posterMidpoint > 0 ? { top: `${posterMidpoint}px` } : undefined;

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + pageSize, maxStartIndex));
  };

  const handlePrevious = () => {
    setStartIndex((prev) => Math.max(prev - pageSize, 0));
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchSwipeEnabled) {
      return;
    }

    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchSwipeEnabled || touchStartXRef.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return;
    }

    if (deltaX < 0) {
      handleNext();
      return;
    }

    handlePrevious();
  };

  const prefetchDetail = (tmdbId?: number | null) => {
    if (!tmdbId) {
      return;
    }

    router.prefetch(`/movie/${tmdbId}`);
  };

  return (
    <section>
      <div className="flex flex-col gap-2">
        <h1 className="home-title text-lg font-semibold tracking-[-0.05em]">{title}</h1>

        <div>
          <div className="relative">
            <MediaSliderNavButton direction="previous" onClick={handlePrevious} disabled={!canGoPrevious} style={buttonPositionStyle} />
            <div className="-mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div
                ref={viewportRef}
                className="overflow-visible"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ gap: `${SLIDER_GAP_PX}px`, transform: `translateX(${translateX}px)` }}
                >
                  {safeResults.map((movie) => (
                    <MediaSliderCard
                      key={movie.id}
                      movie={movie}
                      cardWidth={cardWidth}
                      showRank={showRank}
                      showDetail={showDetail}
                      showYear={showYear}
                      isRtLoading={isScoreLoading}
                      imageType={imageType}
                      onPrefetch={prefetchDetail}
                    />
                  ))}
                </div>
              </div>
            </div>
            <MediaSliderNavButton direction="next" onClick={handleNext} disabled={!canGoNext} style={buttonPositionStyle} />
          </div>
        </div>
      </div>
    </section>
  );
}

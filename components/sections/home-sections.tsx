"use client";

import { useEffect, useMemo, useState } from "react";
import MediaSlider, { type MediaSliderItem } from "@/components/media/media-slider";
import { useUserRatings } from "@/context/UserRatingsContext";

type HomeSectionsResponse = {
  boxOfficeCards: MediaSliderItem[];
  upcomingCards: MediaSliderItem[];
  topRatedCards: MediaSliderItem[];
};

type RottenTomatoesUpdate = {
  id: string;
  englishTitle?: string | null;
  rottenTomatometer?: string | null;
  rottenPopcornmeter?: string | null;
  rottenTomatoesUrl?: string | null;
};

type RottenTomatoesResponse = {
  boxOfficeUpdates: RottenTomatoesUpdate[];
  upcomingUpdates: RottenTomatoesUpdate[];
  topRatedUpdates: RottenTomatoesUpdate[];
};

function applyRottenTomatoesUpdates(cards: MediaSliderItem[], updates: RottenTomatoesUpdate[]) {
  const updatesById = new Map(updates.map((item) => [item.id, item]));

  return cards.map((card) => {
    const update = updatesById.get(card.id);

    if (!update) {
      return card;
    }

    return {
      ...card,
      englishTitle: update.englishTitle ?? card.englishTitle ?? null,
      rottenTomatometer: update.rottenTomatometer ?? null,
      rottenPopcornmeter: update.rottenPopcornmeter ?? null,
      rottenTomatoesUrl: update.rottenTomatoesUrl ?? null,
    };
  });
}

function buildRtRequestPayload(data: HomeSectionsResponse) {
  return {
    boxOfficeCards: data.boxOfficeCards.map((card) => ({
      id: card.id,
      title: card.title,
      year: card.year,
      tmdbId: card.tmdbId,
      englishTitle: card.englishTitle,
      originalTitle: card.originalTitle,
    })),
    upcomingCards: data.upcomingCards.map((card) => ({
      id: card.id,
      title: card.title,
      year: card.year,
      tmdbId: card.tmdbId,
      englishTitle: card.englishTitle,
      originalTitle: card.originalTitle,
    })),
    topRatedCards: data.topRatedCards.map((card) => ({
      id: card.id,
      title: card.title,
      year: card.year,
      tmdbId: card.tmdbId,
      englishTitle: card.englishTitle,
      originalTitle: card.originalTitle,
    })),
  };
}

function applyUserRatings(cards: MediaSliderItem[], getRating: (item: { id: number; type: string }) => number) {
  return cards.map((card) => ({
    ...card,
    userRating: card.tmdbId ? getRating({ id: card.tmdbId, type: "movie" }) || null : null,
  }));
}

export default function HomeBoxOfficeSections({
  initialData,
}: {
  initialData: HomeSectionsResponse;
}) {
  const { ensureRatings, getRating } = useUserRatings();
  const [data, setData] = useState<HomeSectionsResponse>(initialData);
  const [error] = useState(false);
  const [isRtLoading, setIsRtLoading] = useState(true);

  useEffect(() => {
    setData(initialData);
    setIsRtLoading(true);
  }, [initialData]);

  useEffect(() => {
    const items = Array.from(
      new Set(
        [initialData.boxOfficeCards, initialData.upcomingCards, initialData.topRatedCards]
          .flat()
          .map((card) => card.tmdbId)
          .filter((tmdbId): tmdbId is number => Number.isFinite(tmdbId)),
      ),
    ).map((id) => ({ id, type: "movie" }));

    void ensureRatings(items);
  }, [ensureRatings, initialData]);

  useEffect(() => {
    let cancelled = false;

    const loadRottenTomatoes = async () => {
      try {
        const rtResponse = await fetch("/api/home/rottentomatoes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify(buildRtRequestPayload(initialData)),
        });

        if (!rtResponse.ok) {
          throw new Error(`Failed to load Rotten Tomatoes sections: ${rtResponse.status}`);
        }

        const rtPayload = (await rtResponse.json()) as RottenTomatoesResponse;

        if (!cancelled) {
          setData((currentData) => ({
            boxOfficeCards: applyRottenTomatoesUpdates(currentData.boxOfficeCards, rtPayload.boxOfficeUpdates),
            upcomingCards: applyRottenTomatoesUpdates(currentData.upcomingCards, rtPayload.upcomingUpdates),
            topRatedCards: applyRottenTomatoesUpdates(currentData.topRatedCards, rtPayload.topRatedUpdates),
          }));
        }
      } catch (loadError) {
        console.error(loadError);
      } finally {
        if (!cancelled) {
          setIsRtLoading(false);
        }
      }
    };

    void loadRottenTomatoes();

    return () => {
      cancelled = true;
    };
  }, [initialData]);

  const displayData = useMemo(
    () => ({
      boxOfficeCards: applyUserRatings(data.boxOfficeCards, getRating),
      upcomingCards: applyUserRatings(data.upcomingCards, getRating),
      topRatedCards: applyUserRatings(data.topRatedCards, getRating),
    }),
    [data, getRating],
  );

  return (
    <div className="flex flex-col gap-14">
      <MediaSlider
        title="박스오피스 순위"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={displayData.boxOfficeCards}
        showYear={false}
        isScoreLoading={isRtLoading}
      />
      <MediaSlider
        title="개봉예정작"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={displayData.upcomingCards}
        isScoreLoading={isRtLoading}
        showRank={false}
        showDetail
        showYear={false}
      />
      <MediaSlider
        title="인기 영화"
        emptyMessage={error ? "문제가 발생했습니다." : "잠시만 기다려주세요."}
        results={displayData.topRatedCards}
        isScoreLoading={isRtLoading}
        showRank={false}
        showDetail
        showYear={false}
      />
    </div>
  );
}

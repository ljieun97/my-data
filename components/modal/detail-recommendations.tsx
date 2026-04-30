"use client";

import { useEffect, useMemo, useState } from "react";
import MediaSliderCard from "@/components/cards/slider-media-card";
import type { MediaSliderItem } from "@/components/media/media-slider";
import { useUserRatings } from "@/context/UserRatingsContext";

type RecommendationItem = {
  id: number;
  title?: string;
  name?: string;
  original_title?: string | null;
  original_name?: string | null;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
};

type RottenTomatoesUpdate = {
  id: string;
  englishTitle?: string | null;
  rottenTomatometer?: string | null;
  rottenPopcornmeter?: string | null;
  rottenTomatoesUrl?: string | null;
};

type RottenTomatoesResponse = {
  upcomingUpdates?: RottenTomatoesUpdate[];
};

function mapRecommendations(contents: RecommendationItem[]): MediaSliderItem[] {
  return contents.map((content, index) => ({
    id: `recommendation-${content.id}`,
    title: content.title ?? content.name ?? "Untitled",
    year: (content.release_date ?? content.first_air_date ?? "").slice(0, 4) || undefined,
    rank: String(index + 1),
    tmdbId: content.id,
    posterPath: content.poster_path ?? null,
    backdropPath: content.backdrop_path ?? null,
    overview: content.overview ?? null,
    englishTitle: content.original_title ?? content.original_name ?? content.title ?? content.name ?? null,
    originalTitle: content.original_title ?? content.original_name ?? null,
  }));
}

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

export default function DetailRecommendations({
  contents,
  mediaType,
}: {
  contents: RecommendationItem[];
  mediaType: "movie" | "tv";
}) {
  const { ensureRatings, getRating } = useUserRatings();
  const baseCards = useMemo(() => mapRecommendations(contents), [contents]);
  const [cards, setCards] = useState<MediaSliderItem[]>(baseCards);
  const [isRtLoading, setIsRtLoading] = useState(true);

  useEffect(() => {
    setCards(baseCards);
    setIsRtLoading(true);
  }, [baseCards]);

  useEffect(() => {
    const items = baseCards
      .map((card) => ({ id: Number(card.tmdbId), type: mediaType }))
      .filter((item) => Number.isFinite(item.id));

    void ensureRatings(items);
  }, [baseCards, ensureRatings, mediaType]);

  useEffect(() => {
    let cancelled = false;

    const loadRottenTomatoes = async () => {
      try {
        const response = await fetch("/api/home/rottentomatoes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            upcomingCards: baseCards.map((card) => ({
              id: card.id,
              title: card.title,
              year: card.year,
              tmdbId: card.tmdbId,
              englishTitle: card.englishTitle,
              originalTitle: card.originalTitle,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to load Rotten Tomatoes data: ${response.status}`);
        }

        const payload = (await response.json()) as RottenTomatoesResponse;

        if (!cancelled) {
          setCards((currentCards) => applyRottenTomatoesUpdates(currentCards, payload.upcomingUpdates ?? []));
        }
      } catch (error) {
        console.error(error);
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
  }, [baseCards]);

  const cardsWithRating = useMemo(
    () =>
      cards.map((card) => ({
        ...card,
        userRating: card.tmdbId ? getRating({ id: card.tmdbId, type: mediaType }) || null : null,
      })),
    [cards, getRating, mediaType],
  );

  return (
    <div className="detail-recommendation-grid grid gap-4">
      {cardsWithRating.map((card) => (
        <MediaSliderCard
          key={card.id}
          movie={card}
          showRank={false}
          showDetail={false}
          showYear={false}
          isRtLoading={isRtLoading}
          imageType="poster"
          onPrefetch={() => {}}
          className="w-full"
        />
      ))}
    </div>
  );
}

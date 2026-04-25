"use client";

import { useEffect, useMemo, useState } from "react";
import MediaSliderCard from "@/components/cards/slider-media-card";
import type { MediaSliderItem } from "@/components/media/media-slider";
import { useUser } from "@/context/UserContext";

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

type RatingUpdate = {
  id: number;
  type?: string;
  rating: number;
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

function applyUserRatingUpdates(cards: MediaSliderItem[], ratingsByTmdbId: Map<number, number>) {
  return cards.map((card) => ({
    ...card,
    userRating: card.tmdbId ? ratingsByTmdbId.get(card.tmdbId) ?? null : null,
  }));
}

export default function DetailRecommendations({
  contents,
  mediaType,
}: {
  contents: RecommendationItem[];
  mediaType: "movie" | "tv";
}) {
  const { uid } = useUser();
  const baseCards = useMemo(() => mapRecommendations(contents), [contents]);
  const [cards, setCards] = useState<MediaSliderItem[]>(baseCards);
  const [isRtLoading, setIsRtLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCards(baseCards);
    setIsRtLoading(true);

    const ids = uid
      ? Array.from(
          new Set(
            baseCards
              .map((card) => card.tmdbId)
              .filter((tmdbId): tmdbId is number => Number.isFinite(tmdbId)),
          ),
        )
      : [];

    const loadUserRatings = async () => {
      if (!uid || !ids.length) {
        return;
      }

      try {
        const response = await fetch("/api/mypage/ratings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: uid,
          },
          body: JSON.stringify({
            items: ids.map((id) => ({ id, type: mediaType })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to load saved ratings: ${response.status}`);
        }

        const payload = (await response.json()) as RatingUpdate[];
        const ratingsByTmdbId = new Map(
          payload
            .filter((item) => Number.isFinite(item.id) && Number.isFinite(item.rating) && item.rating > 0)
            .map((item) => [item.id, item.rating]),
        );

        if (!cancelled) {
          setCards((currentCards) => applyUserRatingUpdates(currentCards, ratingsByTmdbId));
        }
      } catch (error) {
        console.error(error);
      }
    };

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

    void loadUserRatings();
    void loadRottenTomatoes();

    return () => {
      cancelled = true;
    };
  }, [baseCards, mediaType, uid]);

  return (
    <div className="detail-recommendation-grid grid gap-4">
      {cards.map((card) => (
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

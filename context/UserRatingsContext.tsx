"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type RatingItem = {
  id: number | string;
  type: string;
};

type UserRatingsContextType = {
  ratings: Record<string, number>;
  ensureRatings: (items: RatingItem[]) => Promise<void>;
  getRating: (item: RatingItem) => number;
  setRatingForItem: (item: RatingItem, rating: number) => void;
};

const UserRatingsContext = createContext<UserRatingsContextType | null>(null);

function normalizeItems(items: RatingItem[]) {
  const unique = new Map<string, RatingItem>();

  for (const item of items) {
    const id = Number(item?.id);
    const type = item?.type;

    if (!Number.isFinite(id) || !["movie", "tv"].includes(type)) {
      continue;
    }

    unique.set(buildRatingKey({ id, type }), { id, type });
  }

  return Array.from(unique.values());
}

export function buildRatingKey(item: RatingItem) {
  return `${item.type}:${Number(item.id)}`;
}

export function UserRatingsProvider({
  children,
  uid,
}: {
  children: React.ReactNode;
  uid: string | null;
}) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const knownKeysRef = useRef<Set<string>>(new Set());
  const pendingKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setRatings({});
    knownKeysRef.current.clear();
    pendingKeysRef.current.clear();
  }, [uid]);

  const ensureRatings = useCallback(
    async (items: RatingItem[]) => {
      if (!uid) {
        return;
      }

      const normalizedItems = normalizeItems(items);
      const itemsToFetch = normalizedItems.filter((item) => {
        const key = buildRatingKey(item);
        return !knownKeysRef.current.has(key) && !pendingKeysRef.current.has(key);
      });

      if (!itemsToFetch.length) {
        return;
      }

      const keys = itemsToFetch.map(buildRatingKey);
      keys.forEach((key) => pendingKeysRef.current.add(key));

      try {
        const response = await fetch("/api/mypage/ratings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: uid,
          },
          body: JSON.stringify({ items: itemsToFetch }),
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load user ratings: ${response.status}`);
        }

        const payload = (await response.json()) as Array<{ id?: number; type?: string; rating?: number }>;
        const nextRatings: Record<string, number> = {};

        keys.forEach((key) => {
          nextRatings[key] = 0;
        });

        for (const item of payload) {
          const key = buildRatingKey({
            id: Number(item.id),
            type: item.type || "movie",
          });

          nextRatings[key] = Number(item.rating) || 0;
        }

        setRatings((prev) => ({
          ...prev,
          ...nextRatings,
        }));

        keys.forEach((key) => knownKeysRef.current.add(key));
      } catch (error) {
        console.error(error);
      } finally {
        keys.forEach((key) => pendingKeysRef.current.delete(key));
      }
    },
    [uid],
  );

  const getRating = useCallback(
    (item: RatingItem) => {
      const key = buildRatingKey(item);
      return ratings[key] ?? 0;
    },
    [ratings],
  );

  const setRatingForItem = useCallback((item: RatingItem, rating: number) => {
    const key = buildRatingKey(item);
    knownKeysRef.current.add(key);
    pendingKeysRef.current.delete(key);

    setRatings((prev) => ({
      ...prev,
      [key]: Number(rating) || 0,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ratings,
      ensureRatings,
      getRating,
      setRatingForItem,
    }),
    [ensureRatings, getRating, ratings, setRatingForItem],
  );

  return <UserRatingsContext.Provider value={value}>{children}</UserRatingsContext.Provider>;
}

export function useUserRatings() {
  const context = useContext(UserRatingsContext);

  if (!context) {
    throw new Error("useUserRatings must be used within a UserRatingsProvider");
  }

  return context;
}

"use client";

import { useEffect, useMemo } from "react";
import CardInfo from "@/components/cards/info-media-card";
import PersonMediaCard from "@/components/cards/person-media-card";
import CardThumb from "@/components/cards/thumb-media-card";
import { useUserRatings } from "@/context/UserRatingsContext";

function getContentType(content: any) {
  return content?.media_type || (content?.title ? "movie" : "tv");
}

export default function InfiniteImages(props: any) {
  const { ensureRatings, getRating } = useUserRatings();
  const contents = useMemo(() => props.contents ?? [], [props.contents]);

  useEffect(() => {
    const items = contents
      .map((content: any) => ({
        id: Number(content?.id),
        type: getContentType(content),
      }))
      .filter((item: { id: number; type: string }) => Number.isFinite(item.id) && item.type);

    void ensureRatings(items);
  }, [contents, ensureRatings]);

  const sortedContents = useMemo(() => {
    if (!props.prioritizeRated) {
      return contents;
    }

    return [...contents].sort((a: any, b: any) => {
      const aRating = getRating({ id: Number(a?.id), type: getContentType(a) }) || 0;
      const bRating = getRating({ id: Number(b?.id), type: getContentType(b) }) || 0;
      const aRated = aRating > 0 ? 1 : 0;
      const bRated = bRating > 0 ? 1 : 0;

      return bRated - aRated;
    });
  }, [contents, getRating, props.prioritizeRated]);

  const style =
    props.type == "person"
      ? "media-recommendation-grid media-recommendation-grid--info grid gap-2.5"
      : props.type == "info"
        ? "media-recommendation-grid media-recommendation-grid--info grid gap-4"
        : "media-recommendation-grid grid gap-4";

  return (
    <div className={style}>
      {sortedContents.map((content: any, index: number) => {
        const contentWithRating = {
          ...content,
          userRating: getRating({ id: Number(content?.id), type: getContentType(content) }) || null,
        };

        return props.type == "person" ? (
          <PersonMediaCard key={index} content={contentWithRating} />
        ) : props.type == "info" ? (
          <CardInfo key={index} content={contentWithRating} />
        ) : (
          <CardThumb key={index} content={contentWithRating} />
        );
      })}
    </div>
  );
}

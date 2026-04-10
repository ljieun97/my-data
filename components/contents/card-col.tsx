"use client";

import SavedMediaCard from "@/components/mypage/saved-media-card";

export default function CardCol({
  thisYear,
  content,
  isProvider,
  onUpdate,
  onDelete,
}: {
  thisYear: string;
  content: any;
  isProvider: boolean;
  onUpdate: any;
  onDelete: any;
}) {
  const handleUpdate = (contentId: string, nextDate: string, nextPosterPath: string, nextRating: number) => {
    if (thisYear !== nextDate.slice(0, 4)) {
      onUpdate(contentId);
    }
  };

  return (
    <SavedMediaCard
      content={content}
      showProvider={isProvider}
      onDelete={onDelete}
      onUpdate={handleUpdate}
    />
  );
}

"use client";

import { Toast } from "@heroui/react";
import { useUser } from "@/context/UserContext";
import { useSaveDate } from "@/context/SaveDateContext";
import { saveContent } from "@/lib/actions/content";

export function useSaveContent() {
  const { uid } = useUser();
  const { mode, requestDate, requestDuplicateAction } = useSaveDate();

  const saveWithPreference = async ({ id, content, rating }: { id: string; content: any; rating: number }) => {
    let saveDate: string | undefined;
    let selectedRating = rating;
    const contentType = content.type || (content.title ? "movie" : "tv");
    const seasonParam =
      contentType === "tv"
        ? `&season_number=${encodeURIComponent(String(content.season_number || 1))}`
        : "";

    if (uid && mode === "custom") {
      const duplicateCheck = await fetch(`/api/mypage/content/${id}?type=${contentType}${seasonParam}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: uid,
        },
      });

      if (duplicateCheck.ok) {
        const duplicateData = await duplicateCheck.json();

        if (duplicateData?.duplicate && duplicateData.existingId) {
          const action = await requestDuplicateAction({
            existingDate: duplicateData.existingDate,
            nextDate: null,
            existingRating: duplicateData.existingRating,
            nextRating: rating,
          });

          if (!action) {
            return;
          }

          const selection = await requestDate(
            action.dateChoice === "keep" ? duplicateData.existingDate ?? undefined : undefined,
            action.ratingChoice === "keep" ? Number(duplicateData.existingRating) || rating : rating,
          );

          if (!selection) {
            return;
          }

          const response = await fetch(`/api/mypage/content/${duplicateData.existingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid,
              poster_path: content.poster_path,
              date: selection.date,
              rating: selection.rating,
            }),
          });

          if (response.ok) {
            Toast.toast("저장 정보를 변경했습니다");
          }

          return;
        }
      }
    }

    if (mode === "custom") {
      const selection = await requestDate(undefined, rating);

      if (!selection) {
        return;
      }

      saveDate = selection.date;
      selectedRating = selection.rating;
    }

    const result = await saveContent({
      uid,
      id,
      content,
      rating: selectedRating,
      saveDateMode: mode,
      saveDate,
      addToast: ({ title }: any) => Toast.toast(title),
    });

    if (result.ok || !uid) {
      return;
    }

    if (result.status !== 409 || !result.data?.duplicate || !result.data?.existingId) {
      return;
    }

    const nextDate =
      saveDate ??
      (mode === "today"
        ? new Date().toISOString().slice(0, 10)
        : content.release_date || content.first_air_date || result.data?.nextDate || null);

    const action = await requestDuplicateAction({
      existingDate: result.data?.existingDate,
      nextDate,
      existingRating: result.data?.existingRating,
      nextRating: selectedRating,
    });

    if (!action) {
      return;
    }

    const resolvedDate = action.dateChoice === "keep" ? result.data?.existingDate ?? nextDate : nextDate;
    const resolvedRating =
      action.ratingChoice === "keep" ? Number(result.data?.existingRating) || selectedRating : selectedRating;

    const response = await fetch(`/api/mypage/content/${result.data.existingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        poster_path: content.poster_path,
        date: resolvedDate,
        rating: resolvedRating,
      }),
    });

    if (response.ok) {
      Toast.toast("저장 정보를 변경했습니다");
    }
  };

  return {
    saveWithPreference,
    saveDateMode: mode,
  };
}

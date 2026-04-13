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

    if (mode === "custom") {
      const pickedDate = await requestDate();

      if (!pickedDate) {
        return;
      }

      saveDate = pickedDate;
    }

    const result = await saveContent({
      uid,
      id,
      content,
      rating,
      saveDateMode: mode,
      saveDate,
      addToast: ({ title }: any) => Toast.toast(title),
    });

    if (result.ok || !uid) {
      return;
    }

    if (result.status !== 409 || !result.data?.duplicate) {
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
    });

    if (action === "keep") {
      Toast.toast("이미 저장된 영화입니다.");
      return;
    }

    if (action === "change" && result.data?.existingId && nextDate) {
      const response = await fetch(`/api/mypage/content/${result.data.existingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          poster_path: content.poster_path,
          date: nextDate,
        }),
      });

      if (response.ok) {
        Toast.toast("저장 날짜를 변경했습니다.");
      }
    }
  };

  return {
    saveWithPreference,
    saveDateMode: mode,
  };
}

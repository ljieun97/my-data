"use client";

import { Toast } from "@heroui/react";
import { useUser } from "@/context/UserContext";
import { useSaveDate } from "@/context/SaveDateContext";
import { saveContent } from "@/lib/actions/content";

export function useSaveContent() {
  const { uid } = useUser();
  const { mode, requestDate } = useSaveDate();

  const saveWithPreference = async ({ id, content, rating }: { id: string; content: any; rating: number }) => {
    let saveDate: string | undefined;

    if (mode === "custom") {
      const pickedDate = await requestDate();

      if (!pickedDate) {
        return;
      }

      saveDate = pickedDate;
    }

    await saveContent({
      uid,
      id,
      content,
      rating,
      saveDateMode: mode,
      saveDate,
      addToast: ({ title }: any) => Toast.toast(title),
    });
  };

  return {
    saveWithPreference,
    saveDateMode: mode,
  };
}

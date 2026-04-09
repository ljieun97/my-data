type SaveContentParams = {
  uid: string | null;
  id: string;
  content: any;
  rating: number;
  saveDateMode?: "release" | "today" | "custom";
  saveDate?: string;
  addToast: (options: { title: string }) => void;
};

type SaveContentResult = {
  ok: boolean;
  status: number;
  data: any;
};

export const saveContent = async ({
  uid,
  id,
  content,
  rating,
  saveDateMode,
  saveDate,
  addToast,
}: SaveContentParams): Promise<SaveContentResult> => {
  if (uid) {
    const isTodaySave = localStorage.getItem("set_isTodaySave");
    const res = await fetch(`/api/mypage/content/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        content,
        rating,
        isTodaySave,
        saveDateMode: saveDateMode ?? (isTodaySave === "true" ? "today" : "release"),
        saveDate,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      addToast({ title: "저장했습니다." });
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  }

  const stored = localStorage.getItem("movies");
  const list = stored ? JSON.parse(stored) : [];
  list.push(content.poster_path);
  localStorage.setItem("movies", JSON.stringify(list));
  addToast({ title: "저장했습니다.(게스트)" });

  return {
    ok: true,
    status: 200,
    data: null,
  };
};

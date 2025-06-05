type SaveContentParams = {
  uid: string | null;
  id: string;
  content: any;
  rating: number;
  addToast: (options: { title: string }) => void;
}

export const saveContent = async ({ uid, id, content, rating, addToast }: SaveContentParams) => {
  if (uid) {
    const isTodaySave = localStorage.getItem("set_isTodaySave")
    const res = await fetch(`/api/mypage/content/${id}`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, content, rating, isTodaySave }),
    })
    if (res.ok) {
      addToast({ title: "저장 되었습니다" });
    }
  } else {
    const stored = localStorage.getItem("movies")
    const list = stored ? JSON.parse(stored) : []
    list.push(content.poster_path)
    localStorage.setItem("movies", JSON.stringify(list))
    addToast({ title: "저장 되었습니다 (게스트)" })
  }
}
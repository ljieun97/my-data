'use client'

import { getDetail } from "@/lib/open-api/tmdb-server";
import { useEffect, useState } from "react";

export default function AwardCell({ id }: { id: any }) {
  const [data, setData] = useState({}) as any

  useEffect(() => {
    (async () => {
      if(!id) return
      const results = await getDetail('movie', id)
      setData(results)
    })()
  }, [])

  return (
    <div className="min-w-[180px]">
      {data.title}
    </div>
  );
}
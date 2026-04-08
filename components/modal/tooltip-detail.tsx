"use client";

import { useState, useEffect } from "react";
import { getDetail } from "@/lib/open-api/tmdb-server";

export const TooltipDetail = ({ id, type }: { id: any; type: string }) => {
  const [popcontent, setPopcontent] = useState({
    title: "",
    original_title: "",
    release_date: "",
    name: "",
    original_name: "",
    first_air_date: "",
    backdrop_path: "",
    genres: [],
  }) as any;

  useEffect(() => {
    (async () => {
      const results = await getDetail(type, id);
      setPopcontent(results);
    })();
  }, [id, type]);

  return (
    <>
      {popcontent.backdrop_path ? (
        <img
          className="h-[168px] w-[300px] rounded-lg object-cover brightness-110"
          alt="Detail Image"
          src={`https://image.tmdb.org/t/p/original${popcontent.backdrop_path}`}
        />
      ) : (
        <div className="h-[168px] w-[300px] animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      )}
      <div className="pt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
        {type === "movie" ? (
          <>
            <b>{popcontent.title}</b>
            {popcontent.title !== popcontent.original_title ? ` (${popcontent.original_title})` : ""}
            {" · "}
            {popcontent.release_date}
            {" · "}
            {popcontent.genres?.map((entry: any) => entry.name).join(", ")}
          </>
        ) : (
          <>
            <b>{popcontent.name}</b>
            {popcontent.name !== popcontent.original_name ? ` (${popcontent.original_name})` : ""}
            {" · "}
            {popcontent.first_air_date}
            {" · "}
            {popcontent.genres?.map((entry: any) => entry.name).join(", ")}
          </>
        )}
      </div>
    </>
  );
};

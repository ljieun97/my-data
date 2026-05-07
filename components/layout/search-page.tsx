"use client";

import { useSearchParams } from "next/navigation";
import Title from "@/components/common/title";
import { RefObject, useEffect, useMemo, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import InfiniteImages from "@/components/common/infinite-images";
import { getSearchMulti } from "@/lib/open-api/tmdb-client";
import { useSearchKeyword } from "@/context/SearchContext";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryKeyword = (searchParams.get("keyword") || "").trim();
  const { keyword, setKeyword } = useSearchKeyword();
  const [hasMoreMovies, setHasMoreMovies] = useState(false);

  const effectiveKeyword = useMemo(() => queryKeyword || keyword, [keyword, queryKeyword]);

  const movies = useAsyncList({
    async load({ cursor }) {
      if (!effectiveKeyword) {
        setHasMoreMovies(false);
        return {
          items: [],
          cursor: undefined,
        };
      }

      const { results, page, total_pages } = cursor
        ? await getSearchMulti(effectiveKeyword, Number(cursor))
        : await getSearchMulti(effectiveKeyword, 1);

      setHasMoreMovies(page < total_pages);
      return {
        items: results,
        cursor: page < total_pages ? page + 1 : undefined,
      };
    },
  });

  const [loaderRefMovies, scrollerRefMovies] = useInfiniteScroll({
    hasMore: hasMoreMovies,
    onLoadMore: movies.loadMore,
  }) as unknown as RefObject<HTMLDivElement>[];

  useEffect(() => {
    setKeyword(queryKeyword);
  }, [queryKeyword, setKeyword]);

  useEffect(() => {
    void movies.reload();
  }, [effectiveKeyword]);

  return (
    <div className="content-panel">
      <Title title={`"${effectiveKeyword}"`} sub="Search results" />
      <div className="content-grid-shell overflow-auto rounded-[24px] border p-3" style={{ minHeight: "60vh" }} ref={scrollerRefMovies}>
        <InfiniteImages contents={movies.items} type="info" />
        {hasMoreMovies ? <div className="flex w-full justify-center" ref={loaderRefMovies} /> : null}
      </div>
    </div>
  );
}

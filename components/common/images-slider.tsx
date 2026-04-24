"use client";

import { useEffect, useRef, useState } from "react";
import CardThumb from "@/components/cards/thumb-media-card";
import { getTodayMovies, getTodaySeries, getTopRatedMovies } from "@/lib/open-api/tmdb-client";

export default function ImagesSlider(props: any) {
  const [movies, setMovies] = useState<any[] | null>(null);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = movies ? Math.ceil(movies.length / itemsPerPage) : 0;
  const sliderRef = useRef<HTMLDivElement>(null);

  const apiMap: Record<string, () => Promise<any>> = {
    getTodayMovies,
    getTodaySeries,
    getTopRatedMovies,
  };

  const calculateItemsPerPage = (width: number) => {
    if (width >= 1280) return 5;
    if (width >= 1024) return 4;
    return 3;
  };

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(calculateItemsPerPage(window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const apiFunc = apiMap[props.type];
      if (apiFunc) {
        const data = await apiFunc();
        setMovies(data);
      }
    };
    fetch();
  }, [props.type]);

  const getWidthClass = (count: number) => {
    switch (count) {
      case 3:
        return "w-1/3";
      case 4:
        return "w-1/4";
      default:
        return "w-1/5";
    }
  };

  const next = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
      sliderRef.current?.scrollTo({
        left: (page + 1) * sliderRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const prev = () => {
    if (page > 0) {
      setPage(page - 1);
      sliderRef.current?.scrollTo({
        left: (page - 1) * sliderRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const goToPage = (pageIndex: number) => {
    setPage(pageIndex);
    sliderRef.current?.scrollTo({
      left: pageIndex * sliderRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="flex justify-end gap-1 pb-2 pr-6">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => goToPage(i)} className={`h-1 w-4 rounded-sm ${i === page ? "bg-green-500" : "bg-black/10"}`} />
        ))}
      </div>

      <div className="flex w-full overflow-hidden">
        <button onClick={prev} className="mr-[2px] rounded-sm bg-black/10 px-[3px]" disabled={page === 0}>
          ‹
        </button>

        <div ref={sliderRef} className="flex w-full overflow-hidden scroll-snap-x snap-mandatory transition-transform duration-300 ease-in-out">
          {movies
            ? movies.map((item: any, index: number) => (
                <div key={index} className={`flex-shrink-0 ${getWidthClass(itemsPerPage)}`}>
                  <CardThumb content={item} />
                </div>
              ))
            : Array.from({ length: itemsPerPage }, (_, index) => (
                <div key={index} className={`flex-shrink-0 ${getWidthClass(itemsPerPage)}`}>
                  <div className="mx-[2px] h-[140px] animate-pulse rounded-sm bg-gray-200 dark:bg-slate-800" />
                </div>
              ))}
        </div>

        <button onClick={next} className="ml-[2px] rounded-sm bg-black/10 px-[3px]" disabled={page === totalPages - 1}>
          ›
        </button>
      </div>
    </>
  );
}

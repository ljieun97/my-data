
// import { useEffect, useRef, useState } from "react";
import CardThumb from "../contents/card-thumb"
import { Button, Card, Skeleton } from "@heroui/react";
import { getTodayMovies, getTodaySeries, getTopRatedMovies } from "@/lib/themoviedb/tmdb-client";

export default function ImagesSliderSkel() {
  // const [movies, setMovies] = useState<any[] | null>(null);
  // const apiMap: Record<string, () => Promise<any>> = {
  //   getTodayMovies,
  //   getTodaySeries,
  //   getTopRatedMovies,
  // }

  // useEffect(() => {
  //   const fetch = async () => {
  //     const apiFunc = apiMap[props.type]
  //     if (apiFunc) {
  //       const data = await apiFunc()
  //       setMovies(data)
  //     }
  //   }
  //   fetch()
  // }, [props.type])

  const itemsPerPage = 5;
  // const totalPages = movies ? Math.ceil(movies.length / itemsPerPage) : 0;
  // const [page, setPage] = useState(0);
  // const sliderRef = useRef<HTMLDivElement>(null);

  // const next = () => {
  //   if (page < totalPages - 1) {
  //     setPage(page + 1);
  //     sliderRef.current?.scrollTo({
  //       left: (page + 1) * sliderRef.current.clientWidth,
  //       behavior: "smooth",
  //     });
  //   }
  // };

  // const prev = () => {
  //   if (page > 0) {
  //     setPage(page - 1);
  //     sliderRef.current?.scrollTo({
  //       left: (page - 1) * sliderRef.current.clientWidth,
  //       behavior: "smooth",
  //     });
  //   }
  // };


  // const goToPage = (pageIndex: number) => {
  //   setPage(pageIndex);
  //   sliderRef.current?.scrollTo({
  //     left: pageIndex * sliderRef.current.clientWidth,
  //     behavior: "smooth",
  //   });
  // };

  return (
    <>
      <div className="flex justify-end gap-1 pb-2 pr-6">
        {Array.from({ length: 1 }, (_, i) => (
          <button
            key={i}
            // onClick={() => goToPage(i)}
            // className={`w-4 h-1 rounded-sm ${i === page ? "bg-green-500" : "bg-black/10"}`}
            className={`w-4 h-1 rounded-sm bg-black/10"`}
          >
          </button>
        ))}
      </div>

      <div className="flex w-full overflow-hidden">
        <button
          // onClick={prev}
          className="bg-black/10 px-[3px] mr-[2px] rounded-sm"
          // disabled={page === 0}
        >
          ◀
        </button>

        <div className="flex transition-transform duration-300 ease-in-out w-full overflow-hidden scroll-snap-x snap-mandatory">

          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-1/5"
            >
              {/* <Card
                radius="sm"
                className="group/footer mx-[2px]"
                isFooterBlurred
                isBlurred
                shadow="none"
              > */}
                {/* <Skeleton className="w-full h-full rounded-sm">
                  <div className="w-[240px] h-[140px]" />
                </Skeleton> */}
                   <div className="w-[240px] h-[140px] rounded-sm bg-gray-200 animate-pulse" />
              {/* </Card> */}
            </div>
          ))}

        </div>

        <button
          // onClick={next}
          className="bg-black/10 px-[3px] ml-[2px] rounded-sm"
          // disabled={page === totalPages - 1}
        >
          ▶
        </button>
      </div>
    </>
  )
}
'use client'

import { useRef, useState } from "react";
import CardThumb from "../contents/card-thumb"
import { Button } from "@heroui/react";

export default function ImagesSlider(props: any) {


  // let img = ''
  // if (props?.content?.backdrop_path) img = `https://image.tmdb.org/t/p/w500/${content.backdrop_path}`
  // else img = '/images/no-image.jpg'

  {/* <div className="flex overflow-x-scroll gap-2 pb-6">
        {props.contents.map((content: any, index: number) => (
          <div key={index}>
            <div className="w-[160px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
              <CardThumb content={content}></CardThumb>
            </div>
          </div>
        ))}
      </div> */}

  const itemsPerPage = 5;
  const totalPages = Math.ceil(props.contents.length / itemsPerPage);
  const [page, setPage] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

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
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`w-4 h-1 rounded-sm ${i === page ? "bg-green-500" : "bg-black/10"
              }`}
          >
          </button>
        ))}
      </div>

      <div className="flex w-full overflow-hidden">
        <button
          onClick={prev}
          className="bg-black/10 px-[3px] mr-[2px] rounded-sm"
          disabled={page === 0}
        >
          ◀
        </button>

        <div ref={sliderRef} className="flex transition-transform duration-300 ease-in-out w-full overflow-hidden scroll-snap-x snap-mandatory">
          {props.contents.map((item: any, index: number) => (
            <div
              key={index}
              className="flex-shrink-0 w-1/5"
            >
              <CardThumb content={item}></CardThumb>
            </div>
          ))}
        </div>

        <button
          onClick={next}
          className="bg-black/10 px-[3px] ml-[2px] rounded-sm"
          disabled={page === totalPages - 1}
        >
          ▶
        </button>
      </div>
    </>
  )
}
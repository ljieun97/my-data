"use client";

import { Input } from "@heroui/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getCaptureMovieMaxCount, useCaptureContent } from "@/context/CaptureContentContext";
import { getDetail, getImages, getSearchMulti } from "@/lib/open-api/tmdb-client";

export default function SearchInput({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryKeyword = (searchParams.get("keyword") || "").trim();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState(queryKeyword);
  const [captureResults, setCaptureResults] = useState<any[]>([]);
  const [isLoadingCaptureResults, setIsLoadingCaptureResults] = useState(false);
  const [captureSearchError, setCaptureSearchError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedCaptureIndex, setHighlightedCaptureIndex] = useState(-1);
  const { captureMode, addMovie, hasMovie, selectedMovies } = useCaptureContent();
  const isCapturePage = pathname?.startsWith("/capture");
  const maxCaptureMovies = getCaptureMovieMaxCount(captureMode);

  const getCaptureResultMediaType = (result: any) => (result?.media_type === "tv" ? "tv" : "movie");
  const isCaptureResultDisabled = (result: any) => {
    const mediaType = getCaptureResultMediaType(result);
    return hasMovie(Number(result.id), mediaType) || selectedMovies.length >= maxCaptureMovies;
  };
  const getSelectableCaptureIndexes = () =>
    captureResults.reduce<number[]>((indexes, result, index) => {
      if (!isCaptureResultDisabled(result)) indexes.push(index);
      return indexes;
    }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextKeyword = e.target.value;
    setInputValue(nextKeyword);
    setHighlightedCaptureIndex(-1);

    if (isCapturePage) {
      return;
    }

    const nextUrl = `/search?keyword=${encodeURIComponent(nextKeyword)}`;
    router.push(nextUrl);
  };

  const handleSelectCaptureMovie = async (movie: any) => {
    let posterOptions: string[] = [];
    let detail: any = null;
    const mediaType = movie?.media_type === "tv" ? "tv" : "movie";
    try {
      setIsLoadingCaptureResults(true);
      const [images, detailResult] = await Promise.all([
        getImages(mediaType, movie.id),
        getDetail(mediaType, movie.id),
      ]);
      detail = detailResult;
      posterOptions = Array.isArray(images?.posters)
        ? [...images.posters]
            .sort((a: any, b: any) => {
              const aScore = a?.iso_639_1 === "ko" ? 0 : a?.iso_639_1 === "en" ? 1 : 2;
              const bScore = b?.iso_639_1 === "ko" ? 0 : b?.iso_639_1 === "en" ? 1 : 2;
              return aScore - bScore;
            })
            .map((poster: any) => poster.file_path)
            .filter(Boolean)
            .slice(0, 20)
        : [];
    } finally {
      setIsLoadingCaptureResults(false);
    }

    const didAdd = addMovie({
      ...movie,
      ...detail,
      media_type: mediaType,
      title: detail?.title || detail?.name || movie.title || movie.name,
      original_title: detail?.original_title || detail?.original_name || movie.original_title || movie.original_name,
      overview: movie.overview || detail?.overview || "한국어 overview가 없습니다.",
      release_date: detail?.release_date || detail?.first_air_date || movie.release_date || movie.first_air_date,
      poster_path: posterOptions[0] || detail?.poster_path || movie.poster_path,
      backdrop_path: detail?.backdrop_path || movie.backdrop_path || posterOptions[0],
      posterOptions,
    });
    if (didAdd) {
      setInputValue("");
      setCaptureResults([]);
      setHighlightedCaptureIndex(-1);
    }
  };

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [autoFocus]);

  useEffect(() => {
    if (!isCapturePage) {
      return;
    }

    const keyword = inputValue.trim();
    if (!keyword) {
      setCaptureResults([]);
      setIsLoadingCaptureResults(false);
      setCaptureSearchError("");
      setHighlightedCaptureIndex(-1);
      return;
    }

    let isCancelled = false;
    setIsLoadingCaptureResults(true);
    setCaptureSearchError("");

    const timerId = window.setTimeout(async () => {
      try {
        const data = await getSearchMulti(keyword, 1);
        if (isCancelled) return;

        const results = Array.isArray(data?.results)
          ? data.results
              .filter((item: any) => item?.media_type === "movie" || item?.media_type === "tv" || item?.title || item?.name)
              .filter((item: any, index: number, items: any[]) => {
                const mediaType = item?.media_type === "tv" ? "tv" : "movie";
                const key = `${mediaType}-${item?.id}`;
                return items.findIndex((candidate: any) => {
                  const candidateMediaType = candidate?.media_type === "tv" ? "tv" : "movie";
                  return `${candidateMediaType}-${candidate?.id}` === key;
                }) === index;
              })
              .slice(0, 6)
          : [];

        setCaptureResults(results);
        setHighlightedCaptureIndex(() =>
          results.findIndex((result: any) => {
            const mediaType = result?.media_type === "tv" ? "tv" : "movie";
            return !hasMovie(Number(result.id), mediaType) && selectedMovies.length < maxCaptureMovies;
          }),
        );
      } catch (error) {
        if (!isCancelled) {
          setCaptureResults([]);
          setCaptureSearchError("검색 결과를 불러오지 못했습니다");
          setHighlightedCaptureIndex(-1);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingCaptureResults(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      window.clearTimeout(timerId);
    };
  }, [captureMode, hasMovie, inputValue, isCapturePage, maxCaptureMovies, selectedMovies.length]);

  useEffect(() => {
    if (isCapturePage) {
      return;
    }

    setInputValue(queryKeyword);
  }, [isCapturePage, queryKeyword]);

  const showCaptureResults = isCapturePage && isFocused && (inputValue.trim() || captureResults.length);
  const handleCaptureInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isCapturePage || !showCaptureResults) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const selectableIndexes = getSelectableCaptureIndexes();
      if (!selectableIndexes.length) return;

      event.preventDefault();
      setHighlightedCaptureIndex((current) => {
        const currentPosition = selectableIndexes.indexOf(current);
        if (currentPosition < 0) {
          return event.key === "ArrowDown" ? selectableIndexes[0] : selectableIndexes[selectableIndexes.length - 1];
        }

        const nextPosition =
          event.key === "ArrowDown"
            ? (currentPosition + 1) % selectableIndexes.length
            : (currentPosition - 1 + selectableIndexes.length) % selectableIndexes.length;
        return selectableIndexes[nextPosition];
      });
      return;
    }

    if (event.key === "Enter") {
      const selectableIndexes = getSelectableCaptureIndexes();
      const selectedIndex = selectableIndexes.includes(highlightedCaptureIndex)
        ? highlightedCaptureIndex
        : selectableIndexes[0];
      const selectedResult = captureResults[selectedIndex];
      if (!selectedResult) return;

      event.preventDefault();
      void handleSelectCaptureMovie(selectedResult);
    }
  };

  return (
    <div className="relative w-full min-w-0">
      <Input
        ref={inputRef}
        aria-label="Search title"
        placeholder={isCapturePage ? "추가할 영화 검색" : "제목을 입력하세요."}
        className="w-full min-w-0 border-none shadow-none outline-none ring-0
          focus:border-none focus:outline-none focus:ring-0
          focus-visible:outline-none focus-visible:ring-0"
        value={inputValue}
        onChange={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setIsFocused(false), 120);
        }}
        onKeyDown={handleCaptureInputKeyDown}
        autoFocus={autoFocus}
      />

      {showCaptureResults ? (
        <div className="absolute left-1/2 top-full z-[140] mt-2 w-[min(24rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] -translate-x-1/2 overflow-hidden border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 sm:left-auto sm:right-0 sm:w-[22rem] sm:translate-x-0">
          {isLoadingCaptureResults ? (
            <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">검색 중</div>
          ) : null}

          {!isLoadingCaptureResults && captureSearchError ? (
            <div className="px-3 py-3 text-sm text-rose-600 dark:text-rose-300">{captureSearchError}</div>
          ) : null}

          {!isLoadingCaptureResults && !captureSearchError && inputValue.trim() && !captureResults.length ? (
            <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
              검색 결과가 없습니다
            </div>
          ) : null}

          {captureResults.map((result, index) => {
            const mediaType = getCaptureResultMediaType(result);
            const isAdded = hasMovie(Number(result.id), mediaType);
            const isDisabled = isCaptureResultDisabled(result);
            const yearSource = result.release_date || result.first_air_date;
            const year = yearSource ? String(yearSource).slice(0, 4) : "";
            const imagePath = result.poster_path || result.backdrop_path;
            const title = result.title || result.name;
            const isHighlighted = highlightedCaptureIndex === index;

            return (
              <button
                key={`${mediaType}-${result.id}`}
                type="button"
                disabled={isDisabled}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => {
                  if (!isDisabled) setHighlightedCaptureIndex(index);
                }}
                onClick={() => {
                  void handleSelectCaptureMovie(result);
                }}
                className={[
                  "flex w-full items-center gap-3 px-3 py-2 text-left transition disabled:cursor-default disabled:opacity-50",
                  isHighlighted
                    ? "bg-slate-100 dark:bg-slate-900"
                    : "hover:bg-slate-50 dark:hover:bg-slate-900",
                ].join(" ")}
              >
                {imagePath ? (
                  <img
                    alt=""
                    src={`https://image.tmdb.org/t/p/w185${imagePath}`}
                    className="h-14 w-10 shrink-0 object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-10 shrink-0 items-center justify-center bg-slate-200 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    NO
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {`${mediaType === "tv" ? "시리즈" : "영화"}${year ? ` · ${year}` : ""}`}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isAdded ? "추가됨" : selectedMovies.length >= maxCaptureMovies ? "가득참" : "추가"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

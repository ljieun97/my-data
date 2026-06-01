"use client";

import { Input } from "@heroui/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCaptureContent } from "@/context/CaptureContentContext";
import { getDetail, getImages, getSearchMulti, getSearchPeople } from "@/lib/open-api/tmdb-client";

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
  const { captureMode, addMovie, setPerson, hasMovie, selectedMovies } = useCaptureContent();
  const isCapturePage = pathname?.startsWith("/capture");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextKeyword = e.target.value;
    setInputValue(nextKeyword);

    if (isCapturePage) {
      return;
    }

    const nextUrl = `/search?keyword=${encodeURIComponent(nextKeyword)}`;
    router.push(nextUrl);
  };

  const handleSelectCaptureMovie = async (movie: any) => {
    let posterOptions: string[] = [];
    try {
      setIsLoadingCaptureResults(true);
      const images = await getImages("movie", movie.id);
      posterOptions = Array.isArray(images?.posters)
        ? images.posters.map((poster: any) => poster.file_path).filter(Boolean).slice(0, 20)
        : [];
    } finally {
      setIsLoadingCaptureResults(false);
    }

    const didAdd = addMovie({
      ...movie,
      poster_path: movie.poster_path || posterOptions[0],
      posterOptions,
    });
    if (didAdd) {
      setInputValue("");
      setCaptureResults([]);
    }
  };

  const handleSelectCapturePerson = async (person: any) => {
    try {
      setIsLoadingCaptureResults(true);
      const [detail, images] = await Promise.all([
        getDetail("person", person.id),
        getImages("person", person.id),
      ]);
      const profileOptions = Array.isArray(images?.profiles)
        ? images.profiles.map((profile: any) => profile.file_path).filter(Boolean).slice(0, 12)
        : [];

      setPerson({
        id: Number(person.id),
        name: detail?.name || person.name,
        profile_path: detail?.profile_path || person.profile_path || profileOptions[0],
        known_for_department: detail?.known_for_department || person.known_for_department,
        birthday: detail?.birthday,
        place_of_birth: detail?.place_of_birth,
        biography: detail?.biography,
        profileOptions,
      });
      setInputValue("");
      setCaptureResults([]);
    } finally {
      setIsLoadingCaptureResults(false);
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
      return;
    }

    let isCancelled = false;
    setIsLoadingCaptureResults(true);
    setCaptureSearchError("");

    const timerId = window.setTimeout(async () => {
      try {
        const data = captureMode === "person-cover"
          ? await getSearchPeople(keyword, 1)
          : await getSearchMulti(keyword, 1);
        if (isCancelled) return;

        const results = Array.isArray(data?.results)
          ? captureMode === "person-cover"
            ? data.results.filter((item: any) => item?.profile_path).slice(0, 6)
            : data.results
                .filter((item: any) => (item?.media_type === "movie" || item?.title) && item?.backdrop_path)
                .slice(0, 6)
          : [];

        setCaptureResults(results);
      } catch (error) {
        if (!isCancelled) {
          setCaptureResults([]);
          setCaptureSearchError("검색 결과를 불러오지 못했습니다");
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
  }, [captureMode, inputValue, isCapturePage]);

  useEffect(() => {
    if (isCapturePage) {
      return;
    }

    setInputValue(queryKeyword);
  }, [isCapturePage, queryKeyword]);

  const showCaptureResults = isCapturePage && isFocused && (inputValue.trim() || captureResults.length);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        aria-label="Search title"
        placeholder={isCapturePage ? (captureMode === "person-cover" ? "커버 인물 검색" : "추가할 영화 검색") : "제목을 입력하세요."}
        className="border-none shadow-none outline-none ring-0
          focus:border-none focus:outline-none focus:ring-0
          focus-visible:outline-none focus-visible:ring-0"
        value={inputValue}
        onChange={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setIsFocused(false), 120);
        }}
        autoFocus={autoFocus}
      />

      {showCaptureResults ? (
        <div className="absolute right-0 top-full z-[140] mt-2 w-[18rem] overflow-hidden border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 sm:w-[22rem]">
          {isLoadingCaptureResults ? (
            <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">검색 중</div>
          ) : null}

          {!isLoadingCaptureResults && captureSearchError ? (
            <div className="px-3 py-3 text-sm text-rose-600 dark:text-rose-300">{captureSearchError}</div>
          ) : null}

          {!isLoadingCaptureResults && !captureSearchError && inputValue.trim() && !captureResults.length ? (
            <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
              {captureMode === "person-cover" ? "프로필 이미지가 있는 인물이 없습니다" : "backdrop 이미지가 있는 영화가 없습니다"}
            </div>
          ) : null}

          {captureResults.map((result) => {
            const isPersonMode = captureMode === "person-cover";
            const isAdded = !isPersonMode && hasMovie(Number(result.id));
            const isDisabled = !isPersonMode && (isAdded || selectedMovies.length >= 5);
            const year = result.release_date ? String(result.release_date).slice(0, 4) : "";
            const imagePath = isPersonMode ? result.profile_path : result.poster_path || result.backdrop_path;
            const title = isPersonMode ? result.name : result.title;

            return (
              <button
                key={result.id}
                type="button"
                disabled={isDisabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (isPersonMode) {
                    void handleSelectCapturePerson(result);
                    return;
                  }

                  void handleSelectCaptureMovie(result);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-50 dark:hover:bg-slate-900"
              >
                <img
                  alt=""
                  src={`https://image.tmdb.org/t/p/w185${imagePath}`}
                  className="h-14 w-10 shrink-0 object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {isPersonMode ? result.known_for_department || "Person" : year || "개봉일 미정"}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isPersonMode ? "선택" : isAdded ? "추가됨" : selectedMovies.length >= 5 ? "가득참" : "추가"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

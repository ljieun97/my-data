"use client";

import { getContentByMood } from "@/lib/open-api/tmdb-client";
import { useRef, useState } from "react";

export default function MoodSelecter() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMovie, setIsMovie] = useState(false);
  const [movie, setMovie] = useState<any>();

  const discoverMovie = async (genres: string) => {
    setImageLoaded(false);
    try {
      const res = await getContentByMood(genres);
      setMovie(res);
      setIsMovie(true);
      targetRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } catch (e) {
      console.log(e);
    }
  };

  const moods = [
    { emoji: "🙂", genre: "12|16|18|28|10402|10751|10770" },
    { emoji: "😂", genre: "35" },
    { emoji: "😢", genre: "10752" },
    { emoji: "😍", genre: "10749" },
    { emoji: "😱", genre: "27|37|53|80" },
    { emoji: "🧠", genre: "36|99|878|9648" },
  ];

  return (
    <div className="content-panel min-h-[70vh] bg-transparent">
      <main className="flex flex-col items-center py-8 text-center sm:py-12">
        <b className="home-title text-3xl font-semibold tracking-[-0.04em]">How are you feeling today?</b>
        <p className="home-copy mt-3 max-w-xl text-sm leading-6">Select your mood and discover movies that match your emotions.</p>
        <div className="h-2" aria-hidden="true" />
        <div className="mt-2 grid w-full max-w-xl grid-cols-3 gap-3">
          {moods.map((mood, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => discoverMovie(mood.genre)}
              className="home-mood h-16 rounded-[20px] border text-2xl transition hover:-translate-y-0.5"
            >
              {mood.emoji}
            </button>
          ))}
        </div>
        <div className="h-4" aria-hidden="true" />
        <section className="w-full max-w-md" ref={targetRef}>
          {isMovie ? (
            <>
              <b className="home-title mb-3 block text-lg font-semibold">Recommended Movie</b>
              <div className="home-card overflow-hidden rounded-[24px] border shadow-[0_20px_44px_rgba(15,23,42,0.08)]">
                <div className="aspect-video w-full">
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${movie.backdrop_path}`}
                    alt="Movie"
                    className={`h-full w-full object-cover transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>
                <div className="justify-center p-4 text-sm">
                  <div className="text-slate-900 dark:text-slate-100">
                    {!imageLoaded ? (
                      <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
                        <span>Loading recommendation...</span>
                      </div>
                    ) : (
                      <>
                        <b className="block">{movie.title}</b>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{movie.release_date}</p>
                        {movie.overview ? (
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{movie.overview}</p>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </main>
      <footer className="home-copy py-4 text-center text-sm">2026 CineMood. All rights reserved.</footer>
    </div>
  );
}

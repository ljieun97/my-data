'use client'

import { getContentByMood } from "@/lib/open-api/tmdb-client";
import { getVideo } from "@/lib/open-api/tmdb-server";
import { useRef, useState } from "react";

export default function MainPage() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [isMovie, setIsMovie] = useState(false);
  const [movie, setmovie] = useState() as any;

  const discoverMovie = async (genres: string) => {
    try {
      targetRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      //12 어드벤처 16 애니메이션 18 드라마 28 액션 10402 음악 Fantasy 판타지 10751 패밀리 10770 tv방영용   
      //35 코미디
      //10752 전쟁 
      //10749 로맨스
      //27 호러 37 서부 53 스릴러 80 범죄
      //36 역사 99 다큐 878 공상과학 9648 미스테리 
      const res = await getContentByMood(genres)
      console.log(res)
      // const video = getVideo('movie', res.id)
      // console.log(video)
      setmovie(res)
      setIsMovie(true)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-white">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center text-center px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          How are you feeling today?
        </h1>
        <p className="text-gray-600 mb-8">
          Select your mood and discover movies that match your emotions.
        </p>
        {/* Mood Selection */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-12">
          <button className="p-6 rounded-2xl bg-pink-100 text-3xl hover:scale-105 transition" onClick={() => discoverMovie('12|16|18|28|10402|10751|10770')}>😊</button>
          <button className="p-6 rounded-2xl bg-yellow-100 text-3xl hover:scale-105 transition" onClick={() => discoverMovie('35')}>😂</button>
          <button className="p-6 rounded-2xl bg-blue-100 text-3xl hover:scale-105 transition" onClick={() => discoverMovie('10752')}>😢</button>
          <button className="p-6 rounded-2xl bg-green-100 text-3xl hover:scale-105 transition" onClick={() => discoverMovie('10749')}>😍</button>
          <button className="p-6 rounded-2xl bg-purple-100 text-3xl hover:scale-105 transition" onClick={() => discoverMovie('27|37|53|80')}>😱</button>
          <button className="p-6 rounded-2xl bg-gray-100 text-3xl hover:scale-105 transition" onClick={() => discoverMovie('36|99|878|9648')}>🤔</button>
        </div>
        {/* Movie Recommendations */}
        {isMovie &&
          <section ref={targetRef} id="movies" className="w-full max-w-2xl text-left">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recommended Movies</h2>
            <div className="">
              <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
                {movie?.backdrop_path &&
                  <img src={'https://image.tmdb.org/t/p/w500/' + movie.backdrop_path} alt="Movie 1" className="w-full h-40 object-cover" />
                }
                <div className="p-2 text-center text-sm font-medium text-gray-700">
                  {movie.title}
                  <p>{movie.release_date}</p>
                  {movie.overview && <p>{movie.overview}</p>}
                </div>
              </div>
            </div>
          </section>
        }
      </main>
      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm">
        © 2025 CineMood. All rights reserved.
      </footer>
    </div>
  )
} 
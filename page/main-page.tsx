'use client'

import { getContentByMood } from "@/lib/open-api/tmdb-client";
import { getVideo } from "@/lib/open-api/tmdb-server";
import { Button, Card, CardBody, CardFooter, Skeleton, Spacer, Spinner } from "@heroui/react";
import { useRef, useState } from "react";

export default function MainPage() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMovie, setIsMovie] = useState(false);
  const [movie, setmovie] = useState() as any;

  //12 어드벤처 16 애니메이션 18 드라마 28 액션 10402 음악 Fantasy 판타지 10751 패밀리 10770 tv방영용   
  //35 코미디
  //10752 전쟁 
  //10749 로맨스
  //27 호러 37 서부 53 스릴러 80 범죄
  //36 역사 99 다큐 878 공상과학 9648 미스테리 
  const discoverMovie = async (genres: string) => {
    setImageLoaded(false);
    try {
      const res = await getContentByMood(genres)
      console.log(res)
      setmovie(res)
      setIsMovie(true)
      targetRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } catch (e) {
      console.log(e)
    } finally {
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="flex flex-col items-center text-center py-14">
        {/* Title */}
        <b className="text-lg">
          How are you feeling today?
        </b>
        <p className="text-sm">
          Select your mood and discover movies that match your emotions.
        </p>
        <Spacer y={2}/>
        {/* Mood Selection */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-md">
          {[
            { emoji: "😊", genre: "12|16|18|28|10402|10751|10770" },
            { emoji: "😂", genre: "35" },
            { emoji: "😢", genre: "10752" },
            { emoji: "😍", genre: "10749" },
            { emoji: "😱", genre: "27|37|53|80" },
            { emoji: "🤔", genre: "36|99|878|9648" },
          ].map((mood, idx) => (
            <Button
              variant="faded"
              key={idx}
              onClick={() => discoverMovie(mood.genre)}
              className=""
            >
              {mood.emoji}
            </Button>
          ))}
        </div>
        <Spacer y={4} />
        {/* Movie Recommendations */}
        <section className="w-full">
          {isMovie &&
            <>
              <b className="text-lg">
                Recommended Movie
              </b>
              <Card>
                {/* Image */}
                <div className="h-40 bg-gray-200">
                  {movie?.backdrop_path &&
                    <img src={'https://image.tmdb.org/t/p/w500/' + movie.backdrop_path} alt="Movie 1"
                      className={`w-full h-full object-cover
                    transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                      onLoad={() => setImageLoaded(true)}
                    />
                  }
                </div>
                <CardFooter className="text-small justify-center">
                  <div className="">
                    {!imageLoaded ? (
                      <Spinner
                        color="default"
                        label="GPT가 영화를 찾고있습니다..."
                        variant="wave"
                      />
                    ) : (
                      <>
                        <b>
                          {movie.title}
                        </b>
                        <p className="text-default-500">
                          {movie.release_date}
                        </p>
                        {movie.overview && (
                          <p className="text-sm leading-relaxed line-clamp-3">
                            {movie.overview}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </>
          }
        </section>
      </main>
      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm">
        © 2025 CineMood. All rights reserved.
      </footer>
    </div>
  )
} 
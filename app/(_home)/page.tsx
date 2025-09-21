import ImagesSlider from "@/components/common/images-slider";
import { Banners } from "@/components/layout/banners";
import { BannersSkel } from "@/components/layout/banners-skel";
import { Link, Spacer } from "@heroui/react";
import { getDetail } from "@/lib/open-api/tmdb-server"
import { getContentByMood } from "@/lib/open-api/tmdb-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "홈"
}
const Home = async () => {
  const banners = await Promise.all([
    getDetail('movie', 872585), //오펜
    getDetail('movie', 792307), //가여운것들
    getDetail('movie', 915935), //추락의해부
  ])
  const random = Math.floor(Math.random() * banners.length)
  const movie = banners[random]

  const test = await getContentByMood(35)
  console.log(test)

  return (
    <>
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
            <button className="p-6 rounded-2xl bg-pink-100 text-3xl hover:scale-105 transition">😊</button>
            <button className="p-6 rounded-2xl bg-yellow-100 text-3xl hover:scale-105 transition">😂</button>
            <button className="p-6 rounded-2xl bg-blue-100 text-3xl hover:scale-105 transition">😢</button>
            <button className="p-6 rounded-2xl bg-green-100 text-3xl hover:scale-105 transition">😍</button>
            <button className="p-6 rounded-2xl bg-purple-100 text-3xl hover:scale-105 transition">😱</button>
            <button className="p-6 rounded-2xl bg-gray-100 text-3xl hover:scale-105 transition">🤔</button>
          </div>


          {/* Movie Recommendations */}
          <section id="movies" className="w-full max-w-2xl text-left">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recommended Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
                <img src="/placeholder-movie1.jpg" alt="Movie 1" className="w-full h-40 object-cover" />
                <div className="p-2 text-center text-sm font-medium text-gray-700">Movie Title 1</div>
              </div>
              <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
                <img src="/placeholder-movie2.jpg" alt="Movie 2" className="w-full h-40 object-cover" />
                <div className="p-2 text-center text-sm font-medium text-gray-700">Movie Title 2</div>
              </div>
              <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
                <img src="/placeholder-movie3.jpg" alt="Movie 3" className="w-full h-40 object-cover" />
                <div className="p-2 text-center text-sm font-medium text-gray-700">Movie Title 3</div>
              </div>
            </div>
          </section>
        </main>


        {/* Footer */}
        <footer className="py-4 text-center text-gray-500 text-sm">
          © 2025 CineMood. All rights reserved.
        </footer>
      </div>
      {/* <div className="absolute top-0 left-0 w-full h-full">
        {movie ?
          <Banners movie={movie} />
          :
          <BannersSkel />
        }
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between px-6 pt-8">
            <span className="text-lg font-bold">최신 영화</span>
          </div>
          <ImagesSlider type="getTodayMovies" />

          <div className="flex justify-between px-6 pt-8">
            <span className="text-lg font-bold">최신 시리즈</span>
          </div>
          <ImagesSlider type="getTodaySeries" />

          <div className="flex justify-between px-6 pt-8">
            <span className="text-lg font-bold">평단의 찬사를 받은 영화</span>
          </div>
          <ImagesSlider type="getTopRatedMovies" />

          <Spacer y={8} />
        </div>
      </div> */}
    </>
  )
}

export default Home
import ImagesSlider from "@/components/common/images-slider";
import { Banners } from "@/components/layout/banners";
import { BannersSkel } from "@/components/layout/banners-skel";
import { Link, Spacer } from "@heroui/react";
import { getDetail } from "@/lib/themoviedb/tmdb"

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

  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full">
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

          {/* <div className="flex justify-between pt-8 pb-2">
            <span className="text-lg font-bold">추천 영화</span>
          </div>
          <ImagesSlider contents={await getRecommendMovies('12')} />

          <div className="flex justify-between pt-8 pb-2">
            <span className="text-lg font-bold">추천 시리즈</span>
          </div>
          <ImagesSlider contents={await getRecommendSeries('12')} /> */}
        </div>
      </div>
    </>
  )
}

export default Home
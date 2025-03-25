import ImagesSlider from "@/components/common/images-slider";
import Title from "@/components/common/title"
import { Banners } from "@/components/layout/banners";
import { BannersSkel } from "@/components/layout/banners-skel";
import { getDetail, getRecommendMovies, getRecommendSeries, getTodayMovies, getTodaySeries } from "@/lib/themoviedb/api";
import { Link, Spacer } from "@heroui/react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "홈"
}

const Home = async () => {
  const banners = await Promise.all([
    getDetail('movie', 872585), //오펜
    // getDetail('movie', 346698), //바비
    getDetail('movie', 792307), //가여운것들
    getDetail('movie', 840430), //바튼
    getDetail('movie', 915935), //추락의해부
    // getDetail('movie', 508883), //그어살
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

        <div className="p-6 mx-auto max-w-7xl">
          <div className="flex justify-between pt-8 pb-2">
            <span className="text-lg font-bold">최신 영화</span>
            <Link href="/movie" color="success">더보기</Link>
          </div>
          <ImagesSlider contents={await getTodayMovies()} />

          <div className="flex justify-between pt-8 pb-2">
            <span className="text-lg font-bold">최신 시리즈</span>
            <Link href="/tv" color="success">더보기</Link>
          </div>
          <ImagesSlider contents={await getTodaySeries()} />

          <div className="flex justify-between pt-8 pb-2">
            <span className="text-lg font-bold">최신 영화</span>
            <Link href="/movie" color="success">더보기</Link>
          </div>
          <ImagesSlider contents={await getTodayMovies()} />

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
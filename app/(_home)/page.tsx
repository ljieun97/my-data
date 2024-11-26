import Title from "@/components/common/title"
import { Banners } from "@/components/layout/banners";
import { BannersSkel } from "@/components/layout/banners-skel";
import TodayList from "@/components/movie/today-list"
import { getDetail } from "@/lib/themoviedb/api";
import { Link, Spacer } from "@nextui-org/react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "홈"
}

const Home = async () => {
  const movies = [
    //await getMovieDetail(568124),
    //2024 아카데미 - 오펜하이머 가여운것들 바비 그어살 바튼 추락의해부 
    await getDetail('movie', 872585),
    await getDetail('movie', 792307),
    await getDetail('movie', 346698),
    await getDetail('movie', 508883),
    // await getDetail('movie', 840430), 흰색배경
    await getDetail('movie', 915935),
  ]
  const random = Math.floor(Math.random() * movies.length)
  const movie = movies[random]
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
            <Title title={'최신 영화'} />
            <Link href="/movie" color="success">더보기</Link>
          </div>
          <TodayList type={'movie'} />

          <div className="flex justify-between pt-8 pb-2">
            <Title title={'최신 시리즈'} />
            <Link href="/tv" color="success">더보기</Link>
          </div>
          <TodayList type={'tv'} />

          <div className="flex justify-between pt-8 pb-2">
            <Title title={'최신 애니메이션'} />
            <Link href="/tv" color="success">더보기</Link>
          </div>
          {/* <Suspense fallback={<h1>loading</h1>}> */}
          <TodayList type={'anime'} />
          {/* </Suspense> */}

          <div className="flex justify-between pt-8 pb-2">
            <Title title={'추천 영화'} />
          </div>
          <TodayList type={'removie'} />

          <div className="flex justify-between pt-8 pb-2">
            <Title title={'추천 시리즈'} />
          </div>
          <TodayList type={'retv'} />
        </div>

      </div>



    </>
  )
}

export default Home
import Title from "@/components/common/title"
import { Banners } from "@/components/layout/banners";
import TodayList from "@/components/movie/today-list"
import { getDetail } from "@/lib/themoviedb/api";
import { Link } from "@nextui-org/react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "홈"
}

const Home = async () => {
  const movies = [
    //await getMovieDetail(568124),
    //2024 아카데미 - 오펜하이머 가여운것들 바비 그어살 추락의해부 
    await getDetail('movie', 872585),
    await getDetail('movie', 792307),
    await getDetail('movie', 346698),
    await getDetail('movie', 508883),
    await getDetail('movie', 840430),
    await getDetail('movie', 915935),
  ]
  const random = Math.floor(Math.random() * movies.length)
  const movie = movies[random]
  return (
    <>
      <Banners movie={movie} />

      <div className="flex justify-between pt-8 pb-4">
        <Title title={'영화'} />
        <Link href="/movie" color="success">더보기</Link>
      </div>
      {/* <Suspense fallback={<h1>loading</h1>}> */}
      <TodayList type={'movie'} />
      {/* </Suspense> */}

      <div className="flex justify-between pt-8 pb-4">
        <Title title={'TV'} />
        <Link href="/tv" color="success">더보기</Link>
      </div>
      {/* <Suspense fallback={<h1>loading</h1>}> */}
      <TodayList type={'tv'} />
      {/* </Suspense> */}

      <div className="flex justify-between pt-8 pb-4">
        <Title title={'애니메이션'} />
        <Link href="/tv" color="success">더보기</Link>
      </div>
      {/* <Suspense fallback={<h1>loading</h1>}> */}
      <TodayList type={'anime'} />
      {/* </Suspense> */}
    </>
  )
}

export default Home
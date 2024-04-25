import Title from "@/components/common/title"
import MainMovie from "@/components/movie/main-movie"
import TodayList from "@/components/movie/today-list"
import { Link } from "@nextui-org/react";

export const metadata = {
  title: "홈"
}

const Home = () => {
  return (
    <>
      <MainMovie />
      {/* 로딩이 나중에 보임 */}
      {/* <Suspense fallback={<h1>loading</h1>}>
        <AcademyMovies />
      </Suspense>
      <Divider className="my-4" /> */}

      <div className="px-8">
        <div className="flex justify-between">
          <Title title={'영화'} />
          <Link href="/movie" color="success">더보기</Link>
        </div>
        {/* <Suspense fallback={<h1>loading</h1>}> */}
        <TodayList type={'movie'} />
        {/* </Suspense> */}

        <div className="flex justify-between">
          <Title title={'TV'} />
          <Link href="/tv" color="success">더보기</Link>
        </div>
        {/* <Suspense fallback={<h1>loading</h1>}> */}
        <TodayList type={'tv'} />
        {/* </Suspense> */}

        <div className="flex justify-between">
          <Title title={'애니메이션'} />
          <Link href="/tv" color="success">더보기</Link>
        </div>
        {/* <Suspense fallback={<h1>loading</h1>}> */}
        <TodayList type={'anime'} />
        {/* </Suspense> */}
      </div>
    </>
  )
}

export default Home
import Title from "@/components/common/title"
import AcademyMovies from "@/components/movie/academy-movies"
import TodayList from "@/components/movie/today-list"

export const metadata = {
  title: "홈"
}

const Home = () => {
  return (
    <>


      {/* 로딩이 나중에 보임 */}
      {/* <Suspense fallback={<h1>loading</h1>}>
        <AcademyMovies />
      </Suspense>
      <Divider className="my-4" /> */}

      <Title title={'영화'} />
      {/* <Suspense fallback={<h1>loading</h1>}> */}
      <TodayList type={'movie'} />
      {/* </Suspense> */}


      <Title title={'TV'} />
      {/* <Suspense fallback={<h1>loading</h1>}> */}
      <TodayList type={'tv'} />
      {/* </Suspense> */}


      <Title title={'애니메이션'} />
      {/* <Suspense fallback={<h1>loading</h1>}> */}
      <TodayList type={'anime'} />
      {/* </Suspense> */}
    </>
  )
}

export default Home
import Title from "@/components/common/title"
import AcademyMovies from "@/components/movie/academy-movies"
import TodayList from "@/components/movie/today-list"
import { Divider } from "@nextui-org/react"
import { Suspense } from "react"

export const metadata = {
  title: "홈"
}

const Home = () => {
  return (
    <>
       <Title title={'TEST'} />
      <Suspense fallback={<h1>loading</h1>}>
        <AcademyMovies />
      </Suspense>
      <Divider className="my-4" />

      <Title title={'최신 업데이트된 영화'} />
      <Suspense fallback={<h1>loading</h1>}>
        <TodayList type={'movie'} />
      </Suspense>
      <Divider className="my-4" />

      <Title title={'오늘 업데이트된 시리즈'} />
      <Suspense fallback={<h1>loading</h1>}>

        <TodayList type={'tv'} />
      </Suspense>

    </>
  )
}

export default Home
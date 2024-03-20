import Title from "@/components/common/title"
import AcademyMovies from "@/components/movie/academy-movies"
import TodayList from "@/components/movie/today-list"
import { Divider } from "@nextui-org/react"

export const metadata = {
  title: "홈"
}

const Home = () => {
  return (
    <>
      <AcademyMovies />
      <Divider className="my-4" />

      <Title title={'최신 업데이트된 영화'} />
      <TodayList type={'movie'} />
      <Divider className="my-4" />

      <Title title={'오늘 업데이트된 시리즈'} />
      <TodayList type={'tv'} />

    </>
  )
}

export default Home
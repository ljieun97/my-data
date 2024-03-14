import Title from "@/components/common/title"
import AcademyMovies from "@/components/movie/academy-movies"
import TodayMovies from "@/components/movie/today-movies"
import TodaySeries from "@/components/movie/today-series"
import { Divider } from "@nextui-org/react"

export const metadata = {
  title: "홈"
}

const Home = () => {
  return (
    <>
      <Title title={'2024 아카데미 수상작'} />
      <AcademyMovies />
      <Divider className="my-4" />

      <Title title={'이번달 업데이트된 영화'} />
      <TodayMovies />
      <Divider className="my-4" />
      
      <Title title={'오늘 업데이트된 시리즈'} />
      <TodaySeries /> 
     
    </>
  )
}

export default Home
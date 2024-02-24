import Title from "@/components/common/title";
import TodaySeries from "@/components/movie/today-series";

export const metadata = {
  title: "Home"
}

const Home = () => {
  return (
    <>
      <Title title={'오늘 업데이트된 영화 및 시리즈'} />
      <TodaySeries />
    </>
  )
}

export default Home
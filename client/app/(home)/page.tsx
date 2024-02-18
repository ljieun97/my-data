
import TodaySeries from "@/components/movie/today-series";

export const metadata = {
  title: "Home"
}

const Home = () => {
  return (
    <>
      <h4>Today</h4>
      <TodaySeries />
    </>
  )
}

export default Home
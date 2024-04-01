
import MyMovies from "@/components/movie/my-movies";
import Title from "@/components/common/title";

export const metadata = {
  title: "시청 목록"
}

const MyPage = () => {
  return (
    <>
      <Title title={'시청 목록'} />
      <MyMovies />
    </>
  )
}

export default MyPage





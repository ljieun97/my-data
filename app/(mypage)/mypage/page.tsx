
import MyMovies from "@/components/movie/my-movies";
import Title from "@/components/common/title";

export const metadata = {
  title: "마이페이지"
}

const MyPage = () => {
  return (
    <>
      <Title title={'마이페이지'} />
      <MyMovies />
    </>
  )
}

export default MyPage





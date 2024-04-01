import Title from "@/components/common/title";
import LikeMovies from "@/components/movie/like-movies";

export const metadata = {
  title: "찜 목록"
}

export default function LikePage() {
  return (
    <>
      <Title title={'찜 목록'} />
      <LikeMovies />
    </>
  )
}
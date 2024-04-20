import Title from "@/components/common/title"
import MovieList from "@/components/movie/movie-list"

export const metadata = {
  title: "시리즈"
}

export default function Page() {
  return (
    <>
      <Title title={'시리즈'} />
      <MovieList type={'tv'} />
    </>
  )
}
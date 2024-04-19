import Title from "@/components/common/title"
import MovieList from "@/components/movie/movie-list"

export const metadata = {
  title: "영화"
}

export default function Page () {
  return (
    <>
      <Title title={'영화'} />
      {/* <Suspense fallback={<h1>loading</h1>}> */}
        <MovieList />
      {/* </Suspense> */}
    </>
  )
}
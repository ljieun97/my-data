import Title from "@/components/common/title"
import MovieList from "@/components/movie/movie-list"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "영화"
}

export default function Page() {
  return (
    <>
      {/* <Suspense fallback={<h1>loading</h1>}> */}
      <MovieList type={'movie'} />
      {/* </Suspense> */}
    </>
  )
}
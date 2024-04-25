import Title from "@/components/common/title"
import MovieList from "@/components/movie/movie-list"

export const metadata = {
  title: "영화"
}

export default function Page () {
  return (
    <div className="px-8 py-4">
      <Title title={'영화'} />
      {/* <Suspense fallback={<h1>loading</h1>}> */}
        <MovieList type={'movie'}/>
      {/* </Suspense> */}
    </div>
  )
}
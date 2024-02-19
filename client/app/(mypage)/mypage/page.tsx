import MyMovies from "@/components/movie/my-movies"
import { Suspense } from "react"

const MyPage = async () => {
  return (
    <Suspense fallback={<h1>Loading my page...</h1>}>
      <MyMovies />
    </Suspense>
  )
}

export default MyPage
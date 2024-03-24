import { Banners } from "../layout/banners"
import { getMovieDetail } from "@/lib/themoviedb/api"

export default async function AcademyMovies() {
  const movies = [
    //test
    //await getMovieDetail(568124),
    //오펜하이머 가여운것들 바비 그어살 추락의해부 
    await getMovieDetail(872585),
    await getMovieDetail(792307),
    await getMovieDetail(346698),
    await getMovieDetail(508883),
    await getMovieDetail(840430),
    await getMovieDetail(915935),
  ]
  return (
    <>


        <Banners list={movies} />
    
    </>
  )
}
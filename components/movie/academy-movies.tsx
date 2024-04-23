import { Banners } from "../layout/banners"
import { getDetail } from "@/lib/themoviedb/api"

export default async function AcademyMovies() {
  const movies = [
    //await getMovieDetail(568124),
    //오펜하이머 가여운것들 바비 그어살 추락의해부 
    await getDetail('movie', 872585),
    await getDetail('movie', 792307),
    await getDetail('movie', 346698),
    await getDetail('movie', 508883),
    await getDetail('movie', 840430),
    await getDetail('movie', 915935),
  ]
  const movie = await getDetail('movie', 872585)
  return (
    <>
      {/* {JSON.stringify(movies)} */}
      <Banners movie={movie} />
    </>
  )
}
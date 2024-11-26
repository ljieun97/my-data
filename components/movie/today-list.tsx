import { getMonthAnime, getRecommendMovies, getRecommendSeries, getTodayMovies, getTodaySeries } from "@/lib/themoviedb/api"
import ImagesSlider from "../common/images-slider"
import InfiniteImages from "../common/infinite-images"
import { GetGenreCount, GetMovieCount } from "@/lib/mongo/movie"


export default async function TodayList(props: any) {

  // let test = await GetMovieCount() server에서 mongo 가져오는거 필요
  // console.log(test)

  let contents = []
  switch (props.type) {
    case 'movie':
      contents = await getTodayMovies()
      break
    case 'tv':
      contents = await getTodaySeries()
      break
    case 'anime':
      contents = await getMonthAnime()
      break
    case 'removie':

      contents = await getRecommendMovies('12')
      break
    case 'retv':
      contents = await getRecommendSeries('12')
      break
  }

  return (
    <div className="pb-4">
      {/* <InfiniteImages contents={contents}/> */}
      <ImagesSlider contents={contents} />
    </div>
  )
}
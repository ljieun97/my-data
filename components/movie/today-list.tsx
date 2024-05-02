import { getMonthAnime, getTodayMovies, getTodaySeries } from "@/lib/themoviedb/api"
import ImagesSlider from "../layout/images-slider"
import InfiniteImages from "../common/infinite-images"

export default async function TodayList(props: any) {
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
  }

  return (
    <div className="pb-4">
      <InfiniteImages contents={contents}/>
      {/* <ImagesSlider contents={contents} /> */}
    </div>
  )
}
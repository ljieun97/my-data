import { getMonthAnime, getTodayMovies, getTodaySeries } from "@/lib/themoviedb/api"
import ImagesSlider from "../layout/images-slider"

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
    <>
      <ImagesSlider contents={contents} />
    </>
  )
}
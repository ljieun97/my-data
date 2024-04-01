import { getMonthAnime, getTodayMovies, getTodaySeries } from "@/lib/themoviedb/api"
import ImagesSlider from "../layout/images-slider"

export default async function TodayList(props: any) {
  let movies = []
  switch (props.type) {
    case 'movie':
      movies = await getTodayMovies()
      break
    case 'tv':
      movies = await getTodaySeries()
      break
    case 'anime':
      movies = await getMonthAnime()
      break
  }

  return (
    <>
      <ImagesSlider movies={movies} />
    </>
  )
}
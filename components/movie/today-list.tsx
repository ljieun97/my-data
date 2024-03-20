import MovieCard from "./movie-card"
import { getTodayMovies, getTodaySeries } from "@/lib/themoviedb/api"
import ImagesSlider from "../layout/images-slider"

export default async function TodayList(props: any) {
  let movies = []
  if(props.type=='movie') {
    movies = await getTodayMovies()
  } else if(props.type=='tv') {
    movies = await getTodaySeries()
  } 

  return (
    <>
      <ImagesSlider movies={movies} />
    </>
  )
}
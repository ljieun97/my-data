import MovieCard from "./movie-card";
import { getTodayMovies, getTodaySeries } from "@/lib/themoviedb/api"

export default async function TodayList(props: any) {
  let movies = []
  if(props.type=='movie') {
    movies = await getTodayMovies()
  } else if(props.type=='tv') {
    movies = await getTodaySeries()
  } 

  return (
    <>
      <div className="gap-3 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {movies.map((movie: any) => (
          <MovieCard key={movie.id} movie={movie} ></MovieCard>
        ))}
      </div>
    </>
  )
}
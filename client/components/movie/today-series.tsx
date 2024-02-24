
import Config from "@/config.json"
import MovieCard from "./movie-card";

const API_URL = "https://api.themoviedb.org/3/discover/tv"
const API_KEY = Config.TMDB_API_KEY

const getToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + (date.getDate())).slice(-2)
  return `${year}-${month}-${day}`
}

const getMovies = async () => {
  //3구글 8넷플릭스 9아마존 96네이버 97왓챠 337디즈니 350애플 356웨이브
  const response = await fetch(API_URL + `?air_date.gte=${getToday()}&air_date.lte=${getToday()}&language=ko&watch_region=KR&with_watch_providers=8|9|96|97|337|350|356`, {
    method: "GET",
    headers: {
      accept: 'application/json',
      "Authorization": `Bearer ${API_KEY}`
    },
  })
  const json = await response.json()
  return json.results
}

const TodaySeries = async () => {
  const movies = await getMovies()
  return (
    <>
      <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies?.map((movie: { id: string, title: string, name: string, image: string, poster_path: string, media_type: string }) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </>
  )
}

export default TodaySeries
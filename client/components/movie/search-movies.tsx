import Config from "@/config.json"
import MovieCard from "./movie-card";

const API_URL = "https://api.themoviedb.org/3/search/multi"
const API_KEY = Config.TMDB_API_KEY

const getMovies = async (id: string) => {
  const response = await fetch(API_URL + '?query=' + id + '&language=ko&page=1', {
    method: "GET",
    headers: {
      accept: 'application/json',
      "Authorization": `Bearer ${API_KEY}`
    },
  })
  const json = await response.json()
  return json.results
}

const SearchMovie = async ({ id }: { id: string }) => {
  const movies = await getMovies(id)
  return (
    <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies?.map((movie: { id: string, title: string, name: string, image: string, poster_path: string, media_type: string }) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default SearchMovie
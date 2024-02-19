import Link from "next/link"
import CreateMovie from "./create-movie"
import Image from "next/image"

const API_URL = "https://api.themoviedb.org/3/search/multi"
const API_KEY = process.env.API_KEY_TMDB

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
    <div style={{ display: 'flex', flexWrap: 'wrap', height: 'calc(100% - 36px)', overflowY: 'auto' }}>
      {movies?.map((movie: { id: string, title: string, name: string, image: string, poster_path: string, media_type: string }) => (
        <div key={movie.id} style={{ width: '25%', height: '360px', padding: '5px' }}>
          <Link href={`/movie/${movie.id}`}>{movie.title ? movie.title : movie.name}</Link>
          <Image fill={true} alt="poster" src={`https://www.themoviedb.org/t/p/w1280/${movie.poster_path}`}  />
          <input type="date" />
          {movie.media_type}
          <CreateMovie movie={movie} />
        </div>
      ))}
    </div>
  )
}

export default SearchMovie
import Link from "next/link"
import CreateMovie from "./create-movie"
import Image from "next/image"

const API_URL = "https://api.themoviedb.org/3/discover/tv"
const API_KEY = process.env.TMDB_API_KEY

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
      <div style={{ display: 'flex', flexWrap: 'wrap', height: 'calc(100% - 36px)', overflowY: 'auto' }}>
        {movies?.map((movie: { id: string, title: string, name: string, image: string, poster_path: string, media_type: string }) => (
          <div key={movie.id} style={{ width: '25%', height: '360px', padding: '5px' }}>
            <Link href={`/movie/${movie.id}`}>{movie.title ? movie.title : movie.name}</Link>
            <Image width={1280} height={640} alt="poster" src={`https://www.themoviedb.org/t/p/w1280/${movie.poster_path}`} style={{ width: '100%', height: '80%' }} />
            <input type="date" />
            <CreateMovie movie={movie} />
          </div>
        ))}
      </div>
    </>
  )
}

export default TodaySeries
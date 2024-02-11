import Link from "next/link"

export const metadata = {
  title: "Home"
}

export const API_URL = "https://api.themoviedb.org/3/search/movie?query=웡카&language=ko&page=1"
const key = ""

async function getMovies() {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      accept: 'application/json',
      "Authorization": `Bearer ${key}`
    }
  })
  const json = await response.json()
  return json.results
}

export default async function Home() {
  const movies = await getMovies()
  return (
    <div>
      {movies.map((movie: { id: string, title: string }) => (
        <li key={movie.id}>
          <Link href={`/movie/${movie.id}`}>{movie.title}</Link>
        </li>
      ))}
    </div>
  )
}

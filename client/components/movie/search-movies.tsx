import Link from "next/link"
import CreateMovie from "./create-movie"

const API_URL = "https://api.themoviedb.org/3/search/movie"
// const API_KEY = process.env.API_KEY_TMDB
const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZjkwNjhiYjlhYzEwM2UxZmVmODZiYmMzMmU0MjdjZiIsInN1YiI6IjYzZmIwYTQwMzQ0YThlMDBlNmNlMDk2OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.GyhHdVATnofwAdYZ0-yV1uX30FqrTU_QGBJH3mcQNqQ"

async function getMovies(id: string) {
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

async function createMovie(movie: { title: string, image: string }) {
  await fetch('/movie', {
    method: "POST",
    body: JSON.stringify(movie),
  })
}

export default async function SearchMovie({ id }: { id: string }) {
  const movies = await getMovies(id)

  return (
    <div>
      <table style={{ backgroundColor: '', width: '100%' }}>
        <tbody>
          {movies.map((movie: { id: string, title: string, image: string }) => (
            <tr key={movie.id}>
              <td width="10%">
                <input
                  type="date"
                />
              </td>
              <td>
                <Link href={`/movie/${movie.id}`}>{movie.title}</Link>
              </td>
              <td width="15%" >
                {movie.id}
              </td>
              <td width="10%">
                {/* <button onClick={() => createMovie(movie)}>등록</button> */}
                <CreateMovie movie={movie}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
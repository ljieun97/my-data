import Link from "next/link"

const API_URL = "https://api.themoviedb.org/3/search/movie"
const API_KEY = process.env.API_KEY_TMDB

async function getMovies(id: string) {
  const response = await fetch(API_URL+'?query='+id+'&language=ko&page=1', {
		method: "GET",
		headers: {
			accept: 'application/json',
			"Authorization": `Bearer ${API_KEY}`
		},
	})
	const json = await response.json()
  return json.results
}

export default async function SearchMovie({id}: {id: string}) {
  const movies = await getMovies(id)

  return (
    <div>
      <table style={{backgroundColor: '', width: '100%'}}>
      <tbody>
      {movies.map((movie: { id: string, title: string }) => (
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
            별점
          </td>
          <td width="10%">
              <button>등록</button>
          </td>
        </tr>
      ))}
      </tbody>
    </table>
    </div>
  )
}
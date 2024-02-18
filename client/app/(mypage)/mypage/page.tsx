"use client"

import DeleteMovie from "@/components/movie/delete-movie"
import Link from "next/link"

const getMyMovies = async () => {
  const response = await fetch('http://localhost:3000/api/movie', {
    method: "GET"
  })
  return await response.json()
}

const MyPage = async () => {
  const movies = await getMyMovies()
  return (
    <>
      <h4>마이페이지</h4>
      <div>
        <table style={{ backgroundColor: '', width: '100%' }}>
          <tbody>
            {movies.map((movie: {_id: string, title: string, date: string, rating: number, info: {id: string, image: string, media_type: string}}) => (
              <tr key={movie._id}>
                <td width="10%">
                  <input
                    type="date"
                    defaultValue={movie.date}
                  />
                </td>
                <td>
                  <Link href={`/movie/${movie.info.id}`}>{movie.title}</Link>
                </td>
                <td width="15%" >
                {movie.rating}
                </td>
                <td width="10%">
                  <DeleteMovie id={movie._id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default MyPage
"use client"

// import MyMovies from "@/components/movie/my-movies"
// import { Suspense } from "react"

import Link from "next/link"
import { getMovies, deleteMovie } from "@/lib/mongo/movie"


export const dynamic = 'force-dynamic';

const onClickDelete = (id: string) => {
  deleteMovie({id: id})
}

const MyPage = async () => {
  // return (
    // <Suspense fallback={<h1>Loading my page...</h1>}>
    //   <MyMovies />
    // </Suspense>
    
  // )

  const movies = await getMovies()
  return (
    <>
      <h4>마이페이지</h4>
      <div>
        <table style={{ backgroundColor: '', width: '100%' }}>
          <tbody>
            {movies?.map((movie: {_id: string, title: string, date: string, rating: number, info: {id: string, image: string, media_type: string}}) => (
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
                  <button onClick={() => {
                      onClickDelete(movie._id)
                    }}>삭제</button>
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





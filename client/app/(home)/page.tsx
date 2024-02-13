import Link from "next/link"
import {GET} from "@/app/api/movie/route"

export const metadata = {
  title: "Home"
}

export default async function Home() {
  const movies = await GET()
  console.log(movies)
  return (
    <div>
      
      {JSON.stringify(movies)}
      {/* {movies.map((movie: { id: string, title: string }) => (
        <li key={movie.id}>
          <Link href={`/movie/${movie.id}`}>{movie.title}</Link>
        </li>
      ))} */}
    </div>
  )
}

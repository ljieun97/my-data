import { Avatar, Tooltip } from "@nextui-org/react";
import { getSearchList } from "@/lib/themoviedb/api";
import MovieCard from "./movie-card";

export default async function SearchList(props: any) {
  const movies = await getSearchList(props.keyword)
  return (
    <>
      <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie: { id: string, title: string, name: string, image: string, poster_path: string, media_type: string }) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </>
  )
}
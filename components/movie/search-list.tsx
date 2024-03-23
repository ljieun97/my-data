

import { Avatar, Tooltip } from "@nextui-org/react";
import { getSearchList } from "@/lib/themoviedb/api";
import MovieCard from "./movie-card";
// import { useEffect, useState } from "react";
"use server"
export default async function SearchList(props: any) {
  const movies = await getSearchList(props.keyword)
  // console.log(movies)
  // const [movies, setMovies] = useState([])
  // useEffect(() => {
  //   (async () => {
  //     const list = await getSearchList(props.keyword)
  //     console.log(list)
  //     setMovies(list)
  

  //   })()
  // })
  // useEffect(() => {
  //   (async () => {
      // const API_KEY = '8f9068bb9ac103e1fef86bbc32e427cf'
      // const URL = `https://api.themoviedb.org/3/search/multi?query=${props.keyword}&language=ko&page=1&api_key=${API_KEY}`
      // console.log(URL)
      // const response = await fetch(URL)
      // const { results } = await response.json()
    //   console.log(results)
    // })()


    // return results?.filter((e: any) => e.media_type != "person")


  // }, [])
  return (
    <>
      <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies && movies.map((movie: { id: string, title: string, name: string, image: string, poster_path: string, media_type: string }) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </>
  )
}
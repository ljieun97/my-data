'use client'

import { Banners } from "../layout/banners";
import { useEffect, useState } from "react";

export default function AcademyMovies() {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    (async () => {
      //오펜하이머 가여운것들 바비 그어살 추락의해부 
      const results = [
        //test
        // await (await fetch('/api/tm-movie/detail/568124')).json(),
        await (await fetch('/api/tm-movie/detail/872585')).json(),
        await (await fetch('/api/tm-movie/detail/792307')).json(),
        await (await fetch('/api/tm-movie/detail/346698')).json(),
        await (await fetch('/api/tm-movie/detail/508883')).json(),
        await (await fetch('/api/tm-movie/detail/840430')).json(),
        await (await fetch('/api/tm-movie/detail/915935')).json(),
      ]
      setMovies(movies.concat(...results))
    })()
  }, [])

  return (
    <>
      <Banners list={movies} />
    </>
  )
}
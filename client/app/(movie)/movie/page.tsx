import MyMovie from "@/components/movie/my-movie";
import SearchMovies from "@/components/movie/search-movies";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Movie = () => {


  return (
    <>
      {/* <MyMovie /> */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            placeholder="영화 제목"
            style={{ width: '100%' }}
          />
        </div>
        <SearchMovies id={"웡카"} />
      </div>
    </>
  )
}

export default Movie

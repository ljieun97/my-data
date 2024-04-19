

import MovieCard from "../movie/movie-card"


export default function InfiniteImages(props: any) {
  return (
    <>


      <div className="gap-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {props.contents?.map((content: any, index: number) => (
          <MovieCard key={index} content={content} ></MovieCard>
        ))}
      </div>
    </>
  )
}
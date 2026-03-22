'use client'

export default function BoxOffice({ results }: { results: any }) {

  return (
    <>
      <div className="flex flex-col gap-2">
        {results.map((movie: any, index: number) => {
          return (
            <div key={movie.movieCd} className="rounded-lg border px-3 py-2">
              <p className="font-semibold">{index + 1}: {movie.movieNm}</p>
              {/* <p> {JSON.stringify(movie)}</p> */}
              <div className="flex flex-wrap gap-2">
                  <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {movie.openDt}
                  </span>
                  <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {movie.nationAlt}
                  </span>
                  <span className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {movie.genreAlt}
                  </span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

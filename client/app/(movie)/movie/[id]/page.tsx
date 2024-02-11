import {API_URL} from "../../../(home)/page"

async function getMovies(id: string) {
  const response = await fetch(`${API_URL}/${id}`)
  return response.json()
}

export default async function MovieDetail({ params: { id } }: { params: { id: string } }) {
  // 순차 실행
  const movie = await getMovies(id)
  // const videos = await getVideos(id)
  return <h1>{movie.title}</h1>
  // 병렬 실행 1 (둘이 같이 실행해서 둘다 끝날때까지 기다림)
  // const [movie, videos] = await Promise.all([getMovies(id), getVideos(id)])
  // 병렬 실행 2 (둘이 같이 실행해서 먼저 끝나면 먼저나옴) : Suspense
  // return (
  //   <div>
  //     <Suspense fallback={<h1>Loading movie info</h1>}>
  //       <MovieInfo id={id} />
  //     </Suspense>
  //     <Suspense fallback={<h1>Loading movie videos</h1>}>
  //       <MovieVideos id={id} />
  //     </Suspense>
  //   </div>
  // )
}


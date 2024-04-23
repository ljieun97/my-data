import MovieInfo from "@/components/movie/movie-info"
import { getWebtoonDetail } from "@/lib/themoviedb/webtoon"

export const metadata = {
  title: "웹툰"
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params
  const content = await getWebtoonDetail(id)

  return (
    <>
      <MovieInfo content={content} casts={null} sim={null} />
    </>
  )
}
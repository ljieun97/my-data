import { getRottenTomatoesScore } from "@/lib/open-api/rottentomatoes"
import { getCasts, getDetail, getMovieEnglishTitleById, getProviders, getRecommendations, getSimilars, getVideo } from "@/lib/open-api/tmdb-server"
import DetailModal from "@/components/modal/detail-modal"

export const metadata = {
  title: "영화"
}

export default async function Page({ params }: { params: any }) {
  const { id } = await params
  const type = 'movie'
  const [content, video, casts, rcm, simFallback, providers] = await Promise.all([
    getDetail(type, id),
    getVideo(type, id),
    getCasts(type, id),
    getRecommendations(type, id),
    getSimilars(type, id),
    getProviders(type, id),
  ])
  const sim = rcm?.length > 0 ? rcm : simFallback
  const rottenTitle = await getMovieEnglishTitleById(Number(id), content.original_title, content.title)
  const rottenTomatoes = rottenTitle
    ? await getRottenTomatoesScore(rottenTitle, content.release_date?.slice?.(0, 4))
    : null

  return (
    <DetailModal
      content={content}
      casts={casts}
      sim={sim}
      providers={providers}
      videoKey={video?.key}
      rottenTomatometer={rottenTomatoes?.tomatometer}
      rottenPopcornmeter={rottenTomatoes?.popcornmeter}
      rottenTomatoesUrl={rottenTomatoes?.url}
    />
  )
}

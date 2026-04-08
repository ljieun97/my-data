import DetailModal from "@/components/modal/detail-modal"
import { getRottenTomatoesScore } from "@/lib/open-api/rottentomatoes"
import { getCasts, getDetail, getProviders, getRecommendations, getSimilars, getVideo } from "@/lib/open-api/tmdb-server"

export const metadata = {
  title: "시리즈"
}

export default async function Page({ params }: { params: any }) {
  const { id } = await params
  const type = 'tv'
  const [content, video, casts, rcm, simFallback, providers] = await Promise.all([
    getDetail(type, id),
    getVideo(type, id),
    getCasts(type, id),
    getRecommendations(type, id),
    getSimilars(type, id),
    getProviders(type, id),
  ])
  const sim = rcm?.length > 0 ? rcm : simFallback
  const rottenTitle = [content.original_name, content.name].find((value: string | undefined) => Boolean(value && /[A-Za-z]/.test(value)))
  const rottenTomatoes = rottenTitle
    ? await getRottenTomatoesScore(rottenTitle, content.first_air_date?.slice?.(0, 4))
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

import { getCasts, getDetail, getProviders, getRecommendations, getSimilars, getVideo } from "@/lib/themoviedb/api"
import DetailModal from "@/page/detail-modal"

export const metadata = {
  title: "영화"
}

export default async function Page({ params }: { params: any }) {
  const { id } = await params
  const type = 'movie'
  const [content, video, casts, rcm, providers] = await Promise.all([
    getDetail(type, id),
    getVideo(type, id),
    getCasts(type, id),
    getRecommendations(type, id),
    getProviders(type, id),
  ])
  const sim = (rcm?.length > 0 ? rcm : await getSimilars(type, id))

  return (
    <DetailModal
      content={content}
      casts={casts}
      sim={sim}
      providers={providers}
      videoKey={video?.key}
    />
  )
}
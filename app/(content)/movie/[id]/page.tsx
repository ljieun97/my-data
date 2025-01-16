import DetailPage from "@/page/detail-page"
import { getCasts, getDetail, getProviders, getRecommendations, getSimilars, getVideo } from "@/lib/themoviedb/api"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "영화"
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id
  const type = 'movie'
  const content = await getDetail(type, id)
  const video = await getVideo(type, id)
  const casts = await getCasts(type, id)
  const rcm = await getRecommendations(type, id)
  const sim = (rcm?.length > 0 ? rcm : await getSimilars(type, id))
  const providers = await getProviders(type, id)

  return (
    <DetailPage content={content} casts={casts} sim={sim} providers={providers} videoKey={video?.key} />
  )
}
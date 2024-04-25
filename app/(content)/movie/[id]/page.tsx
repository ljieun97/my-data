import CardInfo from "@/components/contents/card-info"
import { getCasts, getDetail, getRecommendations, getSimilars } from "@/lib/themoviedb/api"

export const metadata = {
  title: "영화"
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params
  const type = 'movie'
  const content = await getDetail(type, id)
  const casts = await getCasts(type, id)
  const rcm = await getRecommendations(type, id)
  const sim = (rcm.length > 0 ? rcm : await getSimilars(type, id))

  return (
    <>
      <CardInfo content={content} casts={casts} sim={sim} />
    </>
  )
}
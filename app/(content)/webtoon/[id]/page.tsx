import CardInfo from "@/components/contents/card-info"
import { getWebtoonDetail } from "@/lib/themoviedb/webtoon"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "웹툰"
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params
  const content = await getWebtoonDetail(id)

  return (
    <CardInfo content={content} casts={null} sim={null} />
  )
}
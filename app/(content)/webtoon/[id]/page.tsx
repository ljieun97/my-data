import CardInfo from "@/components/contents/card-info"
import { getWebtoonDetail } from "@/lib/themoviedb/webtoon"

export const metadata = {
  title: "웹툰"
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params
  const content = await getWebtoonDetail(id)

  return (
    <div className="px-8 py-4">
      <CardInfo content={content} casts={null} sim={null} />
    </div>
  )
}
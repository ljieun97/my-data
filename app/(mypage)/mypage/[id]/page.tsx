import MyPage from "@/page/my-page"
import { deployUrl } from "@/lib/config"

export const metadata = {
  title: "마이페이지"
}

export default async function Page({ params }: { params: any }) {
  const { id } = await params
  const counts = await (await fetch(`${deployUrl}/api/user/${id}/content/by-year`)).json()

  // const [] = await Promise.all([
  // ])

  return (
    <MyPage counts={counts}/>
  )
}
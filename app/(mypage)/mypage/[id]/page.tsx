import MyPage from "@/page/my-page"

export const metadata = {
  title: "마이페이지"
}

export default async function Page({ params }: { params: any }) {
  const { id } = await params
  const counts = await (await fetch(`https://today-movie.vercel.app/api/content/by-year/${id}`)).json()

  // const [] = await Promise.all([
  // ])

  return (
    <MyPage counts={counts}/>
  )
}
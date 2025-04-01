import MyPage from "@/page/my-page"

export const metadata = {
  title: "마이페이지"
}

export default async function Page({ params }: { params: any }) {
  const { id } = await params
  const res = await fetch(`https://today-movie.vercel.app/api/user/${id}/content`)
  const data = await res.json()

  // const [] = await Promise.all([

  // ])

  return (
    <MyPage data={data}/>
  )
}
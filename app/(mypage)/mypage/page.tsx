
import Title from "@/components/common/title";
import MyPage from "@/components/contents/my-page";

export const dynamic = "force-dynamic"
export const metadata = {
  title: "시청 목록"
}

const Page = () => {
  return (
    <div className="px-8 py-4">
      <Title title={'마이페이지'} />
      <MyPage />
    </div>
  )
}

export default Page






import Title from "@/components/common/title";
import MyPage from "@/page/my-page";
import { Button, Link } from "@nextui-org/react";

export const dynamic = "force-dynamic"
export const metadata = {
  title: "보관함"
}

const Page = () => {

  return (
    <>
      <Title
        title={"보관함"}
      />

      <MyPage />
    </>
  )
}

export default Page





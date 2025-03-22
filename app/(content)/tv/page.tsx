import Title from "@/components/common/title"
import FilterPage from "@/page/filter-page"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "시리즈"
}

export default function Page() {
  return (
    <>
      <Title title={"시리즈"} sub="" />
      <FilterPage type={'tv'} />
    </>
  )
}
import Title from "@/components/common/title"
import FilterPage from "@/page/filter-page"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "영화"
}

export default function Page() {
  return (
    <>
      <Title title={"영화"} />
      <FilterPage type={'movie'} />
    </>
  )
}
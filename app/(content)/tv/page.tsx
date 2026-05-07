import FilterPage from "@/components/contents/filter-page"
import { getDiscoverTitles } from "@/lib/open-api/tmdb-server"

export const revalidate = 3600
export const metadata = {
  title: "시리즈"
}

export default async function Page() {
  const initialData = await getDiscoverTitles("tv", "", "", "", "", 1)

  return <FilterPage type="tv" initialData={initialData} />
}

import FilterPage from "@/features/browse/filter-page"
import { getDiscoverTitles } from "@/lib/open-api/tmdb-server"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "시리즈"
}

export default async function Page() {
  const initialData = await getDiscoverTitles("tv", "", "", "", "", 1)

  return <FilterPage type="tv" initialData={initialData} />
}

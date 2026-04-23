import FilterPage from "@/components/contents/filter-page"
import { getDiscoverTitles } from "@/lib/open-api/tmdb-server"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "영화"
}

export default async function Page() {
  const initialData = await getDiscoverTitles("movie", "", "", "", "", 1)

  return <FilterPage type="movie" initialData={initialData} />
}

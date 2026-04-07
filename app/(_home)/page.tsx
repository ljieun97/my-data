import HomeBoxOfficeSections from "@/page/home-box-office-sections"
import { getHomeSectionsSeed } from "@/lib/home/home-sections"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Home",
}

export default async function Home() {
  const initialData = await getHomeSectionsSeed()

  return <HomeBoxOfficeSections initialData={initialData} />
}

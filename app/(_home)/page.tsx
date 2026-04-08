import HomeBoxOfficeSections from "@/page/home-box-office-sections"
import { Banners } from "@/components/layout/banners"
import { getHomeSectionsSeed } from "@/lib/home/home-sections"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Home",
}

export default async function Home() {
  const initialData = await getHomeSectionsSeed()
  const featuredMovie =
    initialData.boxOfficeCards.find((card) => card.rank === "1" && card.backdropPath && card.tmdbId) ??
    initialData.boxOfficeCards.find((card) => card.backdropPath && card.tmdbId) ??
    initialData.topRatedCards.find((card) => card.backdropPath && card.tmdbId) ??
    initialData.upcomingCards.find((card) => card.backdropPath && card.tmdbId) ??
    null

  return (
    <div className="-mt-28 overflow-x-hidden">
      {featuredMovie ? <Banners movie={featuredMovie} /> : null}
      <div className="app-frame pb-12 pt-8">
        <HomeBoxOfficeSections initialData={initialData} />
      </div>
    </div>
  )
}

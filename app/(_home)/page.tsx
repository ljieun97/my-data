import BoxOffice from "@/components/box-office";
import type { HomeMovieCardItem } from "@/components/box-office";
import { getKobisBoxoffice } from "@/lib/open-api/kobis";
import { searchMovieMetaByTitleAndDate, fetchAllMovies } from "@/lib/open-api/tmdb-server";
import { Spacer } from "@heroui/spacer";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Home",
};

const numberFormatter = new Intl.NumberFormat("ko-KR")

const formatCompactNumber = (value?: string) => {
  const parsed = Number(value ?? 0)

  if (parsed >= 10000) {
    const compact = parsed / 10000
    const formatted = Number.isInteger(compact)
      ? numberFormatter.format(compact)
      : new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(compact)

    return `${formatted}만`
  }

  return numberFormatter.format(parsed)
}

const formatCount = (value?: string) => `${formatCompactNumber(value)}명`

const rankChangeLabel = (movie: { rankInten?: string; rankOldAndNew?: string }) => {
  const change = Number(movie.rankInten ?? 0)

  if (movie.rankOldAndNew === "NEW") {
    return { label: "NEW", tone: "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-slate-950" }
  }

  if (change > 0) {
    return { label: `▲ ${change}`, tone: "bg-sky-500 text-white dark:bg-sky-400 dark:text-slate-950" }
  }

  if (change < 0) {
    return { label: `▼ ${Math.abs(change)}`, tone: "bg-rose-500 text-white dark:bg-rose-400 dark:text-slate-950" }
  }

  return { label: "", tone: "" }
}

const Home = async () => {
  const targetDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "")

  const [boxOfficeResponse, upcomingMovies] = await Promise.all([
    getKobisBoxoffice(targetDate, "A"),
    fetchAllMovies("upcoming")
  ])

  const dailyBoxOfficeList = boxOfficeResponse?.boxOfficeResult?.dailyBoxOfficeList ?? []
  const boxOfficeCards: HomeMovieCardItem[] = await Promise.all(
    dailyBoxOfficeList.map(async (movie: any) => {
      const meta = await searchMovieMetaByTitleAndDate(movie.movieNm, movie.openDt)
      const rankChange = rankChangeLabel(movie)

      return {
        id: `kobis-${movie.rank}-${movie.movieCd ?? movie.movieNm}`,
        title: movie.movieNm,
        year: movie.openDt?.slice(0, 4),
        rank: movie.rank,
        rankChangeLabel: rankChange.label,
        rankChangeTone: rankChange.tone,
        tmdbId: meta.tmdbId,
        posterPath: meta.posterPath,
        detailLine: `일일 ${formatCount(movie.audiCnt)} 누적 ${formatCount(movie.audiAcc)}`
      }
    })
  )

  const upcomingCards: HomeMovieCardItem[] = (Array.isArray(upcomingMovies) ? upcomingMovies : [])
    .filter((movie: any) => movie.poster_path)
    .map((movie: any, index: number) => ({
      id: `upcoming-${movie.id}`,
      title: movie.title ?? movie.original_title ?? "Untitled",
      year: movie.release_date?.slice(0, 4),
      rank: String(index + 1),
      tmdbId: movie.id,
      posterPath: movie.poster_path,
      // detailLine: movie.release_date ? `개봉 ${movie.release_date}` : undefined,
      // subdetailLine: `TMDB 평점 ${Number(movie.vote_average ?? 0).toFixed(1)}`
    }))

  return (
    <>
      <BoxOffice
        title="박스오피스 순위"
        subtitle=""
        emptyMessage="박스오피스 결과가 없습니다."
        results={boxOfficeCards}
      />
<Spacer y={16}/>
      <BoxOffice
        title="개봉 예정작"
        subtitle=""
        emptyMessage="개봉 예정작이 없습니다."
        results={upcomingCards}
      />
      {/* <MoodSelecter /> */}
    </>
  );
};

export default Home;

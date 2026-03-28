import BoxOffice from "@/components/box-office";
import { getKobisBoxoffice } from "@/lib/open-api/kobis";
import { searchMoviePosterByTitleAndDate } from "@/lib/open-api/tmdb-server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Home",
};

const Home = async () => {
  const targetDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "")

  const results = await getKobisBoxoffice(targetDate, "A")
  const dailyBoxOfficeList = results?.boxOfficeResult?.dailyBoxOfficeList ?? []
  const moviesWithPosters = await Promise.all(
    dailyBoxOfficeList.map(async (movie: any) => ({
      ...movie,
      posterPath: await searchMoviePosterByTitleAndDate(movie.movieNm, movie.openDt),
    }))
  )

  return (
    <>
      <BoxOffice results={moviesWithPosters} />
      {/* <MoodSelecter /> */}
    </>
  );
};

export default Home;

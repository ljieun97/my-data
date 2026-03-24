import BoxOffice from "@/components/box-office";
import MoodSelecter from "@/components/mood-selecter";
import YearWorldcup from "@/components/year-worldcup";
import { getFilterMovies } from "@/lib/open-api/tmdb-server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "홈"
}
const Home = async () => {
//tmdb 1년치
  // const test = await getFilterMovies(1)
  // console.log(test)

//kobis 1년치
  const year = 2026
  const url = `https://kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList?key=c877d37a33a65c36aff072744f280149&openStartDt=${year}&openEndDt=${year}`
  const results = []
  const kobis = await fetch(url)
  const totalCount = (await kobis.json()).movieListResult?.totCnt
  const totalPages = Math.ceil(totalCount / 100);

  for (let page = 1; page <= totalPages; page++) {
    const res = await fetch(
      `${url}&itemPerPage=100&curPage=${page}`
    );
    const data = await res.json();

    const movies = Array.isArray(data.movieListResult?.movieList)
      ? data.movieListResult.movieList
      : [];

    const filtered = movies.filter((movie: any) =>
      !movie.genreAlt.includes('성인물(에로)')
      && !movie.genreAlt.includes('기타')
      && !((movie.repNationNm == "한국" || movie.repNationNm == "일본") && movie.genreAlt.includes('멜로/로맨스'))
      && !((movie.repNationNm == "한국" || movie.repNationNm == "일본") && movie.genreAlt.includes('드라마') && movie.directors.length == 0)
    );

    

    results.push(...filtered);

    console.log(`${page}/${totalPages} 페이지 (필터 후 ${filtered.length}개)`);
  }

  // results.sort((a, b) =>
  //   Number(a.openDt) - Number(b.openDt)
  // );

  //kobis 1년치 end

  // const banners = await Promise.all([
  //   getDetail('movie', 872585), //오펜
  //   getDetail('movie', 792307), //가여운것들
  //   getDetail('movie', 915935), //추락의해부
  // ])
  // const random = Math.floor(Math.random() * banners.length)
  // const movie = banners[random]

  return (
    <>
      <YearWorldcup results={results} />
      {/* <BoxOffice results={results} /> */}
      {/* <MoodSelecter /> */}
      {/* <div className="absolute top-0 left-0 w-full h-full">
        {movie ?
          <Banners movie={movie} />
          :
          <BannersSkel />
        }
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between px-6 pt-8">
            <span className="text-lg font-bold">최신 영화</span>
          </div>
          <ImagesSlider type="getTodayMovies" />

          <div className="flex justify-between px-6 pt-8">
            <span className="text-lg font-bold">최신 시리즈</span>
          </div>
          <ImagesSlider type="getTodaySeries" />

          <div className="flex justify-between px-6 pt-8">
            <span className="text-lg font-bold">평단의 찬사를 받은 영화</span>
          </div>
          <ImagesSlider type="getTopRatedMovies" />

          <Spacer y={8} />
        </div>
      </div> */}
    </>
  )
}

export default Home
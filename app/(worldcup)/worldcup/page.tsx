import YearWorldcup from "@/components/worldcup/year-worldcup";
import { getFilterMovies } from "@/lib/open-api/tmdb-server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Worldcup",
};

type SearchParams = {
  year?: string;
  source?: string;
};

const getTmdbResults = async (targetYear: number) => {
  const { total_pages, total_results } = await getFilterMovies(1, targetYear);
  const pageResults = await Promise.all(
    Array.from({ length: total_pages }, async (_, index) => {
      const page = index + 1;
      const res = await getFilterMovies(page, targetYear);
      const movies = Array.isArray(res.results) ? res.results : [];
      const filtered = movies.filter((movie: any) => movie.overview);

      console.log(`${page}/${total_pages} tmdb pages (${filtered.length})`);
      return filtered;
    })
  );

  const yearResults = pageResults.flat();
  console.log(yearResults.length, total_results);
  return yearResults;
};

const getKobisResults = async (targetYear: number) => {
  const url = `https://kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList?key=c877d37a33a65c36aff072744f280149&openStartDt=${targetYear}&openEndDt=${targetYear}`;
  const kobis = await fetch(url);
  const total_results = (await kobis.json()).movieListResult?.totCnt;
  const total_pages = Math.ceil(total_results / 100);

  const pageResults = await Promise.all(
    Array.from({ length: total_pages }, async (_, index) => {
      const page = index + 1;
      const res = await fetch(`${url}&itemPerPage=100&curPage=${page}`);
      const data = await res.json();

      const movies = Array.isArray(data.movieListResult?.movieList)
        ? data.movieListResult.movieList
        : [];

      const filtered = movies.filter(
        (movie: any) =>
          !movie.genreAlt.includes("성인물(에로)") &&
          !movie.genreAlt.includes("기타") &&
          !(
            (movie.repNationNm === "한국" || movie.repNationNm === "일본") &&
            movie.genreAlt.includes("멜로/로맨스")
          ) &&
          !(
            (movie.repNationNm === "한국" || movie.repNationNm === "일본") &&
            movie.genreAlt.includes("드라마") &&
            movie.directors.length === 0
          )
      );

      console.log(`${page}/${total_pages} kobis pages (${filtered.length})`);
      return filtered;
    })
  );

  const yearResults = pageResults.flat();
  console.log(yearResults.length, total_results);
  return yearResults;
};

const sourceConfig = {
  kobis: {
    title: "박스오피스 월드컵",
    getResults: getKobisResults,
  },
  tmdb: {
    title: "OTT 월드컵",
    getResults: getTmdbResults,
  },
} as const;

const Page = async ({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) => {
  const resolvedSearchParams = (await searchParams) ?? {};
  const defaultWorldcupYear = new Date().getFullYear() - 1;
  const year = Number(resolvedSearchParams.year ?? defaultWorldcupYear);
  const requestedSource = resolvedSearchParams.source === "tmdb" ? "tmdb" : "kobis";
  const { title, getResults } = sourceConfig[requestedSource];
  const results = await getResults(year);

  return <YearWorldcup title={`${year} ${title}`} results={results} />;
};

export default Page;

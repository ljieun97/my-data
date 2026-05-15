const BASE_URL = 'https://kobis.or.kr/kobisopenapi/webservice/rest'
const API_KEY = 'c877d37a33a65c36aff072744f280149'

export type KobisMovieListItem = {
  movieNm?: string;
  openDt?: string;
  [key: string]: any;
}

export async function getKobisBoxoffice(date: string, type: string) {
  let URL = `${BASE_URL}/boxoffice/searchDailyBoxOfficeList?key=${API_KEY}&targetDt=${date}`
  if(type!='A') URL+=`&repNationCd=${type}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const results = await response.json()
  return results
}

export async function getKobisYearlyMovieList(year: number) {
  const baseUrl = `${BASE_URL}/movie/searchMovieList?key=${API_KEY}&openStartDt=${year}&openEndDt=${year}`;
  const firstResponse = await fetch(baseUrl, { next: { revalidate: 3600 } });

  if (!firstResponse.ok) {
    return [] as KobisMovieListItem[];
  }

  const firstPayload = await firstResponse.json();
  const totalCount = Number(firstPayload?.movieListResult?.totCnt) || 0;
  const totalPages = Math.max(Math.ceil(totalCount / 100), 1);

  const payloads = await Promise.all(
    Array.from({ length: totalPages }, async (_, index) => {
      const page = index + 1;
      const response = await fetch(`${baseUrl}&itemPerPage=100&curPage=${page}`, { next: { revalidate: 3600 } });

      if (!response.ok) {
        return { movieListResult: { movieList: [] as KobisMovieListItem[] } };
      }

      return response.json();
    }),
  );

  return payloads.flatMap((payload) =>
    Array.isArray(payload?.movieListResult?.movieList) ? payload.movieListResult.movieList : [],
  );
}

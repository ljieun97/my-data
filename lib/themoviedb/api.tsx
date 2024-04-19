import dayjs from 'dayjs'
const API_KEY = process.env.API_KEY_TMDB ? process.env.API_KEY_TMDB : process.env.NEXT_PUBLIC_API_KEY_TMDB
const today = dayjs().format('YYYY-MM-DD')
const month = dayjs().subtract(1, "month").format('YYYY-MM-DD')
//ott 3구글 8넷플릭스 119아마존 96네이버 97왓챠 337디즈니 350애플 356웨이브
//라프텔 쿠팡 없음
//장르 10762키즈 16애니
//정렬 인기순이 기본값

export async function getSearchList(keyword: string) {
  //client에서 호출하는거랑 server에서 호출하는거랑 rewrite 적용 달라짐 
  const URL = `https://api.themoviedb.org/3/search/multi?query=${keyword}&language=ko&page=1&api_key=${API_KEY}`
  const response = await fetch(URL)
  const { results } = await response.json()
  return results?.filter((e: any) => e.media_type != "person")
}

export async function getTodayMovies() {
  //한달내 업데이트된 영화
  // const URL = `https://api.themoviedb.org/3/discover/movie?release_date.gte=${month}&release_date.lte=${today}&language=ko&watch_region=KR&with_watch_providers=8|119|96|97|337|350|356&without_watch_providers=1796&sort_by=release_date.desc&api_key=${API_KEY}`
  // const URL = `https://api.themoviedb.org/3/discover/movie?language=ko&watch_region=KR&with_watch_monetization_types=flatrate&with_watch_providers=8|119|96|97|337|350|356&without_watch_providers=1796&sort_by=release_date.desc&api_key=${API_KEY}`
  // const URL = `https://api.themoviedb.org/3/discover/movie?language=ko&watch_region=KR&with_watch_monetization_types=flatrate&without_watch_providers=1796&sort_by=release_date.desc&api_key=${API_KEY}`
  const URL = `https://api.themoviedb.org/3/discover/movie?release_date.gte=${month}&release_date.lte=${today}&language=ko&watch_region=KR&with_watch_monetization_types=flatrate&with_watch_providers=8|119|96|97|337|350|356&without_watch_providers=1796&sort_by=release_date.desc&api_key=${API_KEY}`
  const response = await fetch(URL)
  let { results } = await response.json()
  results = results.filter((content: any) => content.poster_path && content.overview)
  // results = results.filter((content: any) => content.poster_path)
  return results
}

export async function getTodaySeries() {
  //오늘 업데이트된 시리즈
  // const URL = `https://api.themoviedb.org/3/discover/tv?air_date.gte=${today}&air_date.lte=${today}&language=ko&watch_region=KR&with_watch_providers=8|119|96|97|337|350|356&without_watch_providers=1796&without_genres=16&sort_by=first_air_date.desc&api_key=${API_KEY}`
  //한달내 첫방송 시작한 시리즈 (날짜뺌)
  // const URL = `https://api.themoviedb.org/3/discover/tv?language=ko&watch_region=KR&with_watch_monetization_types=flatrate&without_watch_providers=1796&without_genres=16&sort_by=first_air_date.desc&api_key=${API_KEY}`
  const URL = `https://api.themoviedb.org/3/discover/tv?air_date.gte=${month}&language=ko&watch_region=KR&with_watch_monetization_types=flatrate&without_watch_providers=1796&without_genres=16&sort_by=first_air_date.desc&api_key=${API_KEY}`
  const response = await fetch(URL)
  let { results } = await response.json()
  results = results.filter((content: any) => content.poster_path && content.overview)
  // results = results.filter((content: any) => content.poster_path)
  return results
}

export async function getMonthAnime() {
  // const URL = `https://api.themoviedb.org/3/discover/tv?language=ko&watch_region=KR&with_watch_monetization_types=flatrate&without_watch_providers=1796&with_genres=16&without_genres=10762&sort_by=first_air_date.desc&api_key=${API_KEY}`
  const URL = `https://api.themoviedb.org/3/discover/tv?air_date.gte=${month}&air_date.lte=${today}&language=ko&watch_region=KR&with_watch_monetization_types=flatrate&without_watch_providers=1796&with_genres=16&sort_by=first_air_date.desc&api_key=${API_KEY}`
  const response = await fetch(URL)
  let { results } = await response.json()
  results = results.filter((content: any) => content.poster_path && content.overview)
  return results
}

export async function getProviders(type: string, id: any) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/watch/providers?api_key=${API_KEY}`
  const response = await fetch(URL)
  const { results } = await response.json()
  return results?.KR?.flatrate
}

export async function getMovieDetail(id: any) {
  const URL = `https://api.themoviedb.org/3/movie/${id}?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL)
  const results = await response.json()
  return results
}

export async function getSeriseDetail(id: any) {
  const URL = `https://api.themoviedb.org/3/tv/${id}?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL)
  const results = await response.json()
  return results
}

export async function getCasts(type: string, id: string) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/credits?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL)
  const results = await response.json()
  return results.cast
}

export async function getSimilars(type: string, id: string) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/similar?language=ko&watch_region=KR&api_key=${API_KEY}`
  const response = await fetch(URL)
  let { results } = await response.json()
  results = results.filter((content: any) => content.poster_path && content.overview)
  return results
}

export async function getRecommendations(type: string, id: string) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/recommendations?language=ko&watch_region=KR&api_key=${API_KEY}`
  const response = await fetch(URL)
  let { results } = await response.json()
  results = results.filter((content: any) => content.poster_path && content.overview)
  return results
}

//영화페이지
export async function getFilterMovies(country: any, providers: any, date: any, genres: any, pageNum: any) {
  // providers = Array.from(providers).join("|")
  const qeury = {
    country: country ? `&with_origin_country=${country}` : '',
    provider: providers ? `&with_watch_providers=${providers}` : '',
    date: date ? `&primary_release_year=${date}` : '',
    genre: genres ? `&with_genres=${genres}` : ''
  }

  const URL = 'https://api.themoviedb.org/3/discover/movie'
    + `?language=ko&watch_region=KR&api_key=${API_KEY}`
    + `&without_watch_providers=1796`
    + qeury.provider
    + qeury.date
    + qeury.genre
    + qeury.country
    // + `&primary_release_date.gte=${date.start.toString()}&primary_release_date.lte=${date.end.toString()}`
    + `&page=${pageNum}`
  const response = await fetch(URL)
  let {results, page, total_pages} = await response.json()
  // results = results.filter((content: any) => content.poster_path && content.overview)
  return {results, page, total_pages}
}
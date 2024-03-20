import dayjs from 'dayjs'
const API_KEY = process.env.API_KEY_TMDB
const today = dayjs().format('YYYY-MM-DD')
const month = dayjs().format('YYYY-MM-01')
//3구글 8넷플릭스 9아마존 96네이버 97왓챠 337디즈니 350애플 356웨이브

export async function getSearchList(keyword: string) {
  const URL = `https://api.themoviedb.org/3/search/multi?query=${keyword}&language=ko&page=1&api_key=${API_KEY}`
  const response = await fetch(URL)
  const {results} = await response.json()
  return results.filter((e: any) => e.media_type != "person")
}

export async function getTodayMovies () {
  const URL = `https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=${month}&primary_release_date.lte=${today}&language=ko&watch_region=KR&with_watch_providers=8|9|96|97|337|350|356&sort_by=release_date.desc&api_key=${API_KEY}`
  const response = await fetch(URL)
  const {results} = await response.json()
  return results
}

export async function getTodaySeries () {
  const URL = `https://api.themoviedb.org/3/discover/tv?air_date.gte=${today}&air_date.lte=${today}&language=ko&watch_region=KR&with_watch_providers=8|9|96|97|337|350|356&sort_by=release_date.desc&api_key=${API_KEY}`
  const response = await fetch(URL)
  const {results} = await response.json()
  return results
}

export async function getProviders (type: string, id: any) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/watch/providers?api_key=${API_KEY}`
  const response = await fetch(URL)
  const {results} = await response.json()
  return results?.KR?.flatrate
}

export async function getMovieDetail (id: any) {
  const URL = `https://api.themoviedb.org/3/movie/${id}?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL)
  const results = await response.json()
  return results
}



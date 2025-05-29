const API_KEY = process.env.API_KEY_TMDB

if (!API_KEY) {
  throw new Error("API key for TMDB is not defined");
}

import { format } from "date-fns-tz";

const timeZone = 'Asia/Seoul'
const now = new Date()
const today = format(now, "yyyy-MM-dd", { timeZone })
const month = format(now, 'MM', { timeZone })


export async function getTodayMovies() {
  const URL = `https://api.themoviedb.org/3/discover/movie?release_date.gte=${month}&release_date.lte=${today}&language=ko&watch_region=KR&with_watch_monetization_types=flatrate&with_watch_providers=8|119|96|97|337|350|356&without_watch_providers=1796&sort_by=release_date.desc&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  let { results } = await response.json()
  return results.filter((content: any) => content.poster_path && content.overview)
}

export async function getTodaySeries() {
  const URL = `https://api.themoviedb.org/3/discover/tv?air_date.gte=${month}&language=ko&watch_region=KR&with_watch_monetization_types=flatrate&without_watch_providers=1796&without_genres=16&sort_by=first_air_date.desc&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  let { results } = await response.json()
  return results.filter((content: any) => content.poster_path && content.overview)
}

export async function getTopRatedMovies() {
  const URL = `https://api.themoviedb.org/3/movie/top_rated?language=ko&api_key=${API_KEY}`;
  const response = await fetch(URL, { next: { revalidate: 3600 } }); // ISR이나 캐싱도 가능
  const { results } = await response.json()
  return results.filter((content: any) => content.backdrop_path);
}

async function fetchMovies(endpoint: string, page: number) {
  const URL = `https://api.themoviedb.org/3/movie/${endpoint}?`
    + '&language=ko&region=KR&with_release_type=1'
    + `&page=${page}`
    + `&api_key=${API_KEY}`
    try {
      const response = await fetch(URL)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const results = await response.json()
      return results
    } catch (error) {
      console.error('Failed to fetch:', error)
      return null
    }
}

export async function fetchAllMovies(endpoint: string) {
  const { total_pages, results: firstPageResults } = await fetchMovies(endpoint, 1)

  const requests = [];
  for (let page = 2; page <= total_pages; page++) {
    requests.push(fetchMovies(endpoint, page))
  }

  const otherPagesData = await Promise.all(requests);
  const allResults = [
    ...firstPageResults,
    ...otherPagesData.flatMap(data => data.results),
  ]

  return allResults;
}
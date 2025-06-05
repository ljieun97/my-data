const API_KEY = process.env.API_KEY_TMDB || process.env.NEXT_PUBLIC_API_KEY_TMDB

if (!API_KEY) {
  throw new Error("API key for TMDB is not defined");
}

import { format } from "date-fns-tz";

const timeZone = 'Asia/Seoul'
const now = new Date()
const today = format(now, "yyyy-MM-dd", { timeZone })
const month = format(now, 'yyyy-MM-01', { timeZone })


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
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const { results } = await response.json()
  return results.filter((content: any) => content.backdrop_path);
}

async function fetchMovies(endpoint: string, page: number) {
  const URL = `https://api.themoviedb.org/3/movie/${endpoint}?`
    + '&language=ko&region=KR'
    + `&page=${page}`
    + `&api_key=${API_KEY}`
    try {
      const response = await fetch(URL, { next: { revalidate: 3600 } })
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

//디테일페이지
export async function getDetail(type: string, id: any) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const results = await response.json()
  return results
}

export async function getCasts(type: string, id: string) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/credits?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const results = await response.json()
  return results.cast
}

export async function getSimilars(type: string, id: string) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/similar?language=ko&watch_region=KR&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  let { results } = await response.json()
  return results.filter((content: any) => content.poster_path && content.overview).slice(0, 12)
}

export async function getRecommendations(type: string, id: string) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/recommendations?language=ko&watch_region=KR&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  let { results } = await response.json()
  return results = results.filter((content: any) => content.poster_path && content.overview).slice(0, 12)
}

export async function getVideo(type: string, id: string) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/videos?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  let { results } = await response.json()
  return results?.filter((content: any) => content.site == "youtube" || "Youtube")[0]
}

export async function getProviders(type: string, id: any) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/watch/providers?api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const { results } = await response.json()
  return results?.KR
}

function addMonths(now: Date, arg1: number) {
  throw new Error("Function not implemented.");
}

import dayjs from 'dayjs'
const today = dayjs().format('YYYY-MM-DD')
const month = dayjs().subtract(1, "month").format('YYYY-MM-DD')

const API_KEY = process.env.API_KEY_TMDB || process.env.NEXT_PUBLIC_API_KEY_TMDB

if (!API_KEY) {
  throw new Error("API key for TMDB is not defined");
}

//home

export async function getDetail(type: string, id: any) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const results = await response.json()
  return results
}

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

export async function getPosters(type: string, id: string) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/images?`
    + 'include_image_language=en,ko&'
    + `&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const { posters } = await response.json()
  return posters
}


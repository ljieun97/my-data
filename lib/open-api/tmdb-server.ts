const API_KEY = process.env.API_KEY_TMDB || process.env.NEXT_PUBLIC_API_KEY_TMDB

if (!API_KEY) {
  throw new Error("API key for TMDB is not defined");
}

import { unstable_cache } from "next/cache";
import { format } from "date-fns-tz";

const timeZone = 'Asia/Seoul'
const now = new Date()
const today = format(now, "yyyy-MM-dd", { timeZone })
const month = format(now, 'yyyy-MM-01', { timeZone })

function filterDisplayableTitles(results: any[]) {
  return Array.isArray(results)
    ? results.filter((content: any) => content?.poster_path && content?.overview)
    : []
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
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const { results } = await response.json()
  return results.filter((content: any) => content.backdrop_path && content.overview);
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

export async function getCredits(type: string, id: string) {
  const URL = `https://api.themoviedb.org/3/${type}/${id}/credits?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const results = await response.json()

  return {
    cast: results.cast ?? [],
    crew: results.crew ?? [],
  }
}

export async function getPersonDetail(id: string) {
  const URL = `https://api.themoviedb.org/3/person/${id}?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  return response.json()
}

export async function getPersonCredits(id: string) {
  const URL = `https://api.themoviedb.org/3/person/${id}/combined_credits?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const results = await response.json()
  const credits = [...(results.cast ?? []), ...(results.crew ?? [])]
  const uniqueCredits = new Map<string, any>()

  for (const credit of credits) {
    if (!["movie", "tv"].includes(credit.media_type) || !credit.poster_path) {
      continue
    }

    const key = `${credit.media_type}:${credit.id}`
    if (!uniqueCredits.has(key)) {
      uniqueCredits.set(key, credit)
    }
  }

  return Array.from(uniqueCredits.values()).sort((a, b) => {
    const aDate = a.release_date || a.first_air_date || ""
    const bDate = b.release_date || b.first_air_date || ""
    return bDate.localeCompare(aDate)
  })
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

export async function getDiscoverTitles(
  type: string,
  country: string = "",
  providers: string = "",
  date: string = "",
  genres: string = "",
  pageNum: number = 1,
) {
  const dateQueryByType =
    type === "movie"
      ? `&primary_release_year=${date}`
      : `&first_air_date.gte=${date}-01-01&first_air_date.lte=${date}-12-31`

  const query = {
    country: country ? `&with_origin_country=${country}` : "",
    provider: providers ? `&with_watch_providers=${providers}` : "",
    date: date ? dateQueryByType : "",
    genre: genres ? `&with_genres=${genres}` : "",
  }

  const URL = `https://api.themoviedb.org/3/discover/${type}`
    + `?language=ko&api_key=${API_KEY}`
    + `&without_watch_providers=1796`
    + `&watch_region=KR`
    + query.provider
    + query.date
    + query.genre
    + query.country
    + `&page=${pageNum}`

  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const data = await response.json()
  return {
    ...data,
    results: filterDisplayableTitles(data?.results),
  }
}

//월드컵용 연도별 국내에서 개봉 영화
export async function getFilterMovies(pageNum: any, year: number) {
  const URL = `https://api.themoviedb.org/3/discover/movie`
    + `?api_key=${API_KEY}`
    + `&language=ko`
    // + `&region=KR&with_release_type=3|2&year=2025`
    + `&watch_region=KR&with_watch_monetization_types=flatrate`
    + `&primary_release_year=${year}`
    + `&page=${pageNum}`

  const response = await fetch(URL)
  const results = await response.json()
  // results = results.filter((content: any) => content.poster_path && content.overview)
  return results
}

type TmdbSearchMovie = {
  id: number
  title?: string
  original_title?: string
  release_date?: string
  poster_path?: string | null
}

function hasLatinCharacters(value?: string | null) {
  return Boolean(value && /[A-Za-z]/.test(value))
}

function normalizeTitle(value: string) {
  return value.toLowerCase().replace(/[\s:!?'".,()-]/g, "")
}

function selectBestTmdbMatch(results: TmdbSearchMovie[], title: string, year: string) {
  if (!results.length) {
    return null
  }

  const normalizedTitle = normalizeTitle(title)

  const exactTitleMatch = results.find((movie) => {
    const candidates = [movie.title, movie.original_title].filter(Boolean) as string[]
    return candidates.some((candidate) => normalizeTitle(candidate) === normalizedTitle)
  })

  if (exactTitleMatch) {
    return exactTitleMatch
  }

  const sameYearMatch = results.find((movie) => movie.release_date?.startsWith(year))
  if (sameYearMatch) {
    return sameYearMatch
  }

  return results[0]
}

export async function searchMoviePosterByTitleAndDate(title: string, openDt: string) {
  if (!API_KEY) return null
  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    return null
  }

  const year = openDt.slice(0, 4)
  const query = new URLSearchParams({
    query: trimmedTitle,
    language: "ko",
    api_key: API_KEY,
    region: "KR",
    year
  })

  const URL = `https://api.themoviedb.org/3/search/movie?${query.toString()}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  const results = Array.isArray(data.results) ? (data.results as TmdbSearchMovie[]) : []

  if (results.length === 1) {
    return results[0]?.poster_path ?? null
  }

  return null
}

async function searchMovieMetaByTitleAndDateInternal(title: string, openDt: string) {
  if (!API_KEY) {
    return { tmdbId: null, posterPath: null, backdropPath: null, overview: null }
  }

  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    return { tmdbId: null, posterPath: null, backdropPath: null, overview: null }
  }

  const year = openDt.slice(0, 4)
  const query = new URLSearchParams({
    query: trimmedTitle,
    language: "ko",
    api_key: API_KEY,
    region: "KR",
    year
  })

  const URL = `https://api.themoviedb.org/3/search/movie?${query.toString()}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })

  if (!response.ok) {
    return { tmdbId: null, posterPath: null, backdropPath: null, overview: null }
  }

  const data = await response.json()
  const results = Array.isArray(data.results) ? (data.results as TmdbSearchMovie[]) : []
  const matchedMovie = selectBestTmdbMatch(results, trimmedTitle, year)

  if (!matchedMovie) {
    return { tmdbId: null, posterPath: null, backdropPath: null, overview: null }
  }

  return {
    tmdbId: matchedMovie.id,
    posterPath: matchedMovie.poster_path ?? null,
    backdropPath: (matchedMovie as any).backdrop_path ?? null,
    overview: (matchedMovie as any).overview ?? null,
  }
}

const cachedSearchMovieMetaByTitleAndDate = unstable_cache(
  async (title: string, openDt: string) => searchMovieMetaByTitleAndDateInternal(title, openDt),
  ["tmdb-meta-by-title-and-date"],
  { revalidate: 86400 },
)

export async function searchMovieMetaByTitleAndDate(title: string, openDt: string) {
  return cachedSearchMovieMetaByTitleAndDate(title, openDt)
}

export async function getMovieEnglishTitleById(
  movieId?: number | null,
  fallbackOriginalTitle?: string | null,
  fallbackTitle?: string | null
) {
  if (!movieId || !API_KEY) {
    return fallbackOriginalTitle ?? fallbackTitle ?? null
  }

  if (hasLatinCharacters(fallbackOriginalTitle)) {
    return fallbackOriginalTitle ?? null
  }

  const URL = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 86400 } })

  if (!response.ok) {
    return fallbackOriginalTitle ?? fallbackTitle ?? null
  }

  const results = await response.json()
  return results.title ?? results.original_title ?? fallbackOriginalTitle ?? fallbackTitle ?? null
}

import dayjs from 'dayjs'
const today = dayjs().format('YYYY-MM-DD')
const month = dayjs().subtract(1, "month").format('YYYY-MM-DD')

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.API_KEY_TMDB || process.env.NEXT_PUBLIC_API_KEY_TMDB

if (!API_KEY) {
  throw new Error("API key for TMDB is not defined");
}

function filterDisplayableTitles(results: any[]) {
  return Array.isArray(results)
    ? results.filter((content: any) => content?.poster_path && content?.overview)
    : []
}

//home

async function getTvSeasons(id: number) {
  const URL = `${BASE_URL}/tv/${id}?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const results = await response.json()
  return results.seasons ?? []
}

async function normalizeContent(content: any): Promise<any[]> {
  // 👤 person
  if (content.media_type === "person") {
    // const knownFor = content.known_for ?? []

    // const results = await Promise.all(
    //   knownFor.map((item: any) => normalizeContent(item)) // 🔥 재귀
    // )

    // return results.flat().filter((item) => item.overview)
    return []
  }

  // 📺 tv → 시즌 분해
  if (content.media_type === "tv") {
    const seasons = await getTvSeasons(content.id)

    return seasons
      .map((season: any) => ({
        // id: `${content.id}_season_${season.season_number}`, // 🔥 유니크 키
        id: content.id,
        media_type: "tv",
        name: `${content.name} ${season.name}`,
        season_number: season.season_number,
        overview: season.overview || content.overview,
        poster_path: season.poster_path || content.poster_path,
        vote_average: content.vote_average,
        first_air_date: season.air_date || content.first_air_date,
      }))
  }

  // 🎬 movie 등
  return [content]
}

export async function getDetail(type: string, id: any) {
  const URL = `${BASE_URL}/${type}/${id}?language=ko&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const results = await response.json()
  return results
}

export async function getTodayMovies() {
  const URL = `${BASE_URL}/discover/movie?release_date.gte=${month}&release_date.lte=${today}&language=ko&watch_region=KR&with_watch_monetization_types=flatrate&with_watch_providers=8|119|96|97|337|350|356&without_watch_providers=1796&sort_by=release_date.desc&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  let { results } = await response.json()
  return results.filter((content: any) => content.backdrop_path && content.overview)
}

export async function getTodaySeries() {
  const URL = `${BASE_URL}/discover/tv?air_date.gte=${month}&language=ko&watch_region=KR&with_watch_monetization_types=flatrate&without_watch_providers=1796&without_genres=16&sort_by=first_air_date.desc&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  let { results } = await response.json()
  return results.filter((content: any) => content.backdrop_path && content.overview)
}

export async function getTopRatedMovies() {
  const URL = `${BASE_URL}/movie/top_rated?language=ko&api_key=${API_KEY}`;
  const response = await fetch(URL, { next: { revalidate: 3600 } }); // ISR이나 캐싱도 가능
  const { results } = await response.json()

  return results.filter((content: any) => content.backdrop_path && content.overview)
}

export async function getPosters(type: string, id: string) {
  const URL = `${BASE_URL}/${type}/${id}/images?`
    + 'include_image_language=en,ko&'
    + `&api_key=${API_KEY}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const { posters } = await response.json()
  return posters
}

export async function getSearchMulti(keyword: string, pageNum: number) {
  const URL =
    `${BASE_URL}/search/multi?query=${keyword}&language=ko&api_key=${API_KEY}` +
    `&page=${pageNum}`

  const response = await fetch(URL, { next: { revalidate: 3600 } })
  let data = await response.json()

  const results = await Promise.all(
    data.results.map((content: any) => normalizeContent(content))
  )

  data.results = results.flat()
  return data
}

export async function getContentByMood(genres: string) {
  let url = `${BASE_URL}/discover/movie?language=ko-KR&watch_region=KR`
    + `&primary_release_date.gte=1980-01-01&vote_count.gte=800`
    + `&with_watch_monetization_types=flatrate|free|ads|rent|buy&include_video=true`
    + `&with_genres=${genres}`
    + `&api_key=${API_KEY}`

  //시드를 위한 전체 페이지 수
  const response = await fetch(url+'&page=1', { next: { revalidate: 3600 } })
  const {total_pages, total_results} = await response.json()
  console.log(total_results)

  //랜덤 페이지
  const seed = Math.floor(Math.random() * total_results) + Number(today.replaceAll("-", ""))
  const pageNum = (seed % Math.min(total_pages, 500)) + 1
  const response2 = await fetch(url+`&page=${pageNum}`, { next: { revalidate: 3600 } })
  const data = await response2.json()

  //랜덤 인덱스
  const randomIndex = seed % Math.min(data.results.length, 20)
  return data.results[randomIndex]
}

//영화 및 시리즈 필터페이지
//with_watch_providers, watch_region 같이사용
export async function getFilterMovies(type: string, country: any, providers: any, date: any, genres: any, pageNum: any) {
  // providers = Array.from(providers).join("|")
  let dateQueryByType = (type == 'movie') ? 
    `&primary_release_year=${date}` :
    `&first_air_date.gte=${date}-01-01&first_air_date.lte=${date}-12-31`
  const qeury = {
    country: country ? `&with_origin_country=${country}` : '',
    provider: providers ? `&with_watch_providers=${providers}` : '',
    date: date ? `${dateQueryByType}` : '',
    genre: genres ? `&with_genres=${genres}` : ''
  }

  const URL = `${BASE_URL}/discover/${type}`
    + `?language=ko&api_key=${API_KEY}`
    + `&without_watch_providers=1796`
    + `&watch_region=KR`
    + qeury.provider
    + qeury.date
    + qeury.genre
    + qeury.country
    // + `&primary_release_date.gte=${date.start.toString()}&primary_release_date.lte=${date.end.toString()}`
    + `&page=${pageNum}`

  const response = await fetch(URL)
  const results = await response.json()
  return {
    ...results,
    results: filterDisplayableTitles(results?.results),
  }
}

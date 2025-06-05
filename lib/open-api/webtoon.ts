export async function getSearchWebtoons(keyword: string) {
  const URL = `https://korea-webtoon-api.herokuapp.com/search?keyword=${keyword}`
  const response = await fetch(URL)
  const { webtoons } = await response.json()
  return webtoons
}

export async function getWebtoonDetail(id: string) {
  const URL = `https://webtoon-crawler.nomadcoders.workers.dev/${id}`
  const response = await fetch(URL)
  const webtoon = await response.json()
  return webtoon
}
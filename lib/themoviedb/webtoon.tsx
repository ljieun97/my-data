export async function getSearchWebtoons(keyword: string) {
  const URL = `https://korea-webtoon-api.herokuapp.com/search?keyword=${keyword}`
  const response = await fetch(URL)
  const { webtoons } = await response.json()
  console.log(webtoons)
  return webtoons
}
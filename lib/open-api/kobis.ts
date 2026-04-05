const BASE_URL = 'https://kobis.or.kr/kobisopenapi/webservice/rest'
const API_KEY = 'c877d37a33a65c36aff072744f280149'

export async function getKobisBoxoffice(date: string, type: string) {
  let URL = `${BASE_URL}/boxoffice/searchDailyBoxOfficeList?key=${API_KEY}&targetDt=${date}`
  if(type!='A') URL+=`&repNationCd=${type}`
  const response = await fetch(URL, { next: { revalidate: 3600 } })
  const results = await response.json()
  return results
}
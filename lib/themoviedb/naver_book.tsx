const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
const NAVER_CLIENT_SECRET = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET

const Headers = {
  'X-Naver-Client-Id': NAVER_CLIENT_ID || '',
  'X-Naver-Client-Secret': NAVER_CLIENT_SECRET || ''
}

export async function getSearchBooks(keyword: string) {
  const URL = `/api/naver/v1/search/book.json?query=${keyword}`
  const response = await fetch(URL, {
    method: "GET",
    headers: Headers
  })
  const { items } = await response.json()
  return items
}
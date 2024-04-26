const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID ? process.env.NAVER_CLIENT_ID : process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET ? process.env.NAVER_CLIENT_SECRET : process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET

const Headers = {
  'X-Naver-Client-Id': NAVER_CLIENT_ID || '',
  'X-Naver-Client-Secret': NAVER_CLIENT_SECRET || ''
}

export const dynamic = "force-dynamic"
export async function getSearchBooks(keyword: string) {
  const URL = `/naver/v1/search/book.json?query=${keyword}`
  const response = await fetch(URL, {
    headers: Headers
  })
  const { items } = await response.json()
  return items
}
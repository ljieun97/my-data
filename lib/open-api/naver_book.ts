const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID ? process.env.NAVER_CLIENT_ID : process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET ? process.env.NAVER_CLIENT_SECRET : process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET

const Headers = {
  'X-Naver-Client-Id': NAVER_CLIENT_ID || '',
  'X-Naver-Client-Secret': NAVER_CLIENT_SECRET || ''
}

export async function getSearchBooks(keyword: string, page: number) {
  const limit = 21
  const URL = `/naver/v1/search/book.json?query=${keyword}`
  +`&display=${limit}`
  +`&start=${limit*page+1}`
  const response = await fetch(URL, {
    headers: Headers
  })
  const {items, total} = await response.json()
  const total_pages = Math.ceil(total/limit)
  console.log(page, total_pages)
  return {items, total, total_pages}
}
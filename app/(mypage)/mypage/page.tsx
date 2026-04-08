import MyPageOverviewPage from "@/page/mypage-overview-page"
import { deployUrl } from "@/lib/config"
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export const metadata = {
  title: "마이페이지"
}

export default async function Page() {
  const cookieStore = cookies()
  let token = (await cookieStore).get("access_token")?.value
  let uid = null
  const currentYear = String(new Date().getFullYear())

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
      uid = decoded.id
    } catch (error) {
      console.log("Access token expired. Trying refresh...");
    }
  } else {
    return <>로그인을 해주세요.</>
  }

  const [counts, currentYearItems] = await Promise.all([
    (await fetch(`${deployUrl}/api/mypage/content/by-year`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': uid,
      },
    })).json(),
    (await fetch(`${deployUrl}/api/mypage/content/by-year/${currentYear}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': uid,
      },
    })).json(),
  ])

  return (
    <MyPageOverviewPage counts={counts} currentYear={currentYear} currentYearItems={currentYearItems} />
  )
}

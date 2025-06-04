import { deployUrl } from "@/lib/config"
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"
import MylistYear from "@/components/mylist-year";

const JWT_SECRET = process.env.JWT_SECRET!

export const metadata = {
  title: "마이페이지"
}

export default async function Page({ params }: { params: any }) {
  const { year } = await params
  const cookieStore = cookies()
  let token = (await cookieStore).get("access_token")?.value
  let uid = null

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
      uid = decoded.id
    } catch (error) {
      console.log("Access token expired. Trying refresh...");
      return <>로그인을 해주세요.</>
    }
  } else {
    return <>로그인을 해주세요.</>
  }

  const list = await (await fetch(`${deployUrl}/api/mypage/content/by-year/${year}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': uid,
    },
  })).json()

  const counts = await (await fetch(`${deployUrl}/api/mypage/content/by-year`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': uid,
    },
  })).json()

  // const [] = await Promise.all([
  // ])

  return (
    <MylistYear year={year} list={list} counts={counts}/>
  )
}
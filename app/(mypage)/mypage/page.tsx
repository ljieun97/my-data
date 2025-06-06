import MyPage from "@/components/mylist-year"
import { deployUrl } from "@/lib/config"
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"
import { notFound } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET!

export const metadata = {
  title: "마이페이지"
}

export default async function Page() {
  const cookieStore = cookies()
  let token = (await cookieStore).get("access_token")?.value
  let uid = null

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
    <>
    {/* <MyPage counts={counts} /> */}
    </>
  )
}
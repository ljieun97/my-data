import { NextRequest, NextResponse } from 'next/server'
import jwt from "jsonwebtoken"
import connectMongo from '@/lib/mongo/mongodb'

export async function GET(req: NextRequest) {
  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!
  const CLIENT_SECRET = process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET!

  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 })

  const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: REST_API_KEY,
      redirect_uri: REDIRECT_URI,
      client_secret: CLIENT_SECRET,
      code: code,
    }),
  })

  if (!tokenResponse.ok) {
    return NextResponse.json({ error: 'Token request failed' }, { status: 500 })
  }

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token not found' }, { status: 400 })
  }

  const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const userInfo = await userRes.json()
  const kakaoId = userInfo.id
  const nickname = userInfo.properties?.nickname

  // MongoDB에서 유저 찾기
  const db = await connectMongo()
  let user = await db
    .collection("users")
    .findOne({ oauth: `k${kakaoId}` })

  if (!user) {
    await db
      .collection("users")
      .insertOne({ oauth: `k${kakaoId}`, nickname })
  }

  const jwtToken = jwt.sign(
    { id: `k${kakaoId}`, nickname },
    process.env.NEXT_PUBLIC_JWT_SECRET!,
    { expiresIn: '7d' }
  )


  const res = NextResponse.redirect("https://today-movie.vercel.app/")

  res.cookies.set({
    name: "access_token",
    value: jwtToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  return res;
}
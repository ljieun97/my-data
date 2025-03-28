import { NextResponse } from "next/server"

export function GET() {
  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`

  return NextResponse.redirect(kakaoAuthUrl)
}
import jwt from "jsonwebtoken"
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!

export function GET(req: NextRequest) {
  const token = req.cookies.get('access_token'); // 쿠키에서 access_token을 가져옴

  console.log(token)
  if (!token?.value || typeof token.value !== 'string') {
    return NextResponse.json({ message: 'Token is missing or invalid' }, { status: 401 });
  }

  try {
    // JWT 토큰 검증
    const decoded = jwt.verify(token.value, JWT_SECRET);

    // 검증이 성공하면 decoded 내용도 활용할 수 있습니다.
    console.log(decoded);

    return NextResponse.json({ message: 'Token is valid', decoded });
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ message: 'Token is invalid or expired' }, { status: 401 });
  }
};
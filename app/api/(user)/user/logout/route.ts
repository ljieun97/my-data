import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers'; 

export async function POST(req: NextRequest) {
  // 쿠키 삭제
  const cookieStore = cookies();
  (await cookieStore).delete('access_token'); // 쿠키 삭제

  return NextResponse.json({ message: 'Logged out successfully' });
}
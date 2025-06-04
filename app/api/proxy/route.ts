import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch the image. Status: ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch the image' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getRottenTomatoesScore } from "@/lib/open-api/rottentomatoes";
import { getMovieEnglishTitleById } from "@/lib/open-api/tmdb-server";

function hasLatinCharacters(value?: string | null) {
  return Boolean(value && /[A-Za-z]/.test(value));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  try {
    const { type, id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get("title");
    const originalTitle = searchParams.get("originalTitle");
    const year = searchParams.get("year") ?? undefined;

    const englishTitle =
      type === "movie"
        ? await getMovieEnglishTitleById(Number(id), originalTitle, title)
        : hasLatinCharacters(originalTitle)
          ? originalTitle
          : hasLatinCharacters(title)
            ? title
            : originalTitle ?? title;

    const rottenTomatoes = englishTitle
      ? await getRottenTomatoesScore(englishTitle, year)
      : null;

    return NextResponse.json(
      {
        englishTitle,
        rottenTomatometer: rottenTomatoes?.tomatometer ?? null,
        rottenPopcornmeter: rottenTomatoes?.popcornmeter ?? null,
        rottenTomatoesUrl: rottenTomatoes?.url ?? null,
      },
      { headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600" } },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        englishTitle: null,
        rottenTomatometer: null,
        rottenPopcornmeter: null,
        rottenTomatoesUrl: null,
      },
      { status: 500 },
    );
  }
}

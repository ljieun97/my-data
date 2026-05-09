import { NextResponse } from "next/server";
import { getHomeSectionsSeed } from "@/lib/home/home-sections";

export async function GET() {
  try {
    const { boxOfficeCards, upcomingCards, recentCards } = await getHomeSectionsSeed();

    return NextResponse.json(
      {
        boxOfficeCards,
        upcomingCards,
        recentCards,
      },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { boxOfficeCards: [], upcomingCards: [], recentCards: [], error: "Failed to load home data" },
      { status: 500 },
    );
  }
}

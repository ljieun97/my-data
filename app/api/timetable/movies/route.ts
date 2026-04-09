import { NextRequest, NextResponse } from "next/server";

type KobisMovie = {
  movieCd: string;
  movieNm: string;
  openDt: string;
  rank: string;
  rankOldAndNew: string;
};

const KOBIS_API_KEY = "c877d37a33a65c36aff072744f280149";
const KOBIS_BASE_URL = "https://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json";

function toKobisDate(dateText: string) {
  return dateText.replaceAll("-", "");
}

export async function GET(request: NextRequest) {
  const inputDate = request.nextUrl.searchParams.get("date");
  const targetDate = inputDate || new Date().toISOString().slice(0, 10);
  const fallback = new Date(`${targetDate}T00:00:00`);
  fallback.setDate(fallback.getDate() - 1);
  const fallbackDate = fallback.toISOString().slice(0, 10);
  const candidates = [targetDate, fallbackDate];

  for (const candidate of candidates) {
    const url = `${KOBIS_BASE_URL}?key=${KOBIS_API_KEY}&targetDt=${toKobisDate(candidate)}`;

    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const movies = (data?.boxOfficeResult?.dailyBoxOfficeList ?? []) as KobisMovie[];

      if (movies.length) {
        return NextResponse.json({
          date: candidate,
          movies,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  return NextResponse.json(
    {
      date: targetDate,
      movies: [],
    },
    { status: 200 },
  );
}

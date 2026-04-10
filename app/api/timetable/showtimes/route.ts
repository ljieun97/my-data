import { NextResponse } from "next/server";
import { fetchNaverMovieShowtimes } from "@/lib/open-api/naver-movie-showtimes";

type MovieInput = {
  movieCd: string;
  movieNm: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      date?: string;
      movie?: MovieInput;
    };

    const date = body.date ?? new Date().toISOString().slice(0, 10);
    const movie = body.movie;

    if (!movie?.movieCd || !movie?.movieNm) {
      return NextResponse.json(
        {
          error: "Movie is required",
        },
        { status: 400 },
      );
    }

    const showtime = await fetchNaverMovieShowtimes(movie, date);

    return NextResponse.json({
      date,
      showtime,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch showtimes",
      },
      { status: 500 },
    );
  }
}

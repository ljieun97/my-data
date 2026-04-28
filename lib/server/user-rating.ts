import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectMongo, closeMongo } from "@/lib/mongo/mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getMovieUserRating(movieId: number): Promise<number> {
  if (!Number.isFinite(movieId)) {
    return 0;
  }

  const cookieStore = cookies();
  const token = (await cookieStore).get("access_token")?.value;

  if (!token) {
    return 0;
  }

  let uid: string | null = null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    uid = typeof decoded.id === "string" ? decoded.id : null;
  } catch {
    return 0;
  }

  if (!uid) {
    return 0;
  }

  let mongoClient;
  try {
    const { client, db } = await connectMongo();
    mongoClient = client;
    const item = await db.collection("contents").findOne(
      {
        user_id: uid,
        type: "movie",
        id: movieId,
      },
      {
        projection: {
          user_rating: 1,
        },
      },
    );

    return Number((item as { user_rating?: number | string | null } | null)?.user_rating) || 0;
  } catch {
    return 0;
  } finally {
    if (mongoClient) {
      await closeMongo();
    }
  }
}

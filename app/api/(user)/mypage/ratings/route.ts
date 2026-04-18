import { NextRequest, NextResponse } from "next/server";
import { closeMongo, connectMongo } from "@/lib/mongo/mongodb";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  let mongoClient;

  try {
    const headersList = headers();
    const uid = (await headersList).get("authorization");
    const payload = await req.json();
    const ids = Array.isArray(payload?.ids)
      ? payload.ids.map((value: unknown) => Number(value)).filter((value: number) => Number.isFinite(value))
      : [];

    if (!uid || !ids.length) {
      return NextResponse.json([]);
    }

    const { client, db } = await connectMongo();
    mongoClient = client;

    const results = await db
      .collection("contents")
      .find(
        {
          user_id: uid,
          type: "movie",
          id: { $in: ids },
        },
        {
          projection: {
            id: 1,
            user_rating: 1,
          },
        },
      )
      .toArray();

    return NextResponse.json(
      results.map((item) => ({
        id: Number((item as { id?: number | string }).id),
        rating: Number((item as { user_rating?: number | string | null }).user_rating) || 0,
      })),
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: e });
  } finally {
    if (mongoClient) closeMongo();
  }
}

import { NextRequest, NextResponse } from "next/server";
import { closeMongo, connectMongo } from "@/lib/mongo/mongodb";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  let mongoClient;

  try {
    const headersList = headers();
    const uid = (await headersList).get("authorization");
    const payload = await req.json();
    const items = Array.isArray(payload?.items)
      ? payload.items
          .map((item: { id?: unknown; type?: unknown }) => ({
            id: Number(item?.id),
            type: typeof item?.type === "string" ? item.type : "movie",
          }))
          .filter((item: { id: number; type: string }) => Number.isFinite(item.id) && ["movie", "tv"].includes(item.type))
      : [];
    const ids = Array.isArray(payload?.ids)
      ? payload.ids.map((value: unknown) => Number(value)).filter((value: number) => Number.isFinite(value))
      : [];

    if (!uid || (!ids.length && !items.length)) {
      return NextResponse.json([]);
    }

    const query =
      items.length > 0
        ? {
            user_id: uid,
            $or: items.map((item: { id: number; type: string }) => ({
              id: item.id,
              type: item.type,
            })),
          }
        : {
            user_id: uid,
            type: "movie",
            id: { $in: ids },
          };

    const { client, db } = await connectMongo();
    mongoClient = client;

    const results = await db
      .collection("contents")
      .find(
        query,
        {
          projection: {
            id: 1,
            type: 1,
            user_rating: 1,
          },
        },
      )
      .toArray();

    return NextResponse.json(
      results.map((item) => ({
        id: Number((item as { id?: number | string }).id),
        type: (item as { type?: string }).type ?? "movie",
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

import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"
import { headers } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: any }) {
  try {
    const headersList = headers();
    const uid = (await headersList).get("authorization");
    const db = await connectMongo()

    const results = await db
      .collection("contents")
      .aggregate([
        { $match: { user_id: uid } },
        {
          $group: {
            _id: { $substr: ["$user_date", 0, 4] },
            count: { $count: {} },
          }
        },
      ])
      .sort({ _id: -1 })
      .toArray()

    return NextResponse.json(results)
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: e })
  }
}
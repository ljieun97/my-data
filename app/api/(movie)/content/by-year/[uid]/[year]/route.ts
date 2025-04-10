import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"

export async function GET(req: NextRequest, { params }: { params: any }) {
  try {
    const db = await connectMongo()
    const { uid, year } = await params

    const results = await db
      .collection("contents")
      .aggregate([
        {
          $match: {
            user_id: uid,
            user_date: { $regex: `^${year}`, $options: 'i' }
          }
        }
      ])
      .toArray();

    return NextResponse.json(results)
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: e })
  }
}
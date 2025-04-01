import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"

export async function GET(req: NextRequest, { params }: { params: any }) {
  try {
    const db = await connectMongo()
    const { id } = await params
    const results = await db
      .collection("contents")
      .find({ user_id: id })
      .sort({ user_date: -1 })
      .limit(32)
      .toArray()

    const count = await db
      .collection("contents")
      .count({ user_id: id })

    return NextResponse.json({ results: results, total: count })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: e })
  }
}
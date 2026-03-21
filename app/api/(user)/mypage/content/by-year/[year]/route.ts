import { NextRequest, NextResponse } from "next/server";
import { closeMongo, connectMongo } from "@/lib/mongo/mongodb"
import { headers } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: any }) {
  let mongoClient
  try {
    const headersList = headers()
    const uid = (await headersList).get("authorization")
    const { year } = await params
    const page = Number(req.nextUrl.searchParams.get("page") || "1")
    const limit = Number(req.nextUrl.searchParams.get("limit") || "0")
    const safePage = Number.isFinite(page) && page > 0 ? page : 1
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 0
    const match = {
      user_id: uid,
      user_date: { $regex: `^${year}`, $options: 'i' }
    }

    const { client, db } = await connectMongo()
		mongoClient = client

    if (safeLimit > 0) {
      const totalCount = await db.collection("contents").countDocuments(match)
      const items = await db
        .collection("contents")
        .find(match)
        .sort({ user_date: -1, _id: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .toArray()

      return NextResponse.json({
        items,
        totalCount,
        page: safePage,
        limit: safeLimit,
      })
    }

    const results = await db
      .collection("contents")
      .find(match)
      .sort({ user_date: -1, _id: -1 })
      .toArray();

    return NextResponse.json(results)
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: e })
  } finally {
    if (mongoClient) closeMongo()
  }
}

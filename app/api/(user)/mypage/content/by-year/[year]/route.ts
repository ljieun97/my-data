import { NextRequest, NextResponse } from "next/server";
import { closeMongo, connectMongo } from "@/lib/mongo/mongodb"
import { headers } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: any }) {
  let mongoClient
  try {
    const headersList = headers()
    const uid = (await headersList).get("authorization")
    const { year } = await params

    const { client, db } = await connectMongo()
		mongoClient = client
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
  } finally {
    if (mongoClient) closeMongo()
  }
}
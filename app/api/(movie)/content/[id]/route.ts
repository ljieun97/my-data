import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest, { params: { id } }: { params: any }) {
  const { date } = await req.json()
  try {
    const db = await connectMongo()
    await db
      .collection("contents")
      .updateOne({ _id: new ObjectId(id) },
        {
          $set: { my_date: date },
        })
    return NextResponse.json({ message: "success /movie DELETE" })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: e })
  }
}
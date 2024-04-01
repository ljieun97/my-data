import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"
import { ObjectId } from "mongodb";

const PUT = async (req: NextRequest, { params: { id } }: { params: { id: string } }) => {
  const { date } = await req.json()
  try {
    const db = await connectMongo()
    await db
      .collection("my_movies")
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

const DELETE = async (req: NextRequest, { params: { id } }: { params: { id: string } }) => {
  try {
    const db = await connectMongo()
    await db
      .collection("my_movies")
      .findOneAndDelete({ _id: new ObjectId(id) })
    return NextResponse.json({ message: "success /movie DELETE" })
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: e })
  }
}

export { PUT, DELETE }
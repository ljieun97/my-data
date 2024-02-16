import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"

const GET = async () => {
  try {
    const db = await connectMongo()
    const movies = await db
      .collection("my-movies")
      .find({})
      // .sort({ metacritic: -1 })
      // .limit(10)
      .toArray()
    return NextResponse.json(movies)
  } catch (e) {
    return NextResponse.json({ error: e })
  }
}

const POST = async (userId: string, movieId: string, title: string, image: string, date: string, rating: number) => {
  console.log(title)
  try {
    const db = await connectMongo()
    await db
      .collection("my-movies")
      .updateOne(movieId, {
        userId,
        title,
        image,
        date,
        rating
      }, { upsert: true })
    return NextResponse.json({ message: "success /movie POST" })
  } catch (e) {
    return NextResponse.json({ error: e })
  }
}

export { GET, POST }

import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"
import dayjs from 'dayjs'

const GET = async () => {
	try {
		const db = await connectMongo()
		const movies = await db
			.collection("my_movies")
			.find({})
			.sort({ my_date: -1 })
			// .limit(10)
			.toArray()
		return NextResponse.json(movies)
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	}
}

const POST = async (req: NextRequest) => {
	const { movie, rating } = await req.json()
	// const today = dayjs().format('YYYY-MM-DD HH:mm:ss')
	const today = movie.release_date ? movie.release_date : movie.first_air_date
	movie.my_rating = rating

	try {
		const db = await connectMongo()
		await db
			.collection("my_movies")
			.updateOne({ id: movie.id },
				{
					$set: movie,
					$setOnInsert: { my_date: today }
				}, { upsert: true })
		return NextResponse.json({ message: "success /movie POST" })
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	}
}

export { GET, POST }
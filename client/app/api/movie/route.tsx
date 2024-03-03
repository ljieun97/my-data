import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"
import dayjs from 'dayjs'

const GET = async () => {
	try {
		const db = await connectMongo()
		const movies = await db
			.collection("my_movies")
			.find({})
			.sort({ date: -1 })
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
	let title
  if(movie.title) {
		title = `${movie.title} (${movie.release_date.split("-")[0]})`
	} else {
		title = `${movie.name} (${movie.first_air_date.split("-")[0]})`
	}
	const image = `https://www.themoviedb.org/t/p/w1280${movie.poster_path}`
	const today = dayjs().format('YYYY-MM-DD')
	
	try {
		const db = await connectMongo()
		await db
			.collection("my_movies")
			.updateOne({ title }, {$set: {
				userId: 1,
				title,
				info: {id: movie.id, image, genre_ids: movie.genre_ids, media_type: movie.media_type},
				date: today,
				rating
			}}, { upsert: true })
		return NextResponse.json({ message: "success /movie POST" })
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	}
}

export { GET, POST }
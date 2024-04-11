import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"
import dayjs from 'dayjs'

const GET = async () => {
	try {
		const db = await connectMongo()
		const results = await db
			.collection("my_movies")
			.aggregate([
				{
					$group: {
						_id: '$media_type',
						count: { $sum: 1 }
					}
				},
			])
		return NextResponse.json(results)
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	}
}

export { GET }
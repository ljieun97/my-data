import { NextRequest, NextResponse } from "next/server";
import { closeMongo, connectMongo } from "@/lib/mongo/mongodb"

export const dynamic = "force-dynamic"
const GET = async () => {
	let mongoClient
	try {
		const { client, db } = await connectMongo()
		mongoClient = client
		const results = await db
			.collection("contents")
			.aggregate([
				{
					$unwind: { path: "$genre_ids" }
				},
				{
					$group: {
						_id: "$genre_ids",
						count: { $count: {} },
					}
				},
			])
			.sort({ count: -1 })
			.limit(1)
			.toArray()
		return NextResponse.json(results)
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	} finally {
		if (mongoClient) closeMongo()
	}
}

export { GET }
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"


const GET = async () => {
	try {
		const db = await connectMongo()
		const results = await db
			.collection("contents")
			.aggregate([
				{
					$group: {
						_id: { $substr: ["$user_date", 0, 4] },
						count: { $count: {} },
					}
				},
			])
			.sort({ _id: -1 })
			.toArray()
		return NextResponse.json(results)
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	}
}

export { GET }
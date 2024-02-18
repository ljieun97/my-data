import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"
import { ObjectId } from "mongodb";

const DELETE = async (req: NextRequest, { params: { id } }: { params: { id: string } }) => {
	try {
		const db = await connectMongo()
		await db
			.collection("my-movies")
			.findOneAndDelete({ _id: new ObjectId(id) })
		return NextResponse.json({ message: "success /movie DELETE" })
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	}
}

export { DELETE }
import { NextRequest, NextResponse } from "next/server";
import { closeMongo, connectMongo } from "@/lib/mongo/mongodb"
import dayjs from 'dayjs'
import { ObjectId } from "mongodb";
import { cookies, headers } from "next/headers";


export async function POST(req: NextRequest, { params }: { params: any }) {
	const { uid, content, rating, isTodaySave } = await req.json()

	if (!uid) {
		return NextResponse.json({ error: "Missing uid or isTodaySave" }, { status: 400 });
	}
	const today = dayjs().format('YYYY-MM-DD')
	let date = isTodaySave === "true" ? today : content.release_date 
	let object = {} as any

	//제목 정렬때문에 title로 통합
	// if (content.genre_ids) {
		if (content.title) {
			object = {
				type: "movie",
				title: content.title,
				id: content.id,
				poster_path: content.poster_path,
				genre_ids: content.genre_ids
			}
		} else {
			object = {
				type: "tv",
				title: content.name,
				id: content.id,
				poster_path: content.poster_path,
				genre_ids: content.genre_ids
			}
		}
	// } else if (content.webtoonId) {
	// 	date = today
	// 	object = {
	// 		type: '웹툰',
	// 		webtoonId: true,
	// 		title: content.title,
	// 		service: content.service,
	// 		id: content.webtoonId,
	// 		img: content.img,
	// 	}
	// } else if (content.isbn) {
	// 	date = today
	// 	object = {
	// 		type: '도서',
	// 		isbn: true,
	// 		title: content.title,
	// 		id: Number(content.isbn),
	// 		image: content.image,
	// 	}
	// }

	object.user_id = uid
	object.user_rating = rating
	object.user_isLike = false
	console.log(object)

	let mongoClient
	try {
		const { client, db } = await connectMongo()
		mongoClient = client
		await db
			.collection("contents")
			.updateOne(
				{
					user_id: object.user_id,
					type: object.type,
					id: object.id
				},
				{
					// $set: content,
					$set: object,
					$setOnInsert: { user_date: date }
				}, { upsert: true })
		//title type source sourceId age my_date my_rating my_isLike poster_path backdrop_path genres userId
		//식별자 userId + type + sourceId
		return NextResponse.json({ message: "success /content POST" })
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	} finally {
		if (mongoClient) closeMongo()
	}
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
	const { cid } = await params
	const { uid, poster_path, date } = await req.json()
	if (!uid || !cid) {
		return NextResponse.json({ error: "Missing uid or cid" }, { status: 400 });
	}
	let mongoClient
	try {
		const { client, db } = await connectMongo()
		mongoClient = client
		await db
			.collection("contents")
			.updateOne({ _id: new ObjectId(cid) },
				{
					$set: {
						poster_path: poster_path,
						user_date: date
					},
				})
		return NextResponse.json({ message: "success /movie DELETE" })
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	} finally {
		if (mongoClient) closeMongo()
	}
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
	const headersList = headers()
	const uid = (await headersList).get("authorization")
	const { cid } = await params
	if (!uid || !cid) {
		return NextResponse.json({ error: "Missing uid or cid" }, { status: 400 });
	}

	let mongoClient
	try {
		const { client, db } = await connectMongo()
		mongoClient = client
		await db
			.collection("contents")
			.findOneAndDelete({ _id: new ObjectId(cid) })
		return NextResponse.json({ message: "success /movie DELETE" })
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	} finally {
		if (mongoClient) closeMongo()
	}
}
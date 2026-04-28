import { NextRequest, NextResponse } from "next/server";
import { closeMongo, connectMongo } from "@/lib/mongo/mongodb"
import dayjs from 'dayjs'
import { ObjectId } from "mongodb";
import { cookies, headers } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: any }) {
	const headersList = headers()
	const uid = (await headersList).get("authorization")
	const { cid } = await params
	const type = req.nextUrl.searchParams.get("type")
	const seasonNumber = Number(req.nextUrl.searchParams.get("season_number") || "1")

	if (!uid || !cid || !type) {
		return NextResponse.json({ error: "Missing uid, cid or type" }, { status: 400 });
	}

	let mongoClient
	try {
		const { client, db } = await connectMongo()
		mongoClient = client
		const query: any = {
			user_id: uid,
			type,
			id: Number.isNaN(Number(cid)) ? cid : Number(cid)
		}
		if (type === "tv") query.season_number = seasonNumber
		const existingItem = await db.collection("contents").findOne(query)

		if (!existingItem) {
			return NextResponse.json({ duplicate: false })
		}

		return NextResponse.json({
			duplicate: true,
			existingId: String(existingItem._id),
			existingDate: existingItem.user_date ?? null,
			existingRating: existingItem.user_rating ?? null,
		})
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	} finally {
		if (mongoClient) closeMongo()
	}
}


export async function POST(req: NextRequest, { params }: { params: any }) {
	const { uid, content, rating, isTodaySave, saveDateMode, saveDate } = await req.json()

	if (!uid) {
		return NextResponse.json({ error: "Missing uid or isTodaySave" }, { status: 400 });
	}
	const today = dayjs().format('YYYY-MM-DD')
	const releaseLikeDate = content.release_date || content.first_air_date || today
	const resolvedMode =
		saveDateMode === "release" || saveDateMode === "today" || saveDateMode === "custom"
			? saveDateMode
			: isTodaySave === "true"
				? "today"
				: "release"
	let date =
		resolvedMode === "today"
			? today
			: resolvedMode === "custom"
				? saveDate || today
				: releaseLikeDate
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
			const seasonNumber = Number(content.season_number || 1)
			object = {
				type: "tv",
				title: content.name,
				id: content.id,
				season_number: seasonNumber,
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
		const duplicateQuery: any = {
			user_id: object.user_id,
			type: object.type,
			id: object.id
		}
		if (object.type === "tv") duplicateQuery.season_number = object.season_number ?? 1
		const existingItem = await db.collection("contents").findOne(duplicateQuery)

		if (existingItem) {
			return NextResponse.json(
				{
					message: "duplicate",
					duplicate: true,
					existingId: String(existingItem._id),
					existingDate: existingItem.user_date ?? null,
					existingRating: existingItem.user_rating ?? null,
					nextDate: date ?? null,
				},
				{ status: 409 },
			)
		}

		await db
			.collection("contents")
			.updateOne(
				{
					user_id: object.user_id,
					type: object.type,
					id: object.id,
					...(object.type === "tv" ? { season_number: object.season_number ?? 1 } : {})
				},
				{
					// $set: content,
					$set: object,
					$setOnInsert: { user_date: date }
				}, { upsert: true })
		//title type source sourceId age my_date my_rating my_isLike poster_path backdrop_path genres userId
		//식별자 userId + type + sourceId
		return NextResponse.json({ message: "success /content POST", duplicate: false })
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	} finally {
		if (mongoClient) closeMongo()
	}
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
	const { cid } = await params
	const { uid, poster_path, date, rating } = await req.json()
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
						user_date: date,
						user_rating: rating
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

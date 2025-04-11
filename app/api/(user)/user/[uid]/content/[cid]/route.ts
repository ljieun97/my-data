import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"
import dayjs from 'dayjs'
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest, { params }: { params: any }) {
	const { uid } = await params
	if (!uid) {
		return NextResponse.json({ error: "Missing uid" }, { status: 400 });
	}
	const { content, rating } = await req.json()

	const today = dayjs().format('YYYY-MM-DD HH:mm:ss')
	let date = ''
	let object = {} as any

	//제목 정렬때문에 title로 통합
	if (content.genre_ids) {
		if (content.title) {
			date = content.release_date
			object = {
				type: "movie",
				title: content.title,
				id: content.id,
				poster_path: content.poster_path,
				genre_ids: content.genre_ids
			}
		} else {
			date = content.first_air_date
			object = {
				type: "tv",
				title: content.name,
				id: content.id,
				poster_path: content.poster_path,
				genre_ids: content.genre_ids
			}
		}
	} else if (content.webtoonId) {
		date = today
		object = {
			type: '웹툰',
			webtoonId: true,
			title: content.title,
			service: content.service,
			id: content.webtoonId,
			img: content.img,
		}
	} else if (content.isbn) {
		date = today
		object = {
			type: '도서',
			isbn: true,
			title: content.title,
			id: Number(content.isbn),
			image: content.image,
			// backdrop_path: content.backdrop_path,
			// genres: content.genre_ids
		}
	}

	object.user_id = uid
	object.user_rating = rating
	object.user_isLike = false
	console.log(object)

	try {
		const db = await connectMongo()
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
	}
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
	const { uid, cid } = await params
	if (!uid || !cid) {
		return NextResponse.json({ error: "Missing uid or cid" }, { status: 400 });
	}
	const { poster_path } = await req.json()
	try {
		const db = await connectMongo()
		await db
			.collection("contents")
			.updateOne({ _id: new ObjectId(cid) },
				{
					$set: { poster_path: poster_path },
				})
		return NextResponse.json({ message: "success /movie DELETE" })
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	}
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
	const { uid, cid } = await params
	if (!uid || !cid) {
		return NextResponse.json({ error: "Missing uid or cid" }, { status: 400 });
	}
	try {
		const db = await connectMongo()
		await db
			.collection("contents")
			.findOneAndDelete({ _id: new ObjectId(cid) })
		return NextResponse.json({ message: "success /movie DELETE" })
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	}
}
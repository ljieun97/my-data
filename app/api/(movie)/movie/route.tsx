import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongo/mongodb"
import dayjs from 'dayjs'

export const dynamic = "force-dynamic"

const GET = async (request: NextRequest) => {
	const limit = 18
	const searchParams = request.nextUrl.searchParams

	// const nextId = searchParams.get('nextId')
	// const nextQuery = nextId ? { _id: { $gt: nextId } } : {}
	const page = searchParams.get('page')
	const sort = searchParams.get('sort')
	const asc = searchParams.get('asc')

	const type = searchParams.get('type')
	const typeQuery = type ? { "type": type } : {}
	const date = searchParams.get('date')
	const dateQuery = date ? { "user_date": { '$regex': `^${date}` } } : {}
	const rating = searchParams.get('rating')
	const ratingQuery = rating ? { "user_rating": Number(rating) } : {}

	try {
		const db = await connectMongo()
		const results = await db
			.collection("contents")
			.find({
				$and: [
					typeQuery, dateQuery, ratingQuery
				]
			})
			.sort(sort, asc)
			.skip(limit * (Number(page)))
			.limit(limit)
			.toArray()

		const count = await db
			.collection("contents")
			.count({
				$and: [
					typeQuery, dateQuery, ratingQuery
				]
			})

		const total_page = Math.ceil(count / limit) as ResponseInit
		return NextResponse.json({ results: results, total: count, total_page: total_page })
	} catch (e) {
		console.log(e)
		return NextResponse.json({ error: e })
	}
}

const POST = async (req: NextRequest) => {
	const { content, rating } = await req.json()
	// content.my_rating = rating

	const today = dayjs().format('YYYY-MM-DD HH:mm:ss')
	let date = ''
	let object = {} as any

	//제목 정렬때문에 title로 통합
	if (content.genre_ids) {
		if (content.title) {
			date = content.release_date
			object = {
				type: '영화',
				title: content.title,
				id: content.id,
				poster_path: content.poster_path,
				genre_ids: content.genre_ids
			}
		} else {
			date = content.first_air_date
			object = {
				type: 'TV',
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

	object.user_id = 1
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

export { GET, POST }
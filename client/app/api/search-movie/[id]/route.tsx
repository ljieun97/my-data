import { NextResponse } from "next/server";

const API_URL = "https://api.themoviedb.org/3/search/movie"
const key = ""

export async function GET(req: Request, { params }: { params: { id: string } }) {
	console.log(params.id)
	const response = await fetch(API_URL+'?query='+params.id+'&language=ko&page=1', {
		method: "GET",
		headers: {
			accept: 'application/json',
			"Authorization": `Bearer ${key}`
		},
	})
	const json = await response.json()
	console.log(json)
	return NextResponse.json({ json });
}
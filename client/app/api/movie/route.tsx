import { NextResponse } from "next/server";

const API_URL = "https://api.themoviedb.org/3/search/movie?query=웡카&language=ko&page=1"
const key = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZjkwNjhiYjlhYzEwM2UxZmVmODZiYmMzMmU0MjdjZiIsInN1YiI6IjYzZmIwYTQwMzQ0YThlMDBlNmNlMDk2OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.GyhHdVATnofwAdYZ0-yV1uX30FqrTU_QGBJH3mcQNqQ"

export async function GET() {
    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
        accept: 'application/json',
        "Authorization": `Bearer ${key}`
        }
    })
    const json = await response.json()
    return NextResponse.json({ json });
}
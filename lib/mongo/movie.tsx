'use client'

const GetMovies = async (page: number, date: string, type: string, rating: string, sort: string, asc: number) => {
  const response = await fetch(`/api/movie?page=${page}&date=${date}&type=${type}&rating=${rating}&sort=${sort}&asc=${asc}`, {
    method: "GET",
  })
  // const {result, total_page} = await response.json()
  return response
}

const CreateMovie = async (content: any, rating: number) => {
  await fetch(`/api/movie`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content, rating })
  })
}

const UpdateMovie = async (id: any, date: string) => {
  await fetch(`/api/movie/${id}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ date })
  })
}

const DeleteMovie = async (id: any) => {
  await fetch(`/api/movie/${id}`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json'
    },
  })
}

const GetMovieCount = async () => {
  const response = await fetch(`/api/movies`, {
    method: "GET"
  })
  const result = await response.json()
  return result
}

const GetGenreCount = async () => {
  const response = await fetch(`/api/genre`, {
    method: "GET"
  })
  const result = await response.json()
  console.log(result)
  return result
}

export { GetMovies, CreateMovie, UpdateMovie, DeleteMovie, GetMovieCount, GetGenreCount }

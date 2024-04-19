'use client'

const GetMovies = async () => {
  const response = await fetch(`/api/movie`, {
    method: "GET"
  })
  const result = await response.json()
  return result
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

export { GetMovies, CreateMovie, UpdateMovie, DeleteMovie, GetMovieCount }

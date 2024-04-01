// const base_url = 'http://localhost:3000'
const base_url = 'https://my-data-iota.vercel.app'

const GetMovies = async () => {
  const response = await fetch(`${base_url}/api/movie`, {
    method: "GET"
  })
  const result = await response.json()
  return result
}

const CreateMovie = async (movie: any, rating: number) => {
  await fetch(`${base_url}/api/movie`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ movie, rating })
  })
}

const UpdateMovie = async (id: any, date: string) => {
  await fetch(`${base_url}/api/movie/${id}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ date })
  })
}

const DeleteMovie = async (id: any) => {
  await fetch(`${base_url}/api/movie/${id}`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json'
    },
  })
}

export { GetMovies, CreateMovie, UpdateMovie, DeleteMovie }

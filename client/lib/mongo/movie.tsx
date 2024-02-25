const URL = "http://localhost:3000"
// const URL = "http://3.37.79.44/:3000"

const getMovies = async () => {
  const response = await fetch(`${URL}/api/movie`, {
    method: "GET"
  })
  return await response.json()
}

const deleteMovie = async (id: any) => {
  await fetch(`${URL}/api/movie/${id}`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json'
    },
  })
}

export {getMovies, deleteMovie}

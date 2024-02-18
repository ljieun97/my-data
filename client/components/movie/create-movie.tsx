"use client"

const createMovie = async (movie: any) => {
  await fetch('/api/movie', {
    method: "POST",
    body: JSON.stringify(movie),
  })
}

const CreateMovie = (movie: any) => {
  return (
    <button onClick={() => createMovie(movie)}>등록</button>
  )
}

export default CreateMovie
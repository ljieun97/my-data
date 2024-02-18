"use client"

const deleteMovie = async ({id}: {id: any}) => {
  await fetch(`/api/movie/${id}`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json'
    },
  })
}

const DeleteMovie = (id: any) => {
  return (
    <button onClick={() => deleteMovie(id)}>삭제</button>
  )
}

export default DeleteMovie
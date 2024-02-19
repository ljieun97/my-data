"use client"

import { deleteMovie } from "@/lib/mongo/movie"

const DeleteMovie = (id: any) => {
  return (
    <button onClick={() => deleteMovie(id)}>삭제</button>
  )
}

export default DeleteMovie
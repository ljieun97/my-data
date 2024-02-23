"use client"
// Error: Event handlers cannot be passed to Client Component props.
{/* <button onClick={function} children=...> */}

import { deleteMovie } from "@/lib/mongo/movie"

const DeleteMovie = (id: any) => {
  return (
    <button onClick={() => deleteMovie(id)}>삭제</button>
  )
}

export default DeleteMovie
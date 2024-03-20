"use client"

import useSWR from 'swr'
import fetch from 'unfetch'

const options = {
  headers: {
    'Content-Type': 'application/json'
  }
}
const fetcher = (url: any) => fetch(url, options).then((r: any) => r.json())

const GetMovies = () => {
  const { data, error, isLoading } = useSWR(`/api/movie`, fetcher,
  { revalidateOnFocus: false, revalidateOnReconnect: false })
  return {
    movies: data,
    isLoading,
    isError: error
  }
}

// const GetMovies = async () => {
//   const response = await fetch(`http://localhost:3000/api/movie`, {
//     method: "GET"
//   })
//   const result = await response.json()
//   console.log(result)
//   return result
// }

const CreateMovie = async (movie: any, rating: number) => {
  await fetch('/api/movie', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ movie, rating })
  })
}

const UpdateMovie = async (movie: any, rating: number) => {
  await fetch('/api/movie', {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ movie, rating })
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

export { GetMovies, CreateMovie, UpdateMovie, DeleteMovie }

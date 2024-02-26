"use client"

const URL = "http://localhost:3000"
// const URL = "http://3.37.79.44/:3000"

import useSWR from 'swr'
import fetch from 'unfetch'
 
const fetcher = (url: any) => fetch(url).then((r: any) => r.json())

const getMovies = () => {
  const { data, error, isLoading } = useSWR(`/api/movie`, fetcher)
  return {
    movies: data,
    isLoading,
    isError: error
  }
}

const deleteMovie = async (id: any) => {
  await fetch(`${URL}/api/movie/${id}`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json'
    },
  })
}

export { getMovies, deleteMovie }

"use client"

import { Button } from "@nextui-org/react";

const createMovie = async (movie: any) => {
  await fetch('/api/movie', {
    method: "POST",
    body: JSON.stringify(movie),
  })
}

const CreateMovie = (movie: any) => {
  return (
    <Button
      className="text-tiny text-white bg-black/20"
      variant="flat" color="default" radius="lg" size="sm"
      onClick={() => createMovie(movie)}
    >
      등록
    </Button>
  )
}

export default CreateMovie
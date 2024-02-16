"use client"

//여기 await 피룡한데..
function createMovie(movie: { title: string, image: string }) {
  console.log(movie)
  fetch('/movie', {
    method: "POST",
    body: JSON.stringify(movie),
  })
}

export default function CreateMovie( movie: any ) {
  return (
    <button onClick={() => createMovie(movie)}>등록</button>
  )
}
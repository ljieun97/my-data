// export const dynamic = 'force-dynamic'
// "use client"

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue, Link } from "@nextui-org/react";

import { getMovies } from "@/lib/mongo/movie"
import MyMovies from "@/components/movie/my-movies";
import Title from "@/components/common/title";

const MyPage = () => {
  // const movies = 

  return (
    <>
      <Title title={'마이페이지'} />
      <MyMovies />
    </>
  )
}

export default MyPage





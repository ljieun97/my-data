"use client"

import { useSearchParams } from "next/navigation"
import Title from "../components/common/title"
import SearchList from "../components/contents/search-list"
import { Spacer } from "@nextui-org/react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword')

  return (
    <>
      <Title
        title={`"${keyword}"`}
        sub={"에 대한 검색결과"}
      />
      <Spacer y={4} />

        <SearchList keyword={keyword} />


    </>
  )
}
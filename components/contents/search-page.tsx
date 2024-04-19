"use client"

import { useSearchParams } from "next/navigation"
import Title from "../common/title"
import SearchList from "./search-list"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword')

  return (
    <>
      <div className="text-center">
        <Title title={`"${keyword}" 검색결과`} />
      </div>
      <SearchList keyword={keyword} />
    </>
  )
}
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
        <span>두 글자 이상 입력 및 띄어쓰기 주의</span>
      </div>
      <SearchList keyword={keyword} />
    </>
  )
}
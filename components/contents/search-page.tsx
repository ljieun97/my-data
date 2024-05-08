"use client"

import { useSearchParams } from "next/navigation"
import Title from "../common/title"
import SearchList from "./search-list"
import { Spacer } from "@nextui-org/react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword')

  return (
    <>
      <Spacer y={16} />
      <div className="px-2 py-6 mx-auto max-w-7xl">
        <div className="px-4 pt-8 pb-4 flex items-center">
          <Title
            title={`[${keyword}] 검색결과`}
            sub={"두 글자 이상 입력 및 띄어쓰기 주의"}
          />
        </div>
        <SearchList keyword={keyword} />
      </div>
    </>
  )
}
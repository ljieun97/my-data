"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

//이 인풋을 헤더에 넣어야할듯

export default function SearchInput() {
  const router = useRouter()
  const [isClick, setIsClick] = useState(false)
  const [keyword, setKeword] = useState("")

  useEffect(() => {
    if (keyword) {
      router.push(`/search?keyword=${keyword}`)
    }
  }, [keyword])

  const handleKeyword = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeword(e.target.value)
  }, [keyword])

  return (
    <>
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            placeholder="검색"
            value={keyword}
            onChange={handleKeyword}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </>
  )
}

"use client"

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function SearchInput() {
  const router = useRouter()
  const path = usePathname()
  const [keyword, setKeword] = useState("")

  useEffect(() => {
    if (keyword) {
      router.push(`/search?keyword=${keyword}`)
    } else if (path === "/search") {
      router.push(`/`)
    }
  }, [keyword, path, router])

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

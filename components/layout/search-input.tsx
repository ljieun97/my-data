"use client"

import { Input } from "@nextui-org/react";
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
  }, [keyword])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeword(e.target.value)
  }, [keyword])

  return (
    <>
      <Input
        classNames={{
          base: "max-w-full sm:max-w-[10rem] h-10",
          mainWrapper: "h-full",
          input: "text-small",
          inputWrapper: "h-full",
        }}
        placeholder="제목"
        size="sm"
        // startContent={<SearchIcon size={18} />}
        value={keyword}
        onChange={handleInput}
        type="search"
      />
    </>
  )
}

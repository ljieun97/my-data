"use client"

import { Input } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"

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
          base: "w-[10rem] h-10",
          mainWrapper: "h-full ",
          // input: "placeholder:text-gray text-small bg-transparent",
          input: "bg-transparent",
          // innerWrapper: "bg-white",
          inputWrapper: "h-full bg-default-200/25",
          // inputWrapper: "h-full",
        }}
        placeholder="제목 검색"
        size="sm"
        // variant="bordered"
        // startContent={<FontAwesomeIcon icon={faMagnifyingGlass} />}
        value={keyword}
        onChange={handleInput}
        type="search"
      />
    </>
  )
}

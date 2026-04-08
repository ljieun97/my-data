"use client";

import { Input } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function SearchInput() {
  const router = useRouter();
  const path = usePathname();
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (keyword) {
      router.push(`/search?keyword=${keyword}`);
    } else if (path === "/search") {
      router.push(`/`);
    }
  }, [keyword, path, router]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  return (
    <Input
      className="topbar-search hidden h-11 md:flex md:min-w-0 md:w-[10rem] lg:w-[13rem] xl:w-[16rem]"
      placeholder="Search titles"
      value={keyword}
      onChange={handleInput}
      type="search"
      size={40}
      aria-label="Search titles"
    />
  );
}

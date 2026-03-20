"use client"

import { Input } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function SearchInput() {
  const router = useRouter();
  const path = usePathname();
  const [keyword, setKeword] = useState("");

  useEffect(() => {
    if (keyword) {
      router.push(`/search?keyword=${keyword}`);
    } else if (path === "/search") {
      router.push(`/`);
    }
  }, [keyword, path, router]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeword(e.target.value);
  }, []);

  return (
    <Input
      classNames={{
        base: "hidden h-11 md:flex md:min-w-0 md:w-[10rem] lg:w-[13rem] xl:w-[16rem]",
        mainWrapper: "h-full",
        input: "topbar-search-input bg-transparent text-sm placeholder:text-slate-400",
        inputWrapper:
          "topbar-search h-full rounded-full border px-3 backdrop-blur-md transition",
      }}
      placeholder="Search titles"
      size="sm"
      value={keyword}
      onChange={handleInput}
      type="search"
    />
  );
}

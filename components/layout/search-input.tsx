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
        base: "hidden h-11 md:flex md:w-[13rem] lg:w-[16rem]",
        mainWrapper: "h-full",
        input: "bg-transparent text-sm text-slate-800 placeholder:text-slate-400",
        inputWrapper:
          "h-full rounded-full border border-white/70 bg-white/78 px-3 shadow-[0_10px_30px_rgba(148,163,184,0.15)] backdrop-blur-md transition hover:border-slate-200 data-[focus=true]:border-slate-300 data-[focus=true]:bg-white",
      }}
      placeholder="Search titles"
      size="sm"
      value={keyword}
      onChange={handleInput}
      type="search"
    />
  );
}

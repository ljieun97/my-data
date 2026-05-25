"use client";

import { Input } from "@heroui/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SearchInput({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryKeyword = (searchParams.get("keyword") || "").trim();  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState(queryKeyword);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextKeyword = e.target.value;
    setInputValue(nextKeyword);
    const nextUrl = `/search?keyword=${encodeURIComponent(nextKeyword)}`;
    router.push(nextUrl);
  };

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [autoFocus]);

  return (
    <Input
      ref={inputRef}
      aria-label="Name"
      placeholder="제목을 입력하세요."
      className="border-none shadow-none outline-none ring-0
        focus:border-none focus:outline-none focus:ring-0
        focus-visible:outline-none focus-visible:ring-0"
      value={inputValue}
      onChange={handleInput}
      autoFocus={autoFocus}
    />
  );
}

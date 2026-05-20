"use client";

import { Input } from "@heroui/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSearchContext } from "@/context/SearchContext";

const SEARCH_DEBOUNCE_MS = 250;

function isDetailPath(pathname: string) {
  return /^\/(?:movie|tv|person)\/[^/]+$/.test(pathname);
}

export default function SearchInput({
  className = "topbar-search h-11",
  autoFocus = false,
  onBlur,
}: {
  className?: string;
  autoFocus?: boolean;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}) {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const { lastNonSearchPath } = useSearchContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryKeyword = (searchParams.get("keyword") || "").trim();
  const [inputValue, setInputValue] = useState(queryKeyword);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextKeyword = e.target.value;
    setInputValue(nextKeyword);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (path === "/search" && !nextKeyword.trim()) {
      router.push(lastNonSearchPath && !isDetailPath(lastNonSearchPath) ? lastNonSearchPath : "/");
      return;
    }

    if (!nextKeyword.trim()) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      const nextUrl = `/search?keyword=${encodeURIComponent(nextKeyword)}`;

      if (path === "/search") {
        router.replace(nextUrl, { scroll: false });
        return;
      }

      router.push(nextUrl);
    }, SEARCH_DEBOUNCE_MS);
  };

  useEffect(() => {
    if (path === "/search") {
      setInputValue(queryKeyword);
      return;
    }

    if (!queryKeyword) {
      setInputValue("");
    }
  }, [path, queryKeyword]);

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

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <Input
      ref={inputRef}
      className={className}
      placeholder="Search titles"
      value={inputValue}
      onChange={handleInput}
      onBlur={onBlur}
      type="search"
      size={40}
      autoFocus={autoFocus}
      aria-label="Search titles"
    />
  );
}

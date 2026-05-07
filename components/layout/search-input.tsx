"use client";

import { Input } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useCallback, useRef } from "react";
import { useSearchKeyword } from "@/context/SearchContext";

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
  const { keyword, setKeyword, lastNonSearchPath } = useSearchKeyword();
  const previousPathRef = useRef(path);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const nextKeyword = e.target.value;
    setKeyword(nextKeyword);

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
  }, [lastNonSearchPath, path, router, setKeyword]);

  useEffect(() => {
    if (previousPathRef.current === "/search" && path !== "/search" && !isDetailPath(path)) {
      setKeyword("");
    }

    previousPathRef.current = path;
  }, [path, setKeyword]);

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
      value={keyword}
      onChange={handleInput}
      onBlur={onBlur}
      type="search"
      size={40}
      autoFocus={autoFocus}
      aria-label="Search titles"
    />
  );
}

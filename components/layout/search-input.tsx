"use client";

import { Input } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useCallback, useRef } from "react";
import { useSearchKeyword } from "@/context/SearchContext";

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

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const nextKeyword = e.target.value;
    setKeyword(nextKeyword);

    if (path === "/search" && !nextKeyword.trim()) {
      router.push(lastNonSearchPath && !isDetailPath(lastNonSearchPath) ? lastNonSearchPath : "/");
      return;
    }

    if (path !== "/search" && nextKeyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(nextKeyword)}`);
    }
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

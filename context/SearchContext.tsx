"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";
import { useEffect } from "react";

type SearchContextValue = {
  keyword: string;
  setKeyword: (value: string) => void;
  lastNonSearchPath: string;
};

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [keyword, setKeyword] = useState("");
  const [lastNonSearchPath, setLastNonSearchPath] = useState("/");

  useEffect(() => {
    if (pathname && pathname !== "/search") {
      setLastNonSearchPath(pathname);
    }
  }, [pathname]);

  const value = useMemo(() => ({ keyword, setKeyword, lastNonSearchPath }), [keyword, lastNonSearchPath]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchKeyword() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearchKeyword must be used within SearchProvider");
  }

  return context;
}

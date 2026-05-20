"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";
import { useEffect } from "react";

type SearchContextValue = {
  lastNonSearchPath: string;
};

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

function isDetailPath(pathname: string) {
  return /^\/(?:movie|tv|person)\/[^/]+$/.test(pathname);
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lastNonSearchPath, setLastNonSearchPath] = useState("/");

  useEffect(() => {
    if (pathname && pathname !== "/search" && !isDetailPath(pathname)) {
      setLastNonSearchPath(pathname);
    }
  }, [pathname]);

  const value = useMemo(() => ({ lastNonSearchPath }), [lastNonSearchPath]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchContext() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearchContext must be used within SearchProvider");
  }

  return context;
}

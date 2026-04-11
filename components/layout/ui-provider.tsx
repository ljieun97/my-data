'use client'

import { Toast } from "@heroui/react";
import TopBar from "./top-bar";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SearchProvider } from "@/context/SearchContext";
import { SaveDateProvider } from "@/context/SaveDateContext";

export function UiProvider({
  children, modal
}: {
  children: any, modal: any
}) {
  const pathname = usePathname();
  const isCalendarPage = pathname?.startsWith("/calendar");
  const isFilterPage = pathname === "/movie" || pathname === "/tv";
  const isHomePage = pathname === "/";
  const isDetailRoute = pathname?.startsWith("/movie/") || pathname?.startsWith("/tv/");
  const [detailOriginIsHome, setDetailOriginIsHome] = useState(false);
  const previousPathRef = useRef(pathname);
  const shouldUseFullWidthHomeLayout = isHomePage || (isDetailRoute && detailOriginIsHome);
  const usePageShell = false;

  useEffect(() => {
    const previousPath = previousPathRef.current;

    if (isDetailRoute) {
      setDetailOriginIsHome(previousPath === "/");
    } else if (!isHomePage) {
      setDetailOriginIsHome(false);
    }

    previousPathRef.current = pathname;
  }, [isDetailRoute, isHomePage, pathname]);

  return (
    <>
      <Toast.Provider />
      <SearchProvider>
        <SaveDateProvider>
          <>
            <main>
              <div className={`app-shell text-foreground bg-background flex-grow ${isFilterPage ? "app-shell--locked" : ""}`}>
                <TopBar />
                <div className={`min-h-screen pb-12 pt-28 ${isFilterPage ? "app-shell__viewport" : ""}`}>
                  <div className={`${shouldUseFullWidthHomeLayout ? "w-full" : "app-frame"} ${usePageShell ? "page-shell" : ""} ${isFilterPage ? "flex h-full min-h-0 flex-col" : ""} ${isFilterPage ? "page-shell--locked" : ""}`}>
                    {children}
                  </div>
                </div>
              </div>
            </main>
            {modal}
          </>
        </SaveDateProvider>
      </SearchProvider>
    </>
  );
}

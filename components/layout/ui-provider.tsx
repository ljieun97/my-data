'use client'

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import TopBar from "./top-bar";
import React from "react";
import { usePathname } from "next/navigation";

export function UiProvider({
  children, modal
}: {
  children: any, modal: any
}) {
  const pathname = usePathname();
  const isCalendarPage = pathname?.startsWith("/calendar");
  const isFilterPage = pathname === "/movie" || pathname === "/tv";

  return (
    <HeroUIProvider>
      <ToastProvider />
      <main>
        <div className={`app-shell text-foreground bg-background flex-grow ${isFilterPage ? "app-shell--locked" : ""}`}>
          <TopBar />
          <div className={`min-h-screen px-4 pb-12 pt-28 sm:px-6 lg:px-8 ${isFilterPage ? "app-shell__viewport" : ""}`}>
            <div className={`mx-auto w-full max-w-7xl ${isCalendarPage ? "" : "page-shell"} ${isFilterPage ? "page-shell--locked" : ""}`}>
              {children}
            </div>
          </div>
        </div>
      </main>
      {modal}
    </HeroUIProvider>
  );
}

'use client'

import { HeroUIProvider } from "@heroui/react";
import TopBar from "./top-bar";
import React from "react";

export function UiProvider({
  children, modal
}: {
  children: any, modal: any
}) {


  return (
    <HeroUIProvider>
      <main>
        <div className="text-foreground bg-background flex-grow">
          <TopBar />
          <div className="h-[calc(100vh_-_64px)] px-6 py-14 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      {modal}
    </HeroUIProvider>
  );
}
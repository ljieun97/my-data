'use client'

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import TopBar from "./top-bar";
import React from "react";

export function UiProvider({
  children, modal
}: {
  children: any, modal: any
}) {


  return (
    <HeroUIProvider>
      <ToastProvider />
      <main>
        <div className="app-shell text-foreground bg-background flex-grow">
          <TopBar />
          <div className="min-h-screen px-4 pb-12 pt-28 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </div>
        </div>
      </main>
      {modal}
    </HeroUIProvider>
  );
}

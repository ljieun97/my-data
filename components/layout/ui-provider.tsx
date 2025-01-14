'use client'

import { NextUIProvider } from "@nextui-org/react";
import TopBar from "./top-bar";

export function UiProvider({
  children
}: {
  children: any
}) {

  return (
    <NextUIProvider>
      <main>
        <div className="dark text-foreground bg-background flex-grow">
          <TopBar />
          <div className="px-6 py-14 max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </NextUIProvider>
  );
}
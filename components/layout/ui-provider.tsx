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
        <div className="dark text-foreground bg-background mx-auto max-w-7xl flex-grow">
          <div className="px-4">
            <TopBar />
            {children}
          </div>
        </div>
      </main>
    </NextUIProvider>
  );
}
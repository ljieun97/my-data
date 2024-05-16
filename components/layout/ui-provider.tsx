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
          {children}
        </div>
      </main>
    </NextUIProvider>
  );
}
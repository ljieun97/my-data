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
        <div className=" px-8 dark text-foreground bg-background mx-auto max-w-7xl flex-grow">
          <TopBar />
          <div className="py-8">{children}</div>
        </div>
      </main>
    </NextUIProvider>
  );
}
'use client'

import { NextUIProvider } from "@nextui-org/react";
import TopBar from "./top-bar";

export function UiProvider({
  children, auth
}: {
  children: React.ReactNode; auth: React.ReactNode
}) {

  return (
    <NextUIProvider>
      <main>
        <div className="dark px-8 text-foreground bg-background mx-auto max-w-7xl flex-grow">
          <TopBar />
          <div className="py-8">{children}</div>
          <div>{auth}</div>
        </div>

      </main>
    </NextUIProvider>
  );
}
import TopBar from "@/components/layout/top-bar";
import styles from "@/styles/layout.module.css"
import "@/styles/global.css";

import type { Metadata } from "next";
import { UiProvider } from "@/components/layout/ui-provider";

// import "98.css";

export const metadata: Metadata = {
  title: {
    template: "%s | NABIC",
    default: "NABIC"
  },
  description: "서비스 설명",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <UiProvider children={children} />
      </body>
    </html>
  );
}
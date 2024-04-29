import "@/styles/global.css";
import type { Metadata } from "next";
import { UiProvider } from "@/components/layout/ui-provider";

export const metadata: Metadata = {
  title: {
    template: "%s | NABIC",
    default: "NABIC"
  },
  description: "서비스 설명",
};

export default function Layout({
  children, auth
}: {
  children: React.ReactNode; auth: React.ReactNode
}) {

  return (
    <html lang="ko">
      <body>
        <UiProvider>{children}</UiProvider>
      </body>
    </html>
  );
}
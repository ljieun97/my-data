import "@/styles/global.css";
import type { Metadata } from "next";
import { UiProvider } from "@/components/layout/ui-provider";
import { CookiesProvider } from 'next-client-cookies/server';

export const metadata: Metadata = {
  title: {
    template: "%s | TOVIE",
    default: "TOVIE"
  },
  description: "서비스 설명",
};

export default function Layout({
  children, modal
}: {
  children: React.ReactNode; modal: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <CookiesProvider>
          <UiProvider modal={modal}>{children}</UiProvider>
        </CookiesProvider>
      </body>
    </html>
  );
}
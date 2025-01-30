import "@/styles/global.css";
import type { Metadata } from "next";
import { UiProvider } from "@/components/layout/ui-provider";

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
        <UiProvider children={children} modal={modal}></UiProvider>
      </body>
    </html>
  );
}
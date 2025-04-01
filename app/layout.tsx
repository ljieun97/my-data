import "@/styles/global.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"
import { UiProvider } from "@/components/layout/ui-provider";
import { UserProvider } from "@/context/UserContext";
// import { CookiesProvider } from 'next-client-cookies/server';

const JWT_SECRET = process.env.JWT_SECRET!

export const metadata: Metadata = {
  title: {
    template: "%s | TOVIE",
    default: "TOVIE"
  },
  description: "서비스 설명",
};

export default async function Layout({
  children, modal
}: {
  children: React.ReactNode; modal: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = (await cookieStore).get("access_token")?.value
  let userId = null

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
      userId = decoded.id
    } catch (error) {
      console.error("Invalid Token:", error)
    }
  }

  return (
    <html lang="ko">
      <body>
      <UserProvider userId={userId}>
        {/* <CookiesProvider> */}
          <UiProvider modal={modal}>{children}</UiProvider>
        {/* </CookiesProvider> */}
        </UserProvider>
      </body>
    </html>
  );
}
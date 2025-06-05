import "@/styles/global.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"
import { UiProvider } from "@/components/layout/ui-provider";
import { UserProvider } from "@/context/UserContext";
import { closeMongo, connectMongo } from "@/lib/mongo/mongodb";

const JWT_SECRET = process.env.JWT_SECRET!
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY!

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
  let token = (await cookieStore).get("access_token")?.value
  let uid

  if (token) {
    let mongoClient
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
      uid = decoded.id
    } catch (error) {
      console.log("Access token expired. Trying refresh...");
    } try {
      // JWT가 만료된 경우
      const { client, db } = await connectMongo()
      mongoClient = client
      const decoded = jwt.decode(token) as jwt.JwtPayload
      const oauthId = decoded?.id
      const user = await db.collection("users").findOne({ oauth: oauthId })

      const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: KAKAO_REST_API_KEY,
          refresh_token: user?.refreshToken
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        token = jwt.sign(
          { id: oauthId, nickname: user?.nickname },
          process.env.NEXT_PUBLIC_JWT_SECRET!,
          { expiresIn: "7d" }
        );

        // 새 토큰 쿠키에 설정
        const baseUrl =
          process.env.NODE_ENV === "production"
            ? "https://today-movie.vercel.app"
            : "http://localhost:3000";

        await fetch(`${baseUrl}/api/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token}),
        })

        uid = oauthId;
      }
    } catch (e) {
      console.log(e)
    } finally {
      if (mongoClient) await closeMongo()
    }
  }

  return (
    <html lang="ko">
      <body>
        <UserProvider uid={uid}>
          <UiProvider modal={modal}>{children}</UiProvider>
        </UserProvider>
      </body>
    </html>
  );
}
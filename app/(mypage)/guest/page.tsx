
import GuestPage from "@/components/layout/guest-page";
import { cookies } from "next/headers";

export const metadata = {
  title: "게스트"
}

export default async function Page() {
  const cookieStore = cookies()
  let token = (await cookieStore).get("access_token")?.value

  if (token) {
    return <>로그인 된 상태입니다.</>
  }


  return (

    <GuestPage />
  )
} 
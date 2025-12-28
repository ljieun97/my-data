import AwardsTable from "@/components/awards/awards-table"

export const metadata = {
  title: "수상"
}



export default async function Page() {
  return <>
  <AwardsTable/>
  </>
}
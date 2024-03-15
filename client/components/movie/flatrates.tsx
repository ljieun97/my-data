"use client"

import { Avatar, Tooltip } from "@nextui-org/react";

export default function Flatrates({ list }: { list: any[] }) {
  return (
    <>
      {list?.map((flatrate: any) => (
        <div key={flatrate.provider_id}>
          <Tooltip content={flatrate.provider_name}>
            <Avatar
              radius="sm"
              src={`https://image.tmdb.org/t/p/w500/${flatrate.logo_path}`}
            />
          </Tooltip>
        </div>
      ))}
    </>
  )
}
'use client'

import { getProviders, getSearchList } from "@/lib/themoviedb/api";
import { Avatar, Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function Flatrates(props: any) {
  const [flatrates, setflatrates] = useState([])
  useEffect(() => {
    (async () => {
      const list = await getProviders(props.type, props.id)
      setflatrates(list)
    })()
  }, [])
  return (
    <>
      {flatrates && flatrates.map((flatrate: any) => (
        <div key={flatrate.provider_id}>
          {flatrate.provider_id != 1796 &&
            <Tooltip content={flatrate.provider_name}>
              <Avatar
                size="sm"
                radius="sm"
                src={`https://image.tmdb.org/t/p/w500/${flatrate.logo_path}`}
              />
            </Tooltip>
          }
        </div>
      ))}
    </>
  )
}
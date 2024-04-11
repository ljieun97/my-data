'use client'

import { getProviders } from "@/lib/themoviedb/api";
import { Avatar, Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function Flatrates({ type, provider }: { type: string, provider: any }) {
  const [flatrates, setFlatrates] = useState([])
  useEffect(() => {
    (async () => {
      if(type == 'movie' || type == 'tv') setFlatrates(await getProviders(type, provider))
    })()
  }, [provider])
  
  return (
    <>
      {(type == 'movie' || type == 'tv') && flatrates && flatrates.map((flatrate: any) => (
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
      {type == 'webtoon' &&
        <div>
          <Tooltip content={provider}>
            <Avatar
              size="sm"
              radius="sm"
              src={`/images/webtoon_${provider}.png`}
            />
          </Tooltip>
        </div>
      }
    </>
  )
}
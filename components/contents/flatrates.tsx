'use client'

import { getProviders } from "@/lib/open-api/tmdb-server"
import { Avatar, AvatarGroup, Tooltip } from "@heroui/react";
import { useEffect, useState } from "react";

export default function Flatrates({ type, provider }: { type: string, provider: any }) {
  const [flatrates, setFlatrates] = useState([])
  useEffect(() => {
    (async () => {
      if (type == 'movie' || type == 'tv') {
        const results = await getProviders(type, provider)
        setFlatrates(results?.flatrate)
      }
    })()
  }, [provider])

  return (
    <>
      <Tooltip content={flatrates?.map((e: any, index: number) => { return (<div key={index}>{e.provider_name}</div>) })}>
        <AvatarGroup max={2}>
          {(type == 'movie' || type == 'tv') && flatrates?.map((flatrate: any) => (
            // <>
            // {flatrate.provider_id != 1796 &&
            < Avatar
              key={flatrate.provider_id}
              size="sm"
              // radius="sm"
              src={`https://image.tmdb.org/t/p/w500/${flatrate.logo_path}`}
            />
            // }
            // </>
          ))}
        </AvatarGroup>
      </Tooltip>
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
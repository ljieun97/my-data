'use client'

import { Avatar, Tooltip } from "@nextui-org/react";

export default function Flatrates({ type, providers }: { type: string, providers: any }) {
  return (
    <>
      {type == 'webtoon' &&
        <div>
            <Tooltip content={providers}>
              <Avatar
                size="sm"
                radius="sm"
                src={`/images/webtoon_${providers}.png`}
              />
            </Tooltip>
        </div>
      }
      {(type == 'movie' || type == 'tv') && providers && providers.map((flatrate: any) => (
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
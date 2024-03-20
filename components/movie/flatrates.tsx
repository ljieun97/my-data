import { Avatar, Tooltip } from "@nextui-org/react";
import { getProviders } from "@/lib/themoviedb/api";

export default async function Flatrates(movie: any) {
  const flatrates = await getProviders(movie.type, movie.id)
  return (
    <>
      {flatrates && flatrates.map((flatrate: any) => (
        <div key={flatrate.provider_id}>
          <Tooltip content={flatrate.provider_name}>
            <Avatar
              size="sm"
              radius="sm"
              src={`https://image.tmdb.org/t/p/w500/${flatrate.logo_path}`}
            />
          </Tooltip>
        </div>
      ))}
    </>
  )
}
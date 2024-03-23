import { Avatar, Tooltip } from "@nextui-org/react";

export default async function Flatrates(props: any) {
  const flatrates = props.providers
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
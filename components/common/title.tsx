"use client"

import { Spacer } from "@nextui-org/react"

const Title = (props: any) => {
  return (
    <div className="">
      <Spacer y={12} />
      <span className="font-bold text-xl">{props.title}</span>
      <span className="text-default-400 pl-2">{props.sub}</span>
      {/* <Spacer y={4} /> */}
    </div>
  )
}

export default Title
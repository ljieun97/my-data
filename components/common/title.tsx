"use client"

import { Spacer } from "@heroui/react"

const Title = ({title, sub} : {title: string, sub: any}) => {
  return (
    <div className="">
      <Spacer y={12} />
      <span className="font-bold text-xl">{title}</span>
      <span className="text-default-400 pl-2">{sub}</span>
      {/* <Spacer y={4} /> */}
    </div>
  )
}

export default Title
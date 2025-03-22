'use client'

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
  Button,
} from "@heroui/react"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TooltipDetail } from "./tooltip-detail";

export const PopupList = ({ type, list }: { type: string, list: [] }) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover placement="right-start" radius="sm" color="foreground"
      classNames={{
        content: ["cursor-pointer underline decoration-indigo-500"]
      }}
      isOpen={isOpen}
      onOpenChange={(open)=>setIsOpen(open)}
      onClose={() => setIsOpen(false)}
    >
      <PopoverTrigger>
        <Button variant="flat" isDisabled={!list.length}>{list?.length}</Button>
      </PopoverTrigger>
      <PopoverContent>
        {list.map((e: any) => (
          <div key={e.id} className="w-full">
            <Tooltip placement="right-start" color="foreground" closeDelay={100} className="p-2 w-[308px]" content={<TooltipDetail id={e.id} type={type} />}>
              <div onClick={() => {
                setIsOpen(false)
                router.push(`/${type}/${e.id}`)
              }}>{e.title}</div>
            </Tooltip>
          </div>
        ))}
      </PopoverContent>
    </Popover >
  )
}
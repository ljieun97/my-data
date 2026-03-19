"use client"

import { Select, SelectItem } from "@heroui/react"

export default function SelectFilter(props: any) {
  const { items, type, onChangeSelect } = props
  return (
    <Select
      items={items}
      label={type}
      placeholder="All"
      className="w-full"
      classNames={{
        trigger: "min-h-14 rounded-[18px] border border-white/70 bg-white/78 px-3 shadow-[0_12px_28px_rgba(148,163,184,0.14)]",
        label: "text-slate-500",
        value: "text-slate-900",
        popoverContent: "rounded-[20px] border border-slate-200 bg-white/96 backdrop-blur-xl",
      }}
      onChange={(e) => onChangeSelect(e, type)}
      showScrollIndicators={false}
    >
      {(item: any) =>
        <SelectItem key={item.value}>
          {item.label}
        </SelectItem>
      }
    </Select>
  )
}

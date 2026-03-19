"use client"

import { Select, SelectItem } from "@heroui/react"

export default function SelectFilter(props: any) {
  const { items, type, onChangeSelect } = props
  return (
    <Select
      items={items}
      label={type}
      placeholder="All"
      className="browse-chip-select w-auto min-w-[8.5rem]"
      classNames={{
        base: "max-w-full",
        trigger: "browse-select min-h-[2.9rem] rounded-full border px-3 pr-4 shadow-none transition",
        innerWrapper: "gap-2",
        label: "browse-select__label text-[11px] font-semibold uppercase tracking-[0.16em]",
        value: "browse-select__value text-sm font-medium",
        popoverContent: "browse-select__popover rounded-[20px] border backdrop-blur-xl",
        listboxWrapper: "max-h-72",
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

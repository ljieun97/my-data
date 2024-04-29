"use client"

import { Select, SelectItem } from "@nextui-org/react"

export default function SelectFilter(props: any) {
  const { items, type, onChangeSelect } = props
  return (
    <Select
      items={items}
      label={type}
      placeholder="전체"
      className="max-w-xs"
      onChange={(e) => onChangeSelect(e, type)}
      showScrollIndicators={false}
    >
      {(item: any) =>
        <SelectItem key={item.value} value={item.value}>
          {item.label}
        </SelectItem>
      }
    </Select>
  )
}
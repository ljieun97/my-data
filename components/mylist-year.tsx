'use client'

import { SetStateAction, useEffect, useState } from "react"
import { Switch, Accordion, AccordionItem, Select, SelectItem, addToast, Image } from "@heroui/react"
import Title from "./common/title"
import CardCol from "@/components/contents/card-col"
import { useUser } from "@/context/UserContext"
import { useRouter } from "next/navigation";
import { FastAverageColor } from 'fast-average-color';

export default function MylistYear({ year, list, counts }: { year: any, list: any[], counts: any[] }) {
  const router = useRouter()

  const [currentList, setCurrentList] = useState(list) as any[]
  const [isSelectedProvider, setIsSelectedProvider] = useState(false)
  const [isSelectedRainbow, setIsSelectedRainbow] = useState(false)
  const { uid } = useUser()

  const gridSettings = [
    { key: "grid-cols-6", label: "세로6" },
    { key: "grid-cols-7", label: "세로7" },
    { key: "grid-cols-8", label: "세로8" },
    { key: "grid-cols-9", label: "세로9" },
    { key: "grid-cols-10", label: "세로10" },
    { key: "grid-cols-11", label: "세로11" },
    { key: "grid-cols-12", label: "세로12" },
    { key: "grid-flow-col grid-rows-1", label: "가로1" },
    { key: "grid-flow-col grid-rows-2", label: "가로2" },
    { key: "grid-flow-col grid-rows-3", label: "가로3" },
    { key: "grid-flow-col grid-rows-4", label: "가로4" },
    { key: "grid-flow-col grid-rows-5", label: "가로5" },
    { key: "grid-flow-col grid-rows-6", label: "가로6" },
    { key: "grid-flow-col grid-rows-7", label: "가로7" },
  ]
  const [selectGrid, setSelectGrid] = useState("grid-cols-12")
  const handleSelectionChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSelectGrid(e.target.value);
  }
  const deleteItem = (cid: string) => {
    setCurrentList(list.filter(item => item._id !== cid))
  }

  const handleDelete = async (cid: string) => {
    if (!uid) return
    const res = await fetch(`/api/mypage/content/${cid}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': uid,
      },
    })

    if (res.ok) {
      deleteItem(cid)
      addToast({
        title: "삭제 되었습니다",
      })
    }
  }

  const fac = new FastAverageColor()
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [h * 360, s, l]; // Hue를 0-360 범위로 반환
  };
  const handleSelectionRainbow = async (isSelected: boolean) => {
    if (isSelected) {
      setIsSelectedRainbow(true)
      const colors = await Promise.all(
        currentList.map(async (item: any) => {
          const { value } = await fac.getColorAsync(`/api/proxy?url=${encodeURIComponent('https://image.tmdb.org/t/p/w500' + item.poster_path)}`)
          const [r, g, b] = value
          const [h] = rgbToHsl(Number(r), Number(g), Number(b))
          return { item, h }
        }))
      const sorted = colors.sort((a, b) => a.h - b.h)
      setCurrentList(sorted.map((e: any) => e.item))
    } else {
      setIsSelectedRainbow(false)
      setCurrentList(list)
    }
  }

  return (
    <>
      <Title title="마이페이지" sub="" />
      <div className="flex justify-end pb-2 gap-1">
        <Switch isDisabled={!uid?true:false} size="sm" isSelected={isSelectedRainbow} onValueChange={(isSelected) => handleSelectionRainbow(isSelected)}>
          <span className="text-xs">무지개</span>
        </Switch>
        <Switch isDisabled={!uid?true:false} size="sm" isSelected={isSelectedProvider} onValueChange={setIsSelectedProvider}>
          <span className="text-xs">제공사</span>
        </Switch>
        <Select
          className="max-w-xs"
          label=""
          placeholder="정렬 선택"
          labelPlacement="outside-left"
          size="sm"
          variant="bordered"
          items={gridSettings}
          selectedKeys={[selectGrid]}
          onChange={handleSelectionChange}
        >
          {(gridSettings: { label: string }) => <SelectItem>{gridSettings.label}</SelectItem>}
        </Select>
        <Select
          className="max-w-xs"
          label=""
          placeholder="연도 선택"
          variant="bordered"
          size="sm"
          labelPlacement="outside-left"
          selectedKeys={[year]}
          onChange={(e) => router.push(`/mypage/${e.target.value}`)}
        >
          {counts.map((count) => (
            <SelectItem key={count._id} title={`${count._id}년도 (${count.count}개)`} textValue={year}>{count._id}</SelectItem>
          ))}
        </Select>

      </div>

      <div className="overflow-auto border-2 rounded-md px-2" style={{ height: "calc(100% - 12px)" }}>
        {currentList.length == 0 && list.length==0 && <>시청내역이 비어있습니다.</>}

        {uid ?
          <div className={`py-2 grid gap-1 ${selectGrid}`}>
            {currentList.map((content: any, index: number) => (
              <CardCol key={content.title} thisYear={year} content={content} isProvider={isSelectedProvider} onUpdate={deleteItem} onDelete={handleDelete}></CardCol>
            ))}
          </div>
          :
          <div className={`py-2 grid gap-1 ${selectGrid}`}>
            {list.map((e: any, index: number) => (
              <Image
                alt="sorted posters"
                key={index}
                radius="sm"
                src={`https://image.tmdb.org/t/p/w500${e}`}
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        }
      </div>
    </>
  )
}
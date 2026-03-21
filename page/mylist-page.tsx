"use client"

import { SetStateAction, useEffect, useState } from "react"
import { Button, ButtonGroup, Switch, Select, SelectItem, addToast, Image } from "@heroui/react"
import Title from "../components/common/title"
import CardCol from "@/components/contents/card-col"
import SavedListRow from "@/components/contents/saved-list-row"
import { useUser } from "@/context/UserContext"
import { useRouter } from "next/navigation";
import { FastAverageColor } from 'fast-average-color';

type ViewMode = "poster" | "list" | "stats"

export default function MylistPage({ year, counts }: { year: any, counts: any[] }) {
  const router = useRouter()
  const itemsPerPage = 10

  const [baseList, setBaseList] = useState([]) as any[]
  const [currentList, setCurrentList] = useState([]) as any[]
  const [isSelectedProvider, setIsSelectedProvider] = useState(false)
  const [isSelectedRainbow, setIsSelectedRainbow] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
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
  const [viewMode, setViewMode] = useState<ViewMode>("poster")
  const handleSelectionChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSelectGrid(e.target.value);
  }

  const refreshListPageAfterRemoval = (currentPageSize: number) => {
    const nextPage = currentPageSize === 1 && currentPage > 1 ? currentPage - 1 : currentPage
    setTotalItems((prev) => Math.max(prev - 1, 0))

    if (nextPage !== currentPage) {
      setCurrentPage(nextPage)
    } else {
      fetchListPage(nextPage)
    }
  }

  const fetchPosterList = async () => {
    const res = await fetch(`/api/mypage/content/by-year/${year}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": uid || "",
      },
    })

    if (!res.ok) return

    const items = await res.json()
    setBaseList(items)
    setCurrentList(items)
    setTotalItems(items.length)
  }

  const fetchListPage = async (page: number) => {
    const res = await fetch(`/api/mypage/content/by-year/${year}?page=${page}&limit=${itemsPerPage}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": uid || "",
      },
    })

    if (!res.ok) return

    const data = await res.json()
    setCurrentList(data.items || [])
    setTotalItems(data.totalCount || 0)
  }

  const removeItemFromView = (cid: string) => {
    if (viewMode === "poster") {
      setBaseList((prev: any[]) => prev.filter((item) => item._id !== cid))
      setCurrentList((prev: any[]) => prev.filter((item) => item._id !== cid))
      setTotalItems((prev) => Math.max(prev - 1, 0))
    } else {
      refreshListPageAfterRemoval(currentList.length)
    }
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
      removeItemFromView(cid)
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
        baseList.map(async (item: any) => {
          const { value } = await fac.getColorAsync(`/api/proxy?url=${encodeURIComponent('https://image.tmdb.org/t/p/w500' + item.poster_path)}`)
          const [r, g, b] = value
          const [h] = rgbToHsl(Number(r), Number(g), Number(b))
          return { item, h }
        }))
      const sorted = colors.sort((a, b) => a.h - b.h)
      setCurrentList(sorted.map((e: any) => e.item))
    } else {
      setIsSelectedRainbow(false)
      setCurrentList(baseList)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const movieCount = baseList.filter((item: any) => item.type === "movie").length
  const tvCount = baseList.filter((item: any) => item.type === "tv").length
  const savedDates = baseList.map((item: any) => item.user_date).filter(Boolean).sort()
  const latestSaved = savedDates.length ? savedDates[savedDates.length - 1] : "-"
  const firstSaved = savedDates.length ? savedDates[0] : "-"
  const genreCounts = baseList.reduce((acc: Record<string, number>, item: any) => {
    if (!Array.isArray(item.genre_ids)) return acc
    item.genre_ids.forEach((genreId: number) => {
      const key = String(genreId)
      acc[key] = (acc[key] || 0) + 1
    })
    return acc
  }, {})
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const monthlyCounts = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0")
    const count = baseList.filter((item: any) => item.user_date?.slice(5, 7) === month).length
    return {
      month: `${index + 1}월`,
      count,
    }
  })
  const maxMonthlyCount = Math.max(...monthlyCounts.map((item) => item.count), 1)

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  useEffect(() => {
    if (viewMode === "list") setCurrentPage(1)
  }, [viewMode, year])

  useEffect(() => {
    if (!uid || (viewMode !== "poster" && viewMode !== "stats")) return

    fetchPosterList()
  }, [uid, year, viewMode])

  useEffect(() => {
    if (!uid || viewMode !== "list") return

    fetchListPage(currentPage)
  }, [uid, year, viewMode, currentPage])

  useEffect(() => {
    if (viewMode !== "poster" && isSelectedRainbow) {
      setIsSelectedRainbow(false)
    }
  }, [viewMode, isSelectedRainbow])

  return (
    <>
      <Title title="마이페이지" sub="" />
      <div className="flex flex-wrap justify-end pb-2 gap-1">
        <Switch isDisabled={!uid || viewMode !== "poster"} size="sm" isSelected={isSelectedRainbow} onValueChange={(isSelected) => handleSelectionRainbow(isSelected)}>
          <span className="text-xs">무지개</span>
        </Switch>
        <Switch isDisabled={!uid?true:false} size="sm" isSelected={isSelectedProvider} onValueChange={setIsSelectedProvider}>
          <span className="text-xs">제공사</span>
        </Switch>
        <ButtonGroup size="sm" variant="bordered">
          <Button color={viewMode === "poster" ? "primary" : "default"} variant={viewMode === "poster" ? "solid" : "bordered"} onPress={() => setViewMode("poster")}>
            포스터
          </Button>
          <Button color={viewMode === "list" ? "primary" : "default"} variant={viewMode === "list" ? "solid" : "bordered"} isDisabled={!uid} onPress={() => setViewMode("list")}>
            리스트
          </Button>
          <Button color={viewMode === "stats" ? "primary" : "default"} variant={viewMode === "stats" ? "solid" : "bordered"} isDisabled={!uid} onPress={() => setViewMode("stats")}>
            통계
          </Button>
        </ButtonGroup>
        {viewMode === "poster" && (
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
        )}
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

      <div>
        {((viewMode === "list" && totalItems === 0) || ((viewMode === "poster" || viewMode === "stats") && baseList.length === 0)) && <>시청내역이 비어있습니다.</>}

        {uid ?
          viewMode === "list" ? (
            <div className="flex flex-col gap-3 py-3">
              {currentList.map((content: any) => (
                <SavedListRow
                  key={content._id}
                  thisYear={year}
                  content={content}
                  isProvider={isSelectedProvider}
                  onUpdate={removeItemFromView}
                  onDelete={handleDelete}
                />
              ))}
              {totalItems > itemsPerPage && (
                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200/70 pt-3 dark:border-slate-700/70">
                  <Button size="sm" variant="bordered" isDisabled={currentPage === 1} onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}>
                    이전
                  </Button>
                  <span className="browse-card__meta text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <Button size="sm" variant="bordered" isDisabled={currentPage === totalPages} onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}>
                    다음
                  </Button>
                </div>
              )}
            </div>
          ) : viewMode === "stats" ? (
            <div className="grid gap-4 py-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="browse-card rounded-[24px] border p-4">
                  <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Total Saved</p>
                  <p className="browse-card__title mt-3 text-3xl font-semibold">{totalItems}</p>
                </div>
                <div className="browse-card rounded-[24px] border p-4">
                  <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Movies</p>
                  <p className="browse-card__title mt-3 text-3xl font-semibold">{movieCount}</p>
                </div>
                <div className="browse-card rounded-[24px] border p-4">
                  <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">TV Series</p>
                  <p className="browse-card__title mt-3 text-3xl font-semibold">{tvCount}</p>
                </div>
                <div className="browse-card rounded-[24px] border p-4">
                  <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Top Genres</p>
                  <p className="browse-card__title mt-3 text-3xl font-semibold">{topGenres.length}</p>
                </div>
              </div>

              <div className="browse-card rounded-[24px] border p-4">
                <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Saved Range</p>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="browse-card__meta">첫 저장일</span>
                    <span className="browse-card__title text-base font-semibold">{firstSaved}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="browse-card__meta">최근 저장일</span>
                    <span className="browse-card__title text-base font-semibold">{latestSaved}</span>
                  </div>
                </div>
              </div>

              <div className="browse-card rounded-[24px] border p-4">
                <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Monthly Activity</p>
                <div className="mt-4 flex flex-col gap-3">
                  {monthlyCounts.map((item) => (
                    <div key={item.month} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3">
                      <span className="browse-card__meta text-sm">{item.month}</span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                        <div
                          className="h-full rounded-full bg-slate-900 dark:bg-slate-100"
                          style={{ width: `${(item.count / maxMonthlyCount) * 100}%` }}
                        />
                      </div>
                      <span className="browse-card__title text-right text-sm font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="browse-card rounded-[24px] border p-4">
                <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Genre Frequency</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {topGenres.length > 0 ? topGenres.map(([genreId, count]) => (
                    <span key={genreId} className="browse-card__stat rounded-full px-3 py-1.5 text-sm font-medium">
                      Genre {genreId} · {count}
                    </span>
                  )) : (
                    <span className="browse-card__meta text-sm">장르 데이터가 없습니다.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`py-2 grid gap-1 ${selectGrid}`}>
              {currentList.map((content: any) => (
                <CardCol key={content._id} thisYear={year} content={content} isProvider={isSelectedProvider} onUpdate={removeItemFromView} onDelete={handleDelete}></CardCol>
              ))}
            </div>
          )
          :
          <div className={`py-2 grid gap-1 ${selectGrid}`}>
            {currentList.map((e: any, index: number) => (
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

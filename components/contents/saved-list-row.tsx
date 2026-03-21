"use client"

import Flatrates from "./flatrates"
import Image from "next/image";
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  useDisclosure,
  DatePicker,
  addToast,
} from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleInfo, faPen } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { getPosters } from "@/lib/open-api/tmdb-client";
import { parseDate } from "@internationalized/date";

const genreLabels: Record<number, string> = {
  16: "애니메이션",
  18: "드라마",
  27: "공포",
  28: "액션",
  35: "코미디",
  36: "역사",
  37: "서부",
  53: "스릴러",
  80: "범죄",
  99: "다큐멘터리",
  878: "SF",
  9648: "미스터리",
  10402: "음악",
  10749: "로맨스",
  10751: "가족",
  10752: "전쟁",
  10759: "액션·어드벤처",
  10762: "키즈",
  10763: "뉴스",
  10764: "리얼리티",
  10765: "SF·판타지",
  10766: "소프",
  10767: "토크",
  10768: "전쟁·정치",
  10770: "TV 영화",
  12: "모험",
  14: "판타지",
}

export default function SavedListRow({
  thisYear,
  content,
  isProvider,
  onUpdate,
  onDelete,
}: {
  thisYear: string,
  content: any,
  isProvider: boolean,
  onUpdate: any,
  onDelete: any,
}) {
  const { uid } = useUser()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isOpenPopover, setIsOpenPopover] = useState(false)
  const [date, setDate] = useState<any>(parseDate(content.user_date))
  const [posters, setPosters] = useState([])
  const [selectPoster, setSelectPoster] = useState(content.poster_path) as any
  const [posterImg, setPosterImg] = useState(`https://image.tmdb.org/t/p/w500${content.poster_path}`)

  const typeLabel = content.type === "movie" ? "영화" : content.type === "tv" ? "TV" : content.type
  const releaseDate = content.release_date || content.first_air_date || "-"
  const genres = Array.isArray(content.genre_ids)
    ? content.genre_ids.map((genreId: number) => genreLabels[genreId] || `Genre ${genreId}`)
    : []

  const handleOpen = async (type: string, id: string) => {
    setIsOpenPopover(false)
    setPosters(await getPosters(type, id))
    onOpen()
  }

  const handleSubmit = async () => {
    const res = await fetch(`/api/mypage/content/${content._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ uid, poster_path: selectPoster, date: date?.toString() })
    })
    onClose()

    if (res.ok) {
      if (thisYear != date?.year) {
        onUpdate(content._id)
      } else {
        setPosterImg(`https://image.tmdb.org/t/p/w500/${selectPoster}`)
      }
      addToast({
        title: "수정 되었습니다",
      })
    }
  }

  const handleDateChange = (newDate: any) => {
    if (newDate) setDate(newDate)
    else setDate(content.user_date)
  }

  const goDetailpage = () => {
    router.push(`/${content.type}/${content.id}`)
  }

  return (
    <>
      <Card
        isBlurred={false}
        className="browse-card overflow-hidden rounded-[24px] border shadow-none"
      >
        <CardBody className="p-0">
          <div className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4">
            <div className="relative h-[7rem] w-[4.8rem] shrink-0 overflow-hidden rounded-[18px] bg-slate-200/70 shadow-[0_12px_24px_rgba(15,23,42,0.16)]">
              <Image
                fill
                alt={`${content.title} poster`}
                src={posterImg}
                className="object-cover"
                sizes="120px"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="browse-card__title line-clamp-2 text-base font-semibold leading-6 tracking-[-0.03em]">
                    {content.title}
                  </h3>
                  <div className="browse-card__meta mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    <span>{typeLabel}</span>
                    <span>관람일 {content.user_date || "-"}</span>
                    <span>개봉일 {releaseDate}</span>
                  </div>
                </div>

                {isProvider && (
                  <div className="shrink-0">
                    <Flatrates type={content.type} provider={content.id} />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span key={genre} className="browse-card__stat rounded-full px-2.5 py-1 text-[11px] font-medium">
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Popover isOpen={isOpenPopover} onOpenChange={(open) => setIsOpenPopover(open)} placement="bottom-end">
                    <PopoverTrigger>
                      <Button isIconOnly radius="full" variant="flat" size="sm" className="browse-card__action">
                        <FontAwesomeIcon icon={faPen} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="flex flex-col">
                        <Button size="sm" variant="flat" onPress={() => handleOpen(content.type, content.id)}>수정</Button>
                        <Button size="sm" color="danger" variant="flat" onPress={() => {
                          setIsOpenPopover(false)
                          onDelete(content._id)
                        }}>삭제</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button isIconOnly radius="full" variant="flat" size="sm" className="browse-card__detail" onPress={goDetailpage}>
                    <FontAwesomeIcon icon={faCircleInfo} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        onClose={onClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                수정하기
              </ModalHeader>
              <ModalBody>
                <h2>날짜</h2>
                <DatePicker showMonthAndYearPickers label="Viewing date" value={date} onChange={handleDateChange} />
                <h2>사진 ({posters.length})</h2>
                <RadioGroup
                  value={selectPoster}
                  onValueChange={setSelectPoster}
                  classNames={{
                    wrapper: "grid gap-1 grid-cols-4"
                  }}>
                  {posters?.map((e: any, index: number) => (
                    <Radio
                      key={index}
                      value={e.file_path}
                      classNames={{
                        base: "m-0 p-1 hover:bg-content2 cursor-pointer rounded-lg border-2 border-transparent data-[selected=true]:border-primary",
                        wrapper: "hidden",
                        labelWrapper: "m-0 h-full",
                        label: "h-full"
                      }}
                    >
                      <img
                        alt="choice search posters"
                        src={"https://image.tmdb.org/t/p/w500" + e.file_path}
                        className="w-full h-full object-cover"
                      />
                    </Radio>
                  ))}
                </RadioGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={handleSubmit}>
                  완료
                </Button>
                <Button color="danger" variant="light" onPress={onClose}>
                  닫기
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

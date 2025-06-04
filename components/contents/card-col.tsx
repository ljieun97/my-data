"use client"

import Flatrates from "./flatrates"
import Image from "next/image";
import {
  Card, CardFooter, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Skeleton, Popover, PopoverTrigger, PopoverContent,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Radio,
  useDisclosure,
  DatePicker,
  addToast,
} from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faCircleInfo, faPlus, faPen } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { getPosters } from "@/lib/themoviedb/tmdb-client";
import { CalendarDate, DateValue, parseDate, today } from "@internationalized/date";

export default function CardCol({ thisYear, content, isProvider, onUpdate, onDelete }: { thisYear: string, content: any, isProvider: boolean, onUpdate: any, onDelete: any }) {
  const { uid } = useUser()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isOpenPopover, setIsOpenPopover] = useState(false)
  const [date, setDate] = useState<any>(parseDate(content.user_date))
  const [posters, setPosters] = useState([])
  const [selectPoster, setSelectPoster] = useState(content.poster_path) as any
  const [posterImg, setPosterImg] = useState(`https://image.tmdb.org/t/p/w500${content.poster_path}`)

  let type = ''
  let id = ''
  let img = ''
  let adult = false

  if (content.title) {
    type = 'movie'
    adult = content.adult
    id = content.id
  } else if (content.name) {
    type = 'tv'
    adult = content.adult
    id = content.id
  }
  // if (content.backdrop_path) img = `https://image.tmdb.org/t/p/w500/${content.backdrop_path}`
  // else img = '/images/no-image.jpg'
  if (content.poster_path) img = `https://image.tmdb.org/t/p/w500/${content.poster_path}`
  else img = '/images/no-image.jpg'

  const handleOpen = async (type: string, id: string) => {
    setIsOpenPopover(false)
    setPosters(await getPosters(type, id))
    onOpen()
  }

  const handleSubmit = async () => {
    const res = await fetch(`/api/mypage/content/${content._id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uid: uid, poster_path: selectPoster, date: date?.toString() })
    })
    onClose()

    if (res.ok) {
      if (thisYear != date?.year) { //다른연도로 이동
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
    router.push(`/${type}/${id}`)
  }

  return (
    <>
      <Card
        radius="sm"
        className="relative group/footer aspect-[26/37]"
        isFooterBlurred
        isBlurred
        shadow="none"
      >
        <Image
          fill
          alt="poster"
          src={posterImg}
          className="object-cover"
          sizes="100%"
          priority
        />
        {isProvider &&
          <CardHeader className="p-1 absolute justify-end z-20">
            <div className="flex gap-2">
              <Flatrates type={content.type} provider={content.id} />
            </div>
          </CardHeader>
        }
        <CardFooter className="invisible absolute group-hover/footer:visible bg-black/25 border-white/0 border-1 rounded-small shadow-small z-10 h-full w-full">
          <div className="w-full flex justify-center gap-2">
            <Popover isOpen={isOpenPopover} onOpenChange={(open) => setIsOpenPopover(open)} placement="bottom-start">
              <PopoverTrigger>
                <Button isIconOnly size="sm" variant="faded"><FontAwesomeIcon icon={faPen} /></Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col">
                  <Button size="sm" variant="flat" onPress={() => handleOpen(content.type, content.id)}>수정</Button>
                  <Button size="sm" color="danger" variant="flat" onPress={() => {
                    setIsOpenPopover(false)
                    onDelete(thisYear, content._id)
                  }}>삭제</Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button isIconOnly size="sm" variant="faded" onPress={() => goDetailpage()}><FontAwesomeIcon icon={faCircleInfo} /></Button>
          </div>
        </CardFooter>
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
                <Button color="primary" onPress={() => handleSubmit()}>
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
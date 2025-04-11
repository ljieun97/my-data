"use client"

import Flatrates from "./flatrates"
import {
  Card, CardFooter, Image, CardHeader, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Skeleton, Popover, PopoverTrigger, PopoverContent,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Radio,
  useDisclosure,
} from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFaceLaughSquint, faFaceFrownOpen, faFaceSmileBeam, faEllipsisVertical, faCircleInfo, faPlus, faPen } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation";
import { CreateMovie } from "@/lib/mongo/movie";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { getPosters } from "@/lib/themoviedb/tmdb";

export default function CardCol({ content, isProvider, onDelete }: { content: any, isProvider: boolean, onDelete: any }) {
  const { uid } = useUser()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isOpenPopover, setIsOpenPopover] = useState(false)
  const [posters, setPosters] = useState([])
  const [selectPoster, setSelectPoster] = useState() as any
  const [posterImg, setPosterImg] = useState(`https://image.tmdb.org/t/p/w500/${content.poster_path}`)

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

  const handleSubmit = async (poster_path: string) => {
    await fetch(`/api/user/${uid}/content/${content._id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ poster_path })
    })
    setPosterImg(`https://image.tmdb.org/t/p/w500/${poster_path}`)
    onClose()
  }

  const goDetailpage = () => {
    router.push(`/${type}/${id}`)
  }

  return (
    <>
      <Card
        radius="sm"
        className="group/footer w-full aspect-[26/37]"
        isFooterBlurred
        isBlurred
        shadow="none"
      >
        <Image
          radius="sm"
          alt="poster"
          src={posterImg}
          fallbackSrc={<Skeleton className="w-full h-full rounded-sm"></Skeleton>}
          className="w-full h-full object-cover"
        />
        {isProvider &&
          <CardHeader className="absolute justify-end z-20">
            <div className="flex gap-2">
              <Flatrates type={type} provider={content.id} />
            </div>
          </CardHeader>
        }
        <CardFooter className="invisible absolute group-hover/footer:visible bg-black/25 border-white/0 border-1 rounded-small shadow-small z-10 h-full w-full">
          <div className="w-full flex justify-center gap-2">
            {/* <Button isIconOnly size="sm" variant="faded" onPress={() => clickCreate(content, 1)}><FontAwesomeIcon icon={faPlus} /></Button> */}
            <Popover isOpen={isOpenPopover} onOpenChange={(open) => setIsOpenPopover(open)} placement="top">
              <PopoverTrigger>
                <Button isIconOnly size="sm" variant="faded"><FontAwesomeIcon icon={faPen} /></Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex gap-2">
                  {/* <Button size="sm" variant="flat">날짜</Button> */}
                  <Button size="sm" variant="flat" onPress={() => handleOpen(content.type, content.id)}>사진</Button>
                  <Button size="sm" color="danger" variant="flat" onPress={() => {
                    setIsOpenPopover(false)
                    onDelete(content._id)
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
                포스터 ({posters.length})
              </ModalHeader>
              <ModalBody>
                <RadioGroup
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
                <Button color="primary" onPress={() => handleSubmit(selectPoster)}>
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
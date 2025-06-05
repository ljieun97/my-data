"use client"

import { usePathname, useRouter } from "next/navigation";
import SearchInput from "./search-input";
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu,
  DropdownItem, DropdownTrigger, Dropdown, DropdownMenu,
  Avatar, Button, Link, Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
  RadioGroup,
  Radio
} from "@heroui/react";
import { useState } from "react"
import { useUser } from "@/context/UserContext";

export default function TopBar() {
  const { uid } = useUser()
  const path = usePathname()
  const [isScroll, setIsScroll] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isOpen: isOpenSet, onOpen: onOpenSet, onOpenChange: onOpenChangeSet } = useDisclosure()
  const [selectedSet, setSelectedSet] = useState("release");

  const onChangeScroll = () => {
    if (window.scrollY < 30) setIsScroll(false)
    else setIsScroll(true)
  }
  const clickKakaoLogin = () => {
    window.location.href = "/api/oauth/login"
  }
  const clickLogout = async () => {
    const response = await fetch('/api/oauth/logout', {
      method: 'POST',
      credentials: 'include',  // 쿠키 포함
    })
    if (response.ok) {
      console.log('Logged out successfully');
      // 로그아웃 후 페이지 리디렉션 또는 상태 업데이트
      window.location.href = '/';  // 홈으로 리디렉션 예시
    } else {
      console.error('Failed to log out');
    }
  }

  const handleOpenSet = () => {
    const isTodaySave = localStorage.getItem("set_isTodaySave")
    setSelectedSet(isTodaySave == "true" ? "today" : "release")
    onOpenSet()
  };

  const handleChangeSet = (value: string) => {
    setSelectedSet(value)
    localStorage.setItem("set_isTodaySave", value == "today" ? "true" : "false")
  }

  return (
    <>
      <Navbar
        isBlurred={false}
        classNames={{
          base: `fixed ${path === "/" ? (isScroll ? "bg-opacity-100" : "bg-opacity-0") : "bg-[#dfe6e9]"}`,
          wrapper: "max-w-7xl"
        }}
        onScrollPositionChange={() => { if (path === "/") onChangeScroll() }}
      >
        <NavbarContent justify="start">
          <NavbarMenuToggle
            className="sm:hidden"
          />
          <NavbarMenu className="bg-white/80">
            <NavbarItem isActive={path === "/"}>
              <Link href="/" color="foreground" >
                홈
              </Link>
            </NavbarItem>
            <NavbarItem isActive={path === "/calendar"}>
              <Link href="/calendar" color="foreground">
                캘린더
              </Link>
            </NavbarItem>
            <NavbarItem isActive={path === "/movie"}>
              <Link href="/movie" color="foreground">
                영화
              </Link>
            </NavbarItem>
            <NavbarItem isActive={path === "/tv"}>
              <Link href="/tv" color="foreground">
                시리즈
              </Link>
            </NavbarItem>
            <NavbarItem isActive={path === "/guest"}>
              <Link href="/mypage" color="foreground">
                체험
              </Link>
            </NavbarItem>
          </NavbarMenu>
          <NavbarBrand>
            {/* <AcmeLogo /> */}
            <p className="hidden sm:block font-bold text-inherit">
              <Link href="/" style={{ color: `${path === "/" && !isScroll ? "#ffffffb3" : "#747474"}` }} >
                TOVIE
              </Link>
            </p>
          </NavbarBrand>
          <NavbarContent className="hidden sm:flex gap-5">
            <NavbarItem isActive={path === "/"}>
              <Link href="/" style={{ color: `${path === "/" && !isScroll ? "#ffffffb3" : "#747474"}` }} >
                홈
              </Link>
            </NavbarItem>
            <NavbarItem isActive={path === "/calendar"}>
              <Link href="/calendar" style={{ color: `${path === "/" && !isScroll ? "#ffffffb3" : "#747474"}` }} >
                캘린더
              </Link>
            </NavbarItem>
            <NavbarItem isActive={path === "/movie"}>
              <Link href="/movie" style={{ color: `${path === "/" && !isScroll ? "#ffffffb3" : "#747474"}` }} >
                영화
              </Link>
            </NavbarItem>
            <NavbarItem isActive={path === "/tv"}>
              <Link href="/tv" style={{ color: `${path === "/" && !isScroll ? "#ffffffb3" : "#747474"}` }} >
                시리즈
              </Link>
            </NavbarItem>
            <NavbarItem isActive={path === "/guest"}>
              <Link href="/guest" style={{ color: `${path === "/" && !isScroll ? "#ffffffb3" : "#747474"}` }} >
                체험
              </Link>
            </NavbarItem>
          </NavbarContent>
        </NavbarContent>

        <NavbarContent as="div" className="items-center" justify="end">
          <SearchInput></SearchInput>
          {!uid ?
            <Button
              onPress={onOpen}
              radius="sm" variant="bordered"
              style={{ color: `${path === "/" && !isScroll ? "#ffffffb3" : "#747474"}` }}
            >로그인
            </Button>
            :
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  size="sm"
                  as="button"
                  className="transition-transform"
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="mypage" href='/mypage/2025'>
                  마이페이지 이동
                </DropdownItem>
                <DropdownItem key="setting" onPress={() => handleOpenSet()}>
                  설정
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onPress={() => clickLogout()}>
                  로그아웃
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          }
        </NavbarContent>
      </Navbar>

      <Modal isOpen={isOpen} size="sm" placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">로그인</ModalHeader>
              <ModalBody className="py-4">
                <Button color="warning" onPress={() => clickKakaoLogin()}>카카오 로그인</Button>
                {/* <Button isDisabled color="warning">카카오 로그인</Button>
                    서버 사용량 부족으로 현재 수정 중인 기능입니다 😭 */}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenSet} size="sm" placement="center" onOpenChange={onOpenChangeSet}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">설정</ModalHeader>
              <ModalBody className="py-4">
                <RadioGroup orientation="horizontal" color="secondary" label="컨텐츠저장날짜" value={selectedSet} onValueChange={handleChangeSet}>
                  <Radio value="release">공개일</Radio>
                  <Radio value="today">오늘</Radio>
                </RadioGroup>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
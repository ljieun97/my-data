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
  Checkbox
} from "@heroui/react";
import { useState, useEffect } from "react"
import { useCookies } from "next-client-cookies"

export default function TopBar() {
  const router = useRouter()
  const path = usePathname()
  const [isLogin, setIsLogin] = useState(false)
  const [isScroll, setIsScroll] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    const checkToken = async () => {
      const response = await fetch('/api/user/isvaild', {
        method: 'GET',
        credentials: 'include', // 쿠키 포함하여 요청
      })
      if (response.ok) {
        console.log('Token is valid');
        setIsLogin(true)
      } else {
        console.log('Token is expired or invalid');
        setIsLogin(false)
      }
    }
    checkToken()
  }, [])

  const onChangeScroll = () => {
    if (window.scrollY < 30) setIsScroll(false)
    else setIsScroll(true)
  }
  const clickKakaoLogin = () => {
    window.location.href = "/api/user/login"
  }
  const clickLogout = async () => {
    const response = await fetch('/api/user/logout', {
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

  return (
    <>
      <Navbar
        isBlurred={false}
        classNames={{
          base: `fixed ${isScroll ? "bg-opacity-100" : "bg-opacity-0"}`,
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
            <NavbarItem isActive={path === "/user"}>
              <Link href="/user" color="foreground">
                유저
              </Link>
            </NavbarItem>
            <NavbarItem isActive={path === "/mypage"}>
              <Link href="/mypage" color="foreground">
                보관함
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
            <NavbarItem isActive={path === "/user"}>
              <Link href="/user" style={{ color: `${path === "/" && !isScroll ? "#ffffffb3" : "#747474"}` }} >
                유저
              </Link>
            </NavbarItem>
            <NavbarItem isActive={path === "/mypage"}>
              <Link href="/mypage?type=movie" style={{ color: `${path === "/" && !isScroll ? "#ffffffb3" : "#747474"}` }} >
                보관함
              </Link>
            </NavbarItem>
          </NavbarContent>
        </NavbarContent>

        <NavbarContent as="div" className="items-center" justify="end">
          <SearchInput></SearchInput>
          {!isLogin ?
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
                  as="button"
                  className="transition-transform"
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">zoey@example.com</p>
                </DropdownItem>
                <DropdownItem key="settings">My Settings</DropdownItem>
                <DropdownItem key="team_settings">Team Settings</DropdownItem>
                <DropdownItem key="analytics">Analytics</DropdownItem>
                <DropdownItem key="system">System</DropdownItem>
                <DropdownItem key="configurations">Configurations</DropdownItem>
                <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
                <DropdownItem key="logout" color="danger" onPress={() => clickLogout()}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          }

          <Modal isOpen={isOpen} size="sm" placement="center" onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">로그인</ModalHeader>
                  <ModalBody className="py-4">
                    <Button color="warning" onPress={() => clickKakaoLogin()}>카카오 로그인</Button>
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
        </NavbarContent>
      </Navbar>
    </>
  )
}
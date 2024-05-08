"use client"

import { usePathname } from "next/navigation";
import SearchInput from "./search-input";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Input, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar, NavbarMenuToggle, NavbarMenu } from "@nextui-org/react";
import { useState } from "react";

export default function TopBar() {
  const path = usePathname()
  const [isScroll, setIsScroll] = useState(false)
  const onChangeScroll = () => {
    if (window.scrollY < 30) setIsScroll(false)
    else setIsScroll(true)
  }
  return (
    <>
      <Navbar
        isBlurred={isScroll}
        classNames={{
          base: `${isScroll ? "fixed drop-shadow" : "fixed bg-opacity drop-shadow"}`,
          wrapper: "max-w-7xl"
        }}
        onScrollPositionChange={() => onChangeScroll()}
      >
        <NavbarContent justify="start">
          <NavbarMenuToggle
            className="sm:hidden"
          />
          <NavbarMenu className="bg-white/50">
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
            <NavbarItem isActive={path === "/mypage"}>
              <Link href="/mypage" color="foreground">
                마이페이지
              </Link>
            </NavbarItem>
          </NavbarMenu>
          <NavbarBrand>
            {/* <AcmeLogo /> */}
            <p className="hidden sm:block font-bold text-inherit">
              <Link href="/" color="foreground" >
                오늘 뭐 볼까
              </Link>
            </p>
          </NavbarBrand>
          <NavbarContent className="hidden sm:flex gap-3">
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
            <NavbarItem isActive={path === "/mypage"}>
              <Link href="/mypage" color="foreground">
                마이페이지
              </Link>
            </NavbarItem>
          </NavbarContent>
        </NavbarContent>

        <NavbarContent as="div" className="items-center" justify="end">
          <SearchInput></SearchInput>

          {/* <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name="Jason Hughes"
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">준비중인 서비스입니다.</p>
                <p className="font-semibold">zoey@example.com</p>
              </DropdownItem>
              <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem key="team_settings">Team Settings</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem key="system">System</DropdownItem>
              <DropdownItem key="configurations">Configurations</DropdownItem>
              <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
              <DropdownItem key="logout" color="danger">
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown> */}
        </NavbarContent>
      </Navbar>
    </>
  )
}
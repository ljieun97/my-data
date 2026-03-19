"use client"

import { usePathname } from "next/navigation";
import SearchInput from "./search-input";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Button,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  RadioGroup,
  Radio,
} from "@heroui/react";
import { useState } from "react";
import { useUser } from "@/context/UserContext";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/awards", label: "Awards" },
  { href: "/movie", label: "Movies" },
  { href: "/tv", label: "Series" },
  { href: "/guest", label: "Guest" },
];

export default function TopBar() {
  const { uid } = useUser();
  const path = usePathname();
  const [isScroll, setIsScroll] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isOpenSet,
    onOpen: onOpenSet,
    onOpenChange: onOpenChangeSet,
  } = useDisclosure();
  const [selectedSet, setSelectedSet] = useState("release");

  const onChangeScroll = () => {
    if (window.scrollY < 30) setIsScroll(false);
    else setIsScroll(true);
  };

  const clickKakaoLogin = () => {
    window.location.href = "/api/oauth/login";
  };

  const clickLogout = async () => {
    const response = await fetch("/api/oauth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      window.location.href = "/";
    } else {
      console.error("Failed to log out");
    }
  };

  const handleOpenSet = () => {
    const isTodaySave = localStorage.getItem("set_isTodaySave");
    setSelectedSet(isTodaySave === "true" ? "today" : "release");
    onOpenSet();
  };

  const handleChangeSet = (value: string) => {
    setSelectedSet(value);
    localStorage.setItem("set_isTodaySave", value === "today" ? "true" : "false");
  };

  return (
    <>
      <Navbar
        isBlurred={false}
        classNames={{
          base: [
            "topbar-shell",
            path === "/" && !isScroll ? "topbar-shell--transparent" : "",
          ].join(" "),
          wrapper: "max-w-7xl px-3 sm:px-4",
        }}
        onScrollPositionChange={() => {
          if (path === "/") onChangeScroll();
        }}
      >
        <NavbarContent justify="start">
          <NavbarMenuToggle className="sm:hidden text-slate-700" />
          <NavbarMenu className="border-t border-white/60 bg-white/92 px-4 pt-4 backdrop-blur-xl">
            {navItems.map((item) => (
              <NavbarItem key={item.href} isActive={path === item.href}>
                <Link
                  href={item.href}
                  color="foreground"
                  className={[
                    "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                    path === item.href
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </NavbarItem>
            ))}
          </NavbarMenu>

          <NavbarBrand>
            <p className="hidden sm:block text-inherit">
              <Link
                href="/"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold tracking-[0.28em] text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] transition hover:bg-slate-800"
              >
                TOVIE
              </Link>
            </p>
          </NavbarBrand>

          <NavbarContent className="hidden gap-2 sm:flex">
            {navItems.map((item) => (
              <NavbarItem key={item.href} isActive={path === item.href}>
                <Link
                  href={item.href}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    path === item.href
                      ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-600 hover:bg-white/80 hover:text-slate-900",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </NavbarItem>
            ))}
          </NavbarContent>
        </NavbarContent>

        <NavbarContent as="div" className="items-center gap-2 sm:gap-3" justify="end">
          <SearchInput />
          {!uid ? (
            <Button
              onPress={onOpen}
              radius="full"
              variant="flat"
              className="bg-slate-950 px-4 text-sm font-medium text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] hover:bg-slate-800"
            >
              Login
            </Button>
          ) : (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  size="sm"
                  as="button"
                  className="transition-transform ring-2 ring-white shadow-md"
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat" className="min-w-44">
                <DropdownItem key="mypage" href="/mypage/2025">
                  My Page
                </DropdownItem>
                <DropdownItem key="setting" onPress={handleOpenSet}>
                  Settings
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onPress={clickLogout}>
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </NavbarContent>
      </Navbar>

      <Modal isOpen={isOpen} size="sm" placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Login</ModalHeader>
              <ModalBody className="py-4">
                <Button color="warning" onPress={clickKakaoLogin}>
                  Continue with Kakao
                </Button>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isOpenSet}
        size="sm"
        placement="center"
        onOpenChange={onOpenChangeSet}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Settings</ModalHeader>
              <ModalBody className="py-4">
                <RadioGroup
                  orientation="horizontal"
                  color="secondary"
                  label="Date mode"
                  value={selectedSet}
                  onValueChange={handleChangeSet}
                >
                  <Radio value="release">Release</Radio>
                  <Radio value="today">Today</Radio>
                </RadioGroup>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

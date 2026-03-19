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
import { useEffect, useState } from "react";
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
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const nextIsDark = savedTheme === "dark";
    setIsDarkMode(nextIsDark);
    document.documentElement.classList.toggle("dark-theme", nextIsDark);
  }, []);

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

  const toggleTheme = () => {
    const nextIsDark = !isDarkMode;
    setIsDarkMode(nextIsDark);
    document.documentElement.classList.toggle("dark-theme", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
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
          <NavbarMenuToggle className="topbar-toggle sm:hidden" />
          <NavbarMenu className="topbar-menu border-t px-4 pt-4 backdrop-blur-xl">
            {navItems.map((item) => (
              <NavbarItem key={item.href} isActive={path === item.href}>
                <Link
                  href={item.href}
                  color="foreground"
                  className={[
                    "topbar-mobile-link block rounded-2xl px-4 py-3 text-sm font-medium transition",
                    path === item.href ? "topbar-mobile-link--active" : "",
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
                className="topbar-brand rounded-full px-4 py-2 text-sm font-semibold tracking-[0.28em] transition"
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
                    "topbar-link rounded-full px-4 py-2 text-sm font-medium transition",
                    path === item.href ? "topbar-link--active" : "",
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
          <Button
            radius="full"
            variant="flat"
            onPress={toggleTheme}
            className="topbar-theme px-3 text-sm font-medium"
          >
            {isDarkMode ? "Light" : "Dark"}
          </Button>
          {!uid ? (
            <Button
              onPress={onOpen}
              radius="full"
              variant="flat"
              className="topbar-login px-4 text-sm font-medium"
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
                  className="topbar-avatar transition-transform"
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat" className="topbar-dropdown min-w-44">
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

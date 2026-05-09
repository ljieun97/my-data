"use client";

import { faCircleHalfStroke, faMoon, faMagnifyingGlass, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import { Avatar, Button, Dropdown, Toast } from "@heroui/react";
import SearchInput from "./search-input";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useSaveDate } from "@/context/SaveDateContext";

function AvatarButton({ className, src }: { className?: string; src: string }) {
  return (
    <Avatar className={className} size="sm">
      <Avatar.Image src={src} />
      <Avatar.Fallback>T</Avatar.Fallback>
    </Avatar>
  );
}

function OverlayModal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-[28px] border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200/70 px-6 py-4 text-lg font-semibold dark:border-slate-800">{title}</div>
        <div className="px-6 py-5">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-slate-200/70 px-6 py-4 dark:border-slate-800">{footer}</div> : null}
      </div>
    </div>
  );
}

const navItems = [
  { href: "/", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/timetable", label: "Timetable" },
  { href: "/awards", label: "Awards" },
  { href: "/movie", label: "Movies" },
  { href: "/tv", label: "Series" },
];

function LoginModal({ open, onLogin, onClose }: { open: boolean; onLogin: () => void; onClose: () => void }) {
  return (
    <OverlayModal open={open} title="Login" onClose={onClose}>
      <Button className="w-full" variant="primary" onPress={onLogin}>
        Continue with Kakao
      </Button>
    </OverlayModal>
  );
}

function SettingsModal({
  open,
  selectedSet,
  setSelectedSet,
  isDarkMode,
  onToggleTheme,
  onClose,
}: {
  open: boolean;
  selectedSet: string;
  setSelectedSet: (value: "release" | "today" | "custom") => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onClose: () => void;
}) {
  return (
    <OverlayModal open={open} title="Settings" onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Date mode</div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="date-mode" checked={selectedSet === "release"} onChange={() => setSelectedSet("release")} />
              <span>Release</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="date-mode" checked={selectedSet === "today"} onChange={() => setSelectedSet("today")} />
              <span>Today</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="date-mode" checked={selectedSet === "custom"} onChange={() => setSelectedSet("custom")} />
              <span>Custom</span>
            </label>
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Theme</div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200"
            onClick={onToggleTheme}
          >
            <FontAwesomeIcon icon={isDarkMode ? faCircleHalfStroke : faMoon} />
            <span>{isDarkMode ? "Light" : "Dark"}</span>
          </button>
        </div>
      </div>
    </OverlayModal>
  );
}

export default function TopBar() {
  const { uid } = useUser();
  const { mode: saveDateMode, setMode: setSaveDateMode } = useSaveDate();
  const path = usePathname();
  const [isScroll, setIsScroll] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<"release" | "today" | "custom">("release");

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isActivePath = (href: string) => path === href || path.startsWith(`${href}/`);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const nextIsDark = savedTheme === "dark";
    setIsDarkMode(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    document.documentElement.classList.toggle("dark-theme", nextIsDark);
    document.documentElement.style.colorScheme = nextIsDark ? "dark" : "light";
    document.cookie = `theme=${nextIsDark ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  useEffect(() => {
    let frameId = 0;

    const handleScroll = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        const nextIsScroll = window.scrollY >= 30;
        setIsScroll((prev) => (prev === nextIsScroll ? prev : nextIsScroll));
        frameId = 0;
      });
    };

    if (path === "/") {
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (frameId) {
          window.cancelAnimationFrame(frameId);
        }
      };
    }

    setIsScroll(true);
  }, [path]);

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
      return;
    }

    Toast.toast("Failed to log out");
  };

  const handleOpenSet = () => {
    setSelectedSet(saveDateMode);
    setIsSettingsOpen(true);
  };

  const handleChangeSet = (value: "release" | "today" | "custom") => {
    setSelectedSet(value);
    setSaveDateMode(value);
  };

  const toggleTheme = () => {
    const nextIsDark = !isDarkMode;
    setIsDarkMode(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    document.documentElement.classList.toggle("dark-theme", nextIsDark);
    document.documentElement.style.colorScheme = nextIsDark ? "dark" : "light";
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    document.cookie = `theme=${nextIsDark ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
  };

  const handleToggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  return (
    <>
      <nav
        className={[
          "topbar-shell z-50",
          path === "/" && !isScroll ? "topbar-shell--transparent" : "",
          mobileOpen ? "topbar-shell--menu-open" : "",
        ].join(" ")}
      >
        <div className="app-frame topbar-inner flex min-h-[4.5rem] items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <button
              type="button"
              className="topbar-toggle topbar-toggle--mobile inline-flex h-10 w-10 items-center justify-center text-slate-700 dark:text-slate-200"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <span className="text-lg leading-none">{mobileOpen ? "\u2715" : "\u2630"}</span>
            </button>

            <Link
              href="/"
              className="topbar-brand topbar-brand--desktop py-2 text-slate-900 transition dark:text-slate-100"
            >
              <span className="topbar-brand__word">TOVIE</span>
            </Link>

            <div className="topbar-desktop-nav ml-5 items-center gap-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "topbar-link relative px-3 py-3 text-[12px] font-medium uppercase tracking-[0.08em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
                    isActivePath(item.href)
                      ? "topbar-link--active text-slate-950 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-slate-950 dark:text-white dark:after:bg-white"
                      : "",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-3">
            <div
              className={[
                "overflow-hidden transition-all duration-200 ease-out",
                isSearchOpen ? "w-[10.5rem] sm:w-[13rem] lg:w-[16rem]" : "w-0",
              ].join(" ")}
            >
              <SearchInput
                className="topbar-search h-11 rounded-none [&_*]:rounded-none"
                autoFocus={isSearchOpen}
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
            <Button
              variant="secondary"
              onPress={handleToggleSearch}
              className="topbar-theme h-10 w-10 min-w-0 rounded-none border-none px-0 text-sm font-medium text-slate-600 dark:text-slate-300"
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </Button>
            {!uid ? (
              <Button
                onPress={() => setIsLoginOpen(true)}
                variant="primary"
                className="topbar-login h-10 w-10 min-w-0 rounded-none border-none px-0 text-sm font-medium text-slate-700 dark:text-slate-200"
                aria-label="Open login"
              >
                <FontAwesomeIcon icon={faUser} />
              </Button>
            ) : (
              <Dropdown>
                <Dropdown.Trigger>
                  <AvatarButton className="topbar-avatar cursor-pointer rounded-none" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end">
                  <Dropdown.Menu className="topbar-dropdown min-w-44 p-2">
                    <Dropdown.Item href="/mypage">My Page</Dropdown.Item>
                    <Dropdown.Item onAction={handleOpenSet}>Settings</Dropdown.Item>
                    <Dropdown.Item onAction={clickLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            )}
          </div>
        </div>

        {mobileOpen ? (
          <div className="topbar-menu topbar-menu--mobile border-t backdrop-blur-xl">
            <div className="app-frame topbar-inner pb-2 pt-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "topbar-mobile-link block border-b border-slate-200/60 px-1 py-3 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:text-slate-50",
                    isActivePath(item.href)
                      ? "topbar-mobile-link--active border-slate-950 text-slate-950 dark:border-slate-100 dark:text-slate-50"
                      : "",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </nav>

      <LoginModal open={isLoginOpen} onLogin={clickKakaoLogin} onClose={() => setIsLoginOpen(false)} />
      <SettingsModal
        open={isSettingsOpen}
        selectedSet={selectedSet}
        setSelectedSet={handleChangeSet}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

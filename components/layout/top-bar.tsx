"use client";

import { faCircleHalfStroke, faMoon, faMagnifyingGlass, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Button, Dropdown, Toast } from "@heroui/react";
import SearchInput from "./search-input";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  { href: "/worldcup", label: "Worldcup" },
  { href: "/calendar", label: "Calendar" },
  { href: "/timetable", label: "Timetable" },
  { href: "/awards", label: "Awards" },
  { href: "/movie", label: "Movies" },
  { href: "/tv", label: "Series" },
  { href: "/guest", label: "Guest" },
];

function WorldcupModal({
  open,
  selectedSource,
  selectedYear,
  setSelectedSource,
  setSelectedYear,
  yearOptions,
  onSubmit,
  onClose,
}: {
  open: boolean;
  selectedSource: string;
  selectedYear: string;
  setSelectedSource: (value: string) => void;
  setSelectedYear: (value: string) => void;
  yearOptions: string[];
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <OverlayModal
      open={open}
      title="Worldcup"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900" onClick={onSubmit}>
            Start worldcup
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Year</span>
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="min-h-[2.85rem] rounded-2xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Source</div>
        <div className="flex flex-col gap-3">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="worldcup-source" checked={selectedSource === "kobis"} onChange={() => setSelectedSource("kobis")} />
            <span>Box Office (KOBIS)</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="worldcup-source" checked={selectedSource === "tmdb"} onChange={() => setSelectedSource("tmdb")} />
            <span>OTT (TMDB)</span>
          </label>
        </div>
      </div>
    </OverlayModal>
  );
}

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
            <span>{isDarkMode ? "Dark" : "Light"}</span>
          </button>
        </div>
      </div>
    </OverlayModal>
  );
}

export default function TopBar() {
  const currentYear = new Date().getFullYear();
  const defaultWorldcupYear = String(currentYear - 1);
  const { uid } = useUser();
  const { mode: saveDateMode, setMode: setSaveDateMode } = useSaveDate();
  const path = usePathname();
  const router = useRouter();
  const [isScroll, setIsScroll] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<"release" | "today" | "custom">("release");
  const [selectedSource, setSelectedSource] = useState("kobis");
  const [selectedYear, setSelectedYear] = useState(defaultWorldcupYear);
  const yearOptions = useMemo(() => Array.from({ length: 26 }, (_, index) => String(currentYear - index)), [currentYear]);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorldcupOpen, setIsWorldcupOpen] = useState(false);
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

  const handleOpenWorldcup = () => {
    setSelectedSource("kobis");
    setSelectedYear(defaultWorldcupYear);
    setIsWorldcupOpen(true);
    setMobileOpen(false);
  };

  const handleNavigateWorldcup = () => {
    router.push(`/worldcup?year=${selectedYear}&source=${selectedSource}`);
    setIsWorldcupOpen(false);
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
              className="topbar-toggle topbar-toggle--mobile inline-flex h-10 w-10 items-center justify-center rounded-full"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <span className="text-lg leading-none">{mobileOpen ? "\u2715" : "\u2630"}</span>
            </button>

            <Link
              href="/"
              className="topbar-brand topbar-brand--desktop rounded-full px-4 py-2 text-sm font-semibold tracking-[0.28em] transition"
            >
              TOVIE
            </Link>

            <div className="topbar-desktop-nav items-center gap-2">
              {navItems.map((item) =>
                item.href === "/worldcup" ? (
                  <button
                    key={item.href}
                    type="button"
                    onClick={handleOpenWorldcup}
                    className={[
                      "topbar-link rounded-full px-4 py-2 text-sm font-medium transition",
                      isActivePath(item.href) ? "topbar-link--active" : "",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "topbar-link rounded-full px-4 py-2 text-sm font-medium transition",
                      isActivePath(item.href) ? "topbar-link--active" : "",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={[
                "overflow-hidden transition-all duration-200 ease-out",
                isSearchOpen ? "w-[10.5rem] sm:w-[13rem] lg:w-[16rem]" : "w-0",
              ].join(" ")}
            >
              <SearchInput
                className="topbar-search h-11"
                autoFocus={isSearchOpen}
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
            <Button
              variant="secondary"
              onPress={handleToggleSearch}
              className="topbar-theme h-11 w-11 min-w-0 rounded-full px-0 text-sm font-medium"
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </Button>
            {!uid ? (
              <Button
                onPress={() => setIsLoginOpen(true)}
                variant="primary"
                className="topbar-login h-11 w-11 min-w-0 rounded-full px-0 text-sm font-medium"
                aria-label="Open login"
              >
                <FontAwesomeIcon icon={faUser} />
              </Button>
            ) : (
              <Dropdown>
                <Dropdown.Trigger>
                  <AvatarButton className="topbar-avatar cursor-pointer" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end">
                  <Dropdown.Menu className="topbar-dropdown min-w-44 rounded-2xl p-2">
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
            <div className="app-frame topbar-inner pb-4 pt-4">
              {navItems.map((item) =>
                item.href === "/worldcup" ? (
                  <button
                    key={item.href}
                    type="button"
                    onClick={handleOpenWorldcup}
                    className={[
                      "topbar-mobile-link mt-1 block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                      isActivePath(item.href) ? "topbar-mobile-link--active" : "",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "topbar-mobile-link mt-1 block rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActivePath(item.href) ? "topbar-mobile-link--active" : "",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                ),
              )}
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
      <WorldcupModal
        open={isWorldcupOpen}
        selectedSource={selectedSource}
        selectedYear={selectedYear}
        setSelectedSource={setSelectedSource}
        setSelectedYear={setSelectedYear}
        yearOptions={yearOptions}
        onSubmit={handleNavigateWorldcup}
        onClose={() => setIsWorldcupOpen(false)}
      />
    </>
  );
}

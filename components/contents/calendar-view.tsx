"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import koLocale from "@fullcalendar/core/locales/ko";
import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";

export default function CalendarView({
  results,
  option,
  hideCaptureButton = false,
  embedCalendarOnly = false,
}: {
  results: any[];
  option: any;
  hideCaptureButton?: boolean;
  embedCalendarOnly?: boolean;
}) {
  const BASE_LIST_ITEM_HEIGHT = 108;
  const MIN_ITEM_HEIGHT = 40;
  const MAX_ITEM_HEIGHT = 140;
  const MIN_DENSE_THRESHOLD = 2;
  const MAX_DENSE_THRESHOLD = 12;

  const [hoveredEvent, setHoveredEvent] = useState<{ x: number; y: number; data: any } | null>(null);
  const [listItemHeight, setListItemHeight] = useState(BASE_LIST_ITEM_HEIGHT);
  const [denseThreshold, setDenseThreshold] = useState(5);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentView, setCurrentView] = useState(option.initialView);
  const [visibleRange, setVisibleRange] = useState<{ start: string; end: string } | null>(null);

  const calendarCaptureRef = useRef<HTMLDivElement | null>(null);
  const visibleEvents = useMemo(
    () =>
      (currentView === "listDay" ? results.filter((item: any) => Boolean(item.backdrop_path)) : results).filter((item: any) => {
        const type = String(item?.type ?? "");
        const title = String(item?.title ?? "");
        const isHoliday =
          type.includes("공휴일") ||
          title.includes("공휴일") ||
          type.includes("대체공휴일") ||
          title.includes("대체공휴일");
        const isAdmin = type === "관리자";
        return !isHoliday && !isAdmin;
      }),
    [currentView, results],
  );
  const toLocalDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  const monthEventCountByDate = useMemo(() => {
    const countByDate = new Map<string, number>();
    results.forEach((item: any) => {
      const dateKey = item?.release_date || item?.start;
      if (!dateKey) return;
      const key = String(dateKey).slice(0, 10);
      countByDate.set(key, (countByDate.get(key) || 0) + 1);
    });
    return countByDate;
  }, [results]);
  const textScheduleGroups = useMemo(() => {
    const map = new Map<string, any[]>();
    const toDateKey = (value: string) => String(value).slice(0, 10);
    const getPriority = (item: any) => {
      if (item?.type === "공휴일") return 4;
      if (item?.type === "관리자") return 3;
      if (item?.type === "박스오피스") return 2;
      if (item?.type === "재개봉") return 1;
      return 0;
    };

    visibleEvents.forEach((item: any) => {
      const type = String(item?.type ?? "");
      const title = String(item?.title ?? "");
      const isHoliday = type.includes("공휴일") || title.includes("공휴일") || type.includes("대체공휴일") || title.includes("대체공휴일");
      const isAdmin = type === "관리자";
      if (isHoliday || isAdmin) return;
      const start = item?.release_date ?? item?.start;
      if (!start) return;
      const key = toDateKey(start);
      if (visibleRange) {
        if (key < visibleRange.start || key >= visibleRange.end) return;
      }
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(item);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, items]) => ({
        dateKey,
        items: items.sort((a, b) => {
          const pa = getPriority(a);
          const pb = getPriority(b);
          if (pa !== pb) return pb - pa;
          return String(a?.title ?? "").localeCompare(String(b?.title ?? ""), "ko");
        }),
      }));
  }, [visibleEvents, visibleRange]);
  const formatTextDate = (dateKey: string) => {
    const date = new Date(`${dateKey}T00:00:00`);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day} (${weekday})`;
  };
  const holidayDateSet = useMemo(() => {
    const set = new Set<string>();
    results.forEach((item: any) => {
      const type = String(item?.type ?? "");
      const title = String(item?.title ?? "");
      const isHoliday =
        type.includes("공휴일") ||
        title.includes("공휴일") ||
        type.includes("대체공휴일") ||
        title.includes("대체공휴일");
      if (!isHoliday) return;
      const dateKey = item?.release_date || item?.start;
      if (!dateKey) return;
      set.add(String(dateKey).slice(0, 10));
    });
    return set;
  }, [results]);

  const handleCapture = async () => {
    if (!calendarCaptureRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const dataUrl = await toPng(calendarCaptureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `calendar-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } finally {
      setIsCapturing(false);
    }
  };

  const normalizeListDayDom = () => {
    const root = calendarCaptureRef.current;
    if (!root) return;

    const listEvents = root.querySelectorAll("tr.fc-list-event");

    listEvents.forEach((row) => {
      const timeCell = row.querySelector("td.fc-list-event-time") as HTMLTableCellElement | null;
      const graphicCell = row.querySelector("td.fc-list-event-graphic") as HTMLTableCellElement | null;
      const titleCell = row.querySelector("td.fc-list-event-title") as HTMLTableCellElement | null;
      const titleLink = row.querySelector("td.fc-list-event-title a") as HTMLAnchorElement | null;
      const card = row.querySelector("td.fc-list-event-title a > div") as HTMLDivElement | null;

      if (timeCell) timeCell.style.display = "none";
      if (graphicCell) graphicCell.style.display = "none";

      if (titleCell) {
        titleCell.style.padding = "0";
        titleCell.style.margin = "0";
      }

      if (titleLink) {
        titleLink.style.display = "block";
        titleLink.style.padding = "0";
        titleLink.style.margin = "0";
        titleLink.style.textDecoration = "none";
        titleLink.style.pointerEvents = "none";
      }

      if (card) {
        card.style.minHeight = `${listItemHeight}px`;
      }
    });
  };

  useEffect(() => {
    if (currentView !== "listDay") return;
    requestAnimationFrame(() => normalizeListDayDom());
  }, [currentView, listItemHeight, visibleEvents]);

  return (
    <div className={embedCalendarOnly ? "h-full" : ""}>
      <div ref={calendarCaptureRef} className={`${embedCalendarOnly ? "h-full " : ""}calendar-capture-frame ${isCapturing ? "is-capturing" : ""}`}>
        <div className={embedCalendarOnly ? "calendar-view h-full w-full" : "calendar-view w-full aspect-[4/5]"}>
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin]}
          initialView={option.initialView}
          headerToolbar={
            isCapturing || embedCalendarOnly
              ? false
              : {
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,listDay",
                }
          }
            views={{
              listDay: {
                buttonText: "일간",
                noEventsText: "일정이 없습니다",
                displayEventTime: false,
                listDayFormat: { month: "numeric", day: "numeric", weekday: "short" },
              },
              dayGridMonth: { buttonText: "월간" },
            }}
            locale={koLocale}
            fixedWeekCount={false}
            showNonCurrentDates={false}
            eventInteractive={currentView !== "listDay"}
            navLinks={true}
            navLinkDayClick="listDay"
            moreLinkClick="listDay"
            eventOrder="start,-priority,title"
            dayCellContent={(arg) => (arg.view.type === "listDay" ? "" : String(arg.date.getDate()))}
            height="100%"
            events={visibleEvents}
            datesSet={(arg) => {
              setCurrentView(arg.view.type);
              setVisibleRange({
                start: toLocalDateKey(arg.start),
                end: toLocalDateKey(arg.end),
              });
              if (arg.view.type !== "dayGridMonth") setHoveredEvent(null);
              if (arg.view.type === "listDay") {
                requestAnimationFrame(() => normalizeListDayDom());
              }
            }}
            eventDataTransform={(rawEvent) => {
              let title = rawEvent.title;
              let color;
              let priority = 0;
              let normalizedEnd = rawEvent.end;

              if (typeof rawEvent.end === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawEvent.end)) {
                const endDate = new Date(`${rawEvent.end}T00:00:00`);
                endDate.setDate(endDate.getDate() + 1);
                const y = endDate.getFullYear();
                const m = String(endDate.getMonth() + 1).padStart(2, "0");
                const d = String(endDate.getDate()).padStart(2, "0");
                normalizedEnd = `${y}-${m}-${d}`;
              }

              if (rawEvent.type === "관리자") {
                color = "#93C5FD";
                priority = 3;
              } else if (rawEvent.type === "공휴일") {
                color = "#FCA5A5";
                priority = 4;
              } else if (rawEvent.type === "재개봉") {
                color = "#FED7AA";
                priority = 1;
              } else if (rawEvent.type === "박스오피스") {
                color = "#FDBA74";
                priority = 2;
              }

              return {
                ...rawEvent,
                title,
                color,
                textColor: "#1f2937",
                priority,
                start: rawEvent.release_date ?? rawEvent.start,
                end: normalizedEnd,
                url: undefined,
              };
            }}
            eventDidMount={(arg) => {
              if (arg.view.type === "listDay") {
                arg.el.style.backgroundColor = "#0b0b0b";
                arg.el.style.borderColor = "#0b0b0b";
                arg.el.style.pointerEvents = "none";
                requestAnimationFrame(() => normalizeListDayDom());
              }
            }}
            eventMouseEnter={(info) => {
              if (info.view.type !== "dayGridMonth") return;
              setHoveredEvent({
                x: info.jsEvent.pageX,
                y: info.jsEvent.pageY,
                data: info.event,
              });
            }}
            eventMouseLeave={(info) => {
              if (info.view.type !== "dayGridMonth") return;
              setHoveredEvent(null);
            }}
            dayCellClassNames={(arg) => {
              if (arg.view.type !== "dayGridMonth") return [];
              const key = toLocalDateKey(arg.date);
              const count = monthEventCountByDate.get(key) || 0;
              const classes: string[] = [];
              if (count >= denseThreshold) classes.push("month-dense-day");
              if (holidayDateSet.has(key)) classes.push("holiday-day");
              return classes;
            }}
            eventContent={(arg) => {
              if (arg.view.type !== "listDay") {
                return <span className="fc-event-title">{arg.event.title}</span>;
              }

            const backdropPath = arg.event.extendedProps?.backdrop_path as string | undefined;
            const imageUrl = backdropPath ? `https://image.tmdb.org/t/p/w780${backdropPath}` : undefined;

            return (
              <div
                className="relative h-full w-full overflow-hidden text-white pl-2 pr-0 py-0"
                style={{
                  minHeight: `${listItemHeight}px`,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#0b0b0b",
                }}
              >
                {imageUrl ? (
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center 35%",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                ) : null}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.82) 36%, rgba(0, 0, 0, 0.58) 52%, rgba(0, 0, 0, 0.22) 72%, rgba(0, 0, 0, 0.06) 88%, rgba(0, 0, 0, 0) 100%)",
                  }}
                />
                <p
                  className="relative z-[1] truncate pr-2 text-[13px] font-bold leading-tight"
                  style={{ maxWidth: "100%" }}
                >
                  {arg.event.title}
                </p>
              </div>
            );
          }}
        />
      </div>
      </div>

      {!hideCaptureButton && !embedCalendarOnly ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleCapture}
            disabled={isCapturing}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Capture calendar image"
          >
            {isCapturing ? "capturing..." : "capture"}
          </button>
        </div>
      ) : null}

      {!embedCalendarOnly ? (
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setListItemHeight((prev) => Math.max(MIN_ITEM_HEIGHT, prev - 2))}
          disabled={listItemHeight <= MIN_ITEM_HEIGHT}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Decrease day item height"
        >
          height -
        </button>
        <span className="min-w-[64px] text-center text-xs text-slate-700 dark:text-slate-300">{listItemHeight}px</span>
        <button
          type="button"
          onClick={() => setListItemHeight((prev) => Math.min(MAX_ITEM_HEIGHT, prev + 2))}
          disabled={listItemHeight >= MAX_ITEM_HEIGHT}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Increase day item height"
        >
          height +
        </button>
      </div>
      ) : null}

      {!embedCalendarOnly ? (
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setDenseThreshold((prev) => Math.max(MIN_DENSE_THRESHOLD, prev - 1))}
          disabled={denseThreshold <= MIN_DENSE_THRESHOLD}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Decrease dense threshold"
        >
          2열 기준 -
        </button>
        <span className="min-w-[64px] text-center text-xs text-slate-700 dark:text-slate-300">{denseThreshold}개</span>
        <button
          type="button"
          onClick={() => setDenseThreshold((prev) => Math.min(MAX_DENSE_THRESHOLD, prev + 1))}
          disabled={denseThreshold >= MAX_DENSE_THRESHOLD}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Increase dense threshold"
        >
          2열 기준 +
        </button>
      </div>
      ) : null}

      {!embedCalendarOnly ? (
      <div className="mt-5 space-y-4 rounded-md border border-slate-200 bg-white/70 p-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
        {textScheduleGroups.length === 0 ? (
          <p>표시할 일정이 없습니다.</p>
        ) : (
          textScheduleGroups.map((group) => (
            <div key={group.dateKey}>
              <p className="font-semibold">{formatTextDate(group.dateKey)}</p>
              <div className="mt-1 space-y-1">
                {group.items.map((item: any, idx: number) => (
                  <p key={`${group.dateKey}-${item?.id ?? item?.title ?? "event"}-${idx}`}>
                    - {item?.title}
                    {item?.type === "재개봉" ? " (재개봉)" : ""}
                  </p>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      ) : null}

      {hoveredEvent ? (
        <div
          className="calendar-hover-card absolute z-[100] max-w-[308px] rounded-xl border p-3 shadow-lg"
          style={{
            left: hoveredEvent.x < window.innerWidth / 2 ? hoveredEvent.x : "auto",
            right: hoveredEvent.x >= window.innerWidth / 2 ? window.innerWidth - hoveredEvent.x : "auto",
            top: hoveredEvent.y < window.innerHeight / 2 ? hoveredEvent.y : "auto",
            bottom: hoveredEvent.y >= window.innerHeight / 2 ? window.innerHeight - hoveredEvent.y : "auto",
          }}
        >
          <p className="font-semibold text-slate-900 dark:text-slate-50">{hoveredEvent.data.title}</p>
          <p className="text-tiny text-slate-600 dark:text-slate-300">{hoveredEvent.data.extendedProps.type}</p>
          <p className="text-tiny text-slate-600 dark:text-slate-300">Date: {hoveredEvent.data.start.toLocaleDateString()}</p>
          {hoveredEvent.data.extendedProps.backdrop_path ? (
            <>
              <div className="h-2" aria-hidden="true" />
              <img
                alt="Poster Image"
                src={`https://image.tmdb.org/t/p/original${hoveredEvent.data.extendedProps.backdrop_path}`}
                width={300}
                height={168}
                className="rounded-sm"
              />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}




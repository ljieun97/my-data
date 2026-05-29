"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import koLocale from "@fullcalendar/core/locales/ko";
import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";

export default function CalendarView({ results, option }: { results: any[]; option: any }) {
  const MIN_EVENTS_PER_DAY = 2;
  const MAX_EVENTS_PER_DAY = 12;
  const BASE_LIST_ITEM_HEIGHT = 108;
  const MIN_ITEM_HEIGHT = 40;
  const MAX_ITEM_HEIGHT = 140;

  const [maxEventsPerDay, setMaxEventsPerDay] = useState(4);
  const [listItemHeight, setListItemHeight] = useState(BASE_LIST_ITEM_HEIGHT);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentView, setCurrentView] = useState(option.initialView);

  const calendarCaptureRef = useRef<HTMLDivElement | null>(null);
  const visibleEvents = useMemo(
    () => (currentView === "listDay" ? results.filter((item: any) => Boolean(item.backdrop_path)) : results),
    [currentView, results],
  );

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
    <div>
      <div ref={calendarCaptureRef} className={`calendar-capture-frame ${isCapturing ? "is-capturing" : ""}`}>
        <div className="calendar-view w-full aspect-[2/3]">
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin]}
          initialView={option.initialView}
          headerToolbar={
            isCapturing
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
            dayMaxEvents={maxEventsPerDay}
            moreLinkClick="listDay"
            dayCellContent={(arg) => (arg.view.type === "listDay" ? "" : String(arg.date.getDate()))}
            height="100%"
            events={visibleEvents}
            datesSet={(arg) => {
              setCurrentView(arg.view.type);
              if (arg.view.type === "listDay") {
                requestAnimationFrame(() => normalizeListDayDom());
              }
            }}
            eventDataTransform={(rawEvent) => {
              let title = rawEvent.title;
              let color;

              if (rawEvent.type === "OTT") color = "#eb4d4b";
              else if (rawEvent.backdrop_path) color = "#f0932b";

              return { ...rawEvent, title, color, start: rawEvent.release_date, url: undefined };
            }}
            eventDidMount={(arg) => {
              if (arg.view.type === "listDay") {
                arg.el.style.backgroundColor = "#0b0b0b";
                arg.el.style.borderColor = "#0b0b0b";
                arg.el.style.pointerEvents = "none";
                requestAnimationFrame(() => normalizeListDayDom());
              }
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

      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setMaxEventsPerDay((prev) => Math.max(MIN_EVENTS_PER_DAY, prev - 1))}
          disabled={maxEventsPerDay <= MIN_EVENTS_PER_DAY}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Decrease day max events"
        >
          -
        </button>
        <span className="min-w-[54px] text-center text-xs text-slate-700 dark:text-slate-300">{maxEventsPerDay}개</span>
        <button
          type="button"
          onClick={() => setMaxEventsPerDay((prev) => Math.min(MAX_EVENTS_PER_DAY, prev + 1))}
          disabled={maxEventsPerDay >= MAX_EVENTS_PER_DAY}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Increase day max events"
        >
          +
        </button>
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
    </div>
  );
}


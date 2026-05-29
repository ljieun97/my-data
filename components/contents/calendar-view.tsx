"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import koLocale from "@fullcalendar/core/locales/ko";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";

export default function CalendarView({ results, option }: { results: any[]; option: any }) {
  const MIN_EVENTS_PER_DAY = 2;
  const MAX_EVENTS_PER_DAY = 12;

  const [hoveredEvent, setHoveredEvent] = useState<{ x: number; y: number; data: any } | null>(null);
  const [maxEventsPerDay, setMaxEventsPerDay] = useState(4);
  const [isCapturing, setIsCapturing] = useState(false);

  const popupRef = useRef<HTMLDivElement | null>(null);
  const calendarCaptureRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div>
      <div ref={calendarCaptureRef} className={`calendar-capture-frame ${isCapturing ? "is-capturing" : ""}`}>
        <div className="calendar-view w-full aspect-[2/3]">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView={option.initialView}
          headerToolbar={
            isCapturing
              ? false
              : {
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,dayGridDay",
                }
          }
            views={{
              dayGridDay: {
                buttonText: "일간",
                dayHeaderFormat: { month: "numeric", day: "numeric", weekday: "short" },
                dayMaxEvents: false,
              },
              dayGridMonth: { buttonText: "월간" },
            }}
            locale={koLocale}
            fixedWeekCount={false}
            showNonCurrentDates={false}
            dayMaxEvents={maxEventsPerDay}
            moreLinkClick="day"
            dayCellContent={(arg) => (arg.view.type === "dayGridDay" ? "" : String(arg.date.getDate()))}
            height="100%"
            events={results}
            eventDataTransform={(rawEvent) => {
              let title = rawEvent.title;
              let color;

              if (rawEvent.type === "OTT") color = "#eb4d4b";
              else if (rawEvent.backdrop_path) color = "#f0932b";

              return { ...rawEvent, title, color, start: rawEvent.release_date };
            }}
            eventMouseEnter={(info) => {
              setHoveredEvent({
                x: info.jsEvent.pageX,
                y: info.jsEvent.pageY,
                data: info.event,
              });
            }}
            eventMouseLeave={() => setHoveredEvent(null)}
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

      {hoveredEvent ? (
        <div
          ref={popupRef}
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

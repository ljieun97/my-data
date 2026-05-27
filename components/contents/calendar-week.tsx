'use client'

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import rrulePlugin from "@fullcalendar/rrule";
import koLocale from "@fullcalendar/core/locales/ko";

const events = [
  {
    title: "정부지원 할인권",
    start: "2026-05-13",
    end: "2026-09-08",
    color: "#34d399",
  },
  {
    title: "문화의 날",
    rrule: {
      freq: "monthly",
      byweekday: ["we"],
      bysetpos: 2,
      dtstart: "2026-05-01",
    },
    color: "#34d399",
  },
  {
    title: "문화의 날",
    rrule: {
      freq: "monthly",
      byweekday: ["we"],
      bysetpos: -1,
      dtstart: "2026-05-01",
    },
    color: "#34d399",
  }
];

export default function CalendarWeek({}: {}) {
  return (
    <div>
      <FullCalendar
        headerToolbar={{
          left: "",
          center: "",
          right: "today prev,next",
        }}
        plugins={[dayGridPlugin, rrulePlugin]}
        initialView="dayGridWeek"
        locale={koLocale}
        events={events}
      />
    </div>
  );
}

'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import koLocale from '@fullcalendar/core/locales/ko'
import { useRef, useState } from "react";
import { Spacer, Image } from "@heroui/react";

export default function CalendarView({ results, option }: { results: any[], option: any }) {
  const [hoveredEvent, setHoveredEvent] = useState<{ x: number; y: number; data: any } | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div className="min-h-[70vh]">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView={option.initialView}
          locale={koLocale}
          fixedWeekCount={false}
          height="auto"
          events={results}
          eventDataTransform={(rawEvent) => {
            let title = rawEvent.title;
            let color;

            if (rawEvent.type === "OTT") {
              title = `OTT ${rawEvent.title}`;
              color = "#eb4d4b";
            } else if (rawEvent.backdrop_path) {
              title = `Movie ${rawEvent.title}`;
              color = "#f0932b";
            } else {
              title = `Release ${rawEvent.title}`;
            }

            return {
              ...rawEvent,
              title,
              color,
              start: rawEvent.release_date,
            };
          }}
          eventMouseEnter={(info) => {
            setHoveredEvent({
              x: info.jsEvent.pageX,
              y: info.jsEvent.pageY,
              data: info.event,
            });
          }}
          eventMouseLeave={() => {
            setHoveredEvent(null);
          }}
        />
        {hoveredEvent && (
          <div
            ref={popupRef}
            className="absolute z-[100] max-w-[308px] rounded border bg-white p-2 shadow"
            style={{
              position: 'absolute',
              left: hoveredEvent.x < window.innerWidth / 2 ? hoveredEvent.x : 'auto',
              right: hoveredEvent.x >= window.innerWidth / 2 ? window.innerWidth - hoveredEvent.x : 'auto',
              top: hoveredEvent.y < window.innerHeight / 2 ? hoveredEvent.y : 'auto',
              bottom: hoveredEvent.y >= window.innerHeight / 2 ? window.innerHeight - hoveredEvent.y : 'auto',
            }}
          >
            <p className="font-semibold">{hoveredEvent.data.title}</p>
            <p className="text-tiny">{hoveredEvent.data.extendedProps.type}</p>
            <p className="text-tiny">Date: {hoveredEvent.data.start.toLocaleDateString()}</p>

            {hoveredEvent.data.extendedProps.backdrop_path && (
              <>
                <Spacer y={2} />
                <Image
                  radius="sm"
                  alt="Poster Image"
                  src={`https://image.tmdb.org/t/p/original${hoveredEvent.data.extendedProps.backdrop_path}`}
                  width={300}
                  height={168}
                />
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

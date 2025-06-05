'use client'

import { today, getLocalTimeZone } from "@internationalized/date";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import koLocale from '@fullcalendar/core/locales/ko'
import { useMemo, useState } from "react";
import { Card, Spacer, Image } from "@heroui/react";
import { SP } from "next/dist/shared/lib/utils";
import { TooltipDetail } from "../modal/tooltip-detail";

const groups = ['전체', '개봉', '굿즈']

const goodsEvents = [
  { id: '1', title: '디자인 회의', start: '2025-05-20', end: '2025-05-23', group: '디자인' },
  { id: '2', title: '프론트엔드 개발', start: '2025-05-21', group: '개발' },
  { id: '3', title: '백엔드 배포', start: '2025-05-22', group: '개발' },
];

export default function CalendarView({ results, option }: { results: any[], option: any }) {
  // console.log(results)
  const [hoveredEvent, setHoveredEvent] = useState<{ x: number; y: number; data: any } | null>(null);
  // const [selectedGroup, setSelectedGroup] = useState('전체');
  // const filteredEvents = useMemo(() => {
  //   if (selectedGroup === '개봉') return results;
  //   if (selectedGroup === '굿즈') return goodsEvents;
  //   return [...results, ...goodsEvents]; 
  // }, [selectedGroup, results, goodsEvents]);

  return (
    <>
      <Spacer y={12} />

      <div className="h-full">
        {/* <div className="mb-4 space-x-2">
          {groups.map((group) => (
            <button
              key={group}
              className={`px-3 py-1 rounded ${selectedGroup === group ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedGroup(group)}
            >
              {group}
            </button>
          ))}
        </div> */}
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView={option.initialView}
          locale={koLocale}
          // firstDay={1} 
          // views={{
          //   customWeek: {
          //     type: 'dayGrid',
          //     duration: { days: 7 },
          //     buttonText: '이번 주',
          //   },
          // }}
          // validRange={{ start: new Date().toISOString().split('T')[0] }} // 과거 흐리게
          // contentHeight={400}
          dayMaxEventRows={4}
          // dayMaxEvents={true}
          height="100%"
          // height="calc(100% - 106px)"

          events={results}
          eventDataTransform={(rawEvent) => {
            let title, color
            if (rawEvent.type == "박스오피스") {
              title = `🍿 ${rawEvent.title}`
              color = "#f0932b"
            } else if (rawEvent.type == "OTT") {
              title = `🖥️ ${rawEvent.title}`
              color = "#eb4d4b"
            }
            return {
              ...rawEvent,
              title: title,
              color: color,
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
          // <TooltipDetail id={hoveredEvent.data.extendedProps.id} type="movie"/>
          <div
            className="absolute z-[100] p-2 bg-white border rounded shadow max-w-[308px]"
            style={{ top: hoveredEvent.y + 10, left: hoveredEvent.x + 10 }}
          >
            <p className="font-semibold">{hoveredEvent.data.title}</p>
            <p className="text-tiny">플랫폼: {hoveredEvent.data.extendedProps.type}</p>
            <p className="text-tiny">개봉일: {hoveredEvent.data.start.toLocaleDateString()}</p>

            {hoveredEvent.data.extendedProps.backdrop_path &&
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
            }
          </div>
        )}
      </div>
    </>
  )


}


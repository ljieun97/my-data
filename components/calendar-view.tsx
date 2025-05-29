'use client'

import { today, getLocalTimeZone } from "@internationalized/date";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import koLocale from '@fullcalendar/core/locales/ko'
import { useMemo, useState } from "react";
import { Card, Spacer } from "@heroui/react";
import { SP } from "next/dist/shared/lib/utils";

const groups = ['전체', '개봉', '굿즈']

const goodsEvents = [
  { id: '1', title: '디자인 회의', start: '2025-05-20', end: '2025-05-23', group: '디자인' },
  { id: '2', title: '프론트엔드 개발', start: '2025-05-21', group: '개발' },
  { id: '3', title: '백엔드 배포', start: '2025-05-22', group: '개발' },
];

export default function CalendarView({ results, option }: { results: any[], option: any }) {

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
            // if (selectedGroup === '개봉' || (selectedGroup === '전체' && rawEvent.release_date)) {
            return {
              ...rawEvent,
              start: rawEvent.release_date,
            };
          }
            // return rawEvent;
          }
        />
      </div>
    </>
  )


}


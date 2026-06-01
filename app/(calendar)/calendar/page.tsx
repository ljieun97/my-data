import CalendarView from "@/components/contents/calendar-view";
import Title from "@/components/common/title";
import { fetchAllMovies } from '@/lib/open-api/tmdb-server';
import * as cheerio from "cheerio";
import customEvents from "@/data/calendar-custom-events.json";

export default async function Page() {
  const option = {
    initialView: "dayGridMonth"
  }
  const days = ["col1", "col2", "col3", "col4", "col5", "col6", "col7"]
  const scheduleMap = {} as any;
  days.forEach(day => {
    scheduleMap[day] = {
      "OCN": [],
      "OCN MOVIES": [],
      "OCN MOVIES 2": [],
    }
  });
  //------------------------------------------api
  const [upcoming, nowPlaying, reOpening, holidays] = await Promise.all([
    fetchAllMovies('upcoming'),
    fetchAllMovies('now_playing'),
    fetchSchedulesByReOpening(),
    fetchKoreanHolidays(),
    // fetchSchedulesByOcn({ name: "OCN", query: "ocn 편성표" }),
    // fetchSchedulesByOcn({ name: "OCN MOVIES", query: "ocn MOVIES 편성표" }),
    // fetchSchedulesByOcn({ name: "OCN MOVIES 2", query: "ocn MOVIES 2 편성표" })
  ])
  const mergedBox = [...upcoming, ...nowPlaying]
  const uniqueBoxMoviesMap = new Map<number, typeof mergedBox[0]>();
  mergedBox.forEach(movie => {
    uniqueBoxMoviesMap.set(movie.id, {
      ...movie,
      type: '박스오피스',
    })
  })
  const uniqueBoxMovies = Array.from(uniqueBoxMoviesMap.values())

  async function fetchKoreanHolidays() {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    const holidayMap = new Map<string, { id: string; type: string; title: string; release_date: string }>();

    await Promise.all(
      years.map(async (year) => {
        const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/KR`;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as Array<{ date: string; localName: string; name: string }>;

        data.forEach((item) => {
          const release_date = String(item.date).slice(0, 10);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(release_date)) return;
          holidayMap.set(release_date, {
            id: `holiday-${release_date}`,
            type: "공휴일",
            title: item.localName || item.name || "공휴일",
            release_date,
          });
        });
      }),
    );

    return Array.from(holidayMap.values());
  }

    //재개봉크롤링
  async function fetchSchedulesByReOpening() {
    const url =
      "https://muko.kr/calender/category/1905733/list_style/list"

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (crawl script)"
      }
    })

    const html = await response.text();
    const $ = cheerio.load(html);
    const schedules: { type: string, release_date: string; title: string; }[] = [];
    const unique = new Set<string>();
    const itemSelector = "a[href*='/calender/category/1905733/list_style/list/']";

    $(itemSelector).each((_, el) => {
      const root = $(el);
      const title =
        root.find("h3 span.flex-1").first().text().trim() ||
        root.find("h3").first().text().trim();

      const dateText = root
        .find("i[data-lucide='calendar']")
        .first()
        .parent()
        .find("span")
        .first()
        .text()
        .replace(/\s+/g, " ")
        .trim();

      const match = dateText.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
      if (!title || !match) return;

      const [, y, m, d] = match;
      const release_date = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const key = `${title}::${release_date}`;
      if (unique.has(key)) return;
      unique.add(key);

      schedules.push({ type: "재개봉", release_date, title });
    });

    return schedules;
  }

  //ocn 크롤링
  async function fetchSchedulesByOcn(channel: any) {
    const url =
      "https://search.naver.com/search.naver?query="
      + encodeURIComponent(channel.query);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (crawl script)"
      }
    })

    const html = await response.text();
    const $ = cheerio.load(html);
    const programList = '.program_list li';

    $(programList).each((_, li) => {
      const time = $(li).find(".time_box").text().trim();
      for (let i = 1; i <= 7; i++) {
        const col = `col${i}`;
        const $indProgram = $(li).find(`.ind_program.${col} .inner`);
        const $a = $indProgram.find("a");
        const $minute = $indProgram.find(".time_min");
        const title = $a.length ? $a.text().trim() : "";
        const minute = $minute.length ? $minute.text().trim() : "";
        // const hour = time.replace("시", "")

        // if (i <= 5 && Number(hour) < 18) continue; //평일
        // if (i > 5 && Number(hour) < 7) continue; //주말

        if (title) {
          scheduleMap[col][channel.name].push({ time: time + ' ' + minute, title });
        }
      }
    });
  }

  function formatDateKey(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getSecondWednesday(year: number, monthIndex: number) {
    const firstDay = new Date(year, monthIndex, 1);
    const firstDow = firstDay.getDay(); // 0 Sun ... 3 Wed
    const firstWednesday = 1 + ((3 - firstDow + 7) % 7);
    return new Date(year, monthIndex, firstWednesday + 7);
  }

  function getLastWednesday(year: number, monthIndex: number) {
    const lastDay = new Date(year, monthIndex + 1, 0);
    const lastDow = lastDay.getDay();
    const diff = (lastDow - 3 + 7) % 7;
    return new Date(year, monthIndex, lastDay.getDate() - diff);
  }

  function buildMonthlyAdminEventsForCurrentMonth() {
    const base = new Date();
    const monthBases = [
      new Date(base.getFullYear(), base.getMonth(), 1),
      new Date(base.getFullYear(), base.getMonth() + 1, 1),
    ];

    return monthBases.flatMap((monthBase) => {
      const y = monthBase.getFullYear();
      const m = monthBase.getMonth();
      const secondWed = getSecondWednesday(y, m);
      const lastWed = getLastWednesday(y, m);

      return [
        {
          id: `admin-second-wed-${y}-${String(m + 1).padStart(2, "0")}`,
          type: "관리자",
          title: "문화의 날",
          release_date: formatDateKey(secondWed),
        },
        {
          id: `admin-last-wed-${y}-${String(m + 1).padStart(2, "0")}`,
          type: "관리자",
          title: "문화의 날",
          release_date: formatDateKey(lastWed),
        },
      ];
    });
  }
// console.log(JSON.stringify(scheduleMap, null, 2))
  const monthlyAdminEvents = buildMonthlyAdminEventsForCurrentMonth();
  const results = [...uniqueBoxMovies, ...reOpening, ...customEvents, ...monthlyAdminEvents, ...holidays]
  console.log(uniqueBoxMovies.length, reOpening.length, customEvents.length, monthlyAdminEvents.length, holidays.length)

  return (
    // <div className="flex flex-col md:flex-row">
    <>
      <div className="mx-auto w-full max-w-[540px] px-4 md:px-0">
        <CalendarView results={results} option={option} />
      </div>
    </>
    // </div>
  );
}







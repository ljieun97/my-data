import CalendarView from "@/components/contents/calendar-view";
import Title from "@/components/common/title";
import { fetchAllMovies, getTodayMovies, getTodaySeries } from '@/lib/open-api/tmdb-server';
import * as cheerio from "cheerio";

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
  const [upcoming, nowPlaying, ott, reOpening] = await Promise.all([
    fetchAllMovies('upcoming'),
    fetchAllMovies('now_playing'),
    getTodayMovies(),
    fetchSchedulesByReOpening(),
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

  const ottMovies = ott.map((movie: any) => ({
    ...movie,
    type: 'OTT',
  }));

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
    const programList = '.tbl_scdl_list tbody tr';

    $(programList).each((_, li) => {
      const title = $(li).find("td").eq(1).text().replace(/\s*\(예정\)/g, "").trim();
      const day = $(li).find("td").eq(2).text().trim();
      const release_date = `2025년 ${day}`
        .replace("년", "-")
        .replace("월", "-")
        .replace("일", "")
        .replace(/\s/g, "")
        .replace(/-(\d)(?!\d)/g, "-0$1");
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
// console.log(JSON.stringify(scheduleMap, null, 2));
  const results = [...uniqueBoxMovies, ...reOpening, ...ottMovies]
  console.log(uniqueBoxMovies.length, ottMovies.length, reOpening.length)

  return (
    // <div className="flex flex-col md:flex-row">
    <>
      <div className="w-full h-full" >
        <CalendarView results={results} option={option} />
      </div>
    </>
    // </div>
  );
}

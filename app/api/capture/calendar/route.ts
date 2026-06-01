import customEvents from "@/data/calendar-custom-events.json";
import { fetchAllMovies } from "@/lib/open-api/tmdb-server";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getSecondWednesday(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1);
  const firstDow = firstDay.getDay();
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
        const releaseDate = String(item.date).slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) return;
        holidayMap.set(releaseDate, {
          id: `holiday-${releaseDate}`,
          type: "공휴일",
          title: item.localName || item.name || "공휴일",
          release_date: releaseDate,
        });
      });
    }),
  );

  return Array.from(holidayMap.values());
}

async function fetchSchedulesByReOpening() {
  const url = "https://muko.kr/calender/category/1905733/list_style/list";

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (crawl script)",
    },
  });

  const html = await response.text();
  const $ = cheerio.load(html);
  const schedules: { type: string; release_date: string; title: string }[] = [];
  const unique = new Set<string>();
  const itemSelector = "a[href*='/calender/category/1905733/list_style/list/']";

  $(itemSelector).each((_, el) => {
    const root = $(el);
    const title = root.find("h3 span.flex-1").first().text().trim() || root.find("h3").first().text().trim();

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
    const releaseDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const key = `${title}::${releaseDate}`;
    if (unique.has(key)) return;
    unique.add(key);

    schedules.push({ type: "재개봉", release_date: releaseDate, title });
  });

  return schedules;
}

export async function GET() {
  try {
    const [upcoming, nowPlaying, reOpening, holidays] = await Promise.all([
      fetchAllMovies("upcoming"),
      fetchAllMovies("now_playing"),
      fetchSchedulesByReOpening(),
      fetchKoreanHolidays(),
    ]);

    const mergedBox = [...upcoming, ...nowPlaying];
    const uniqueBoxMoviesMap = new Map<number, (typeof mergedBox)[number] & { type: string }>();
    mergedBox.forEach((movie) => {
      uniqueBoxMoviesMap.set(movie.id, {
        ...movie,
        type: "박스오피스",
      });
    });

    const uniqueBoxMovies = Array.from(uniqueBoxMoviesMap.values());
    const monthlyAdminEvents = buildMonthlyAdminEventsForCurrentMonth();
    const results = [...uniqueBoxMovies, ...reOpening, ...customEvents, ...monthlyAdminEvents, ...holidays];

    return NextResponse.json({ results, option: { initialView: "dayGridMonth" } });
  } catch (error) {
    console.error("Failed to load calendar capture data", error);
    return NextResponse.json({ results: [], option: { initialView: "dayGridMonth" } }, { status: 500 });
  }
}



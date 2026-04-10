import * as cheerio from "cheerio";

type MovieInput = {
  movieCd: string;
  movieNm: string;
};

type ShowtimeItem = {
  theater: string;
  brand: string;
  time: string;
  endTime: string;
  screen: string;
  sourceQuery: string;
};

type MovieShowtime = {
  movieCd: string;
  movieNm: string;
  items: ShowtimeItem[];
  searchUrl: string;
  fetchedAt: string;
};

const NAVER_SEARCH_URL = "https://search.naver.com/search.naver";
const NAVER_SCHEDULE_API_URL = "https://ts-proxy.naver.com/dcontent/nqapirender.nhn";
const SEOUL_CODE = "\uC11C\uC6B8\uD2B9\uBCC4\uC2DC";
const SHOWTIME_QUERY = "\uC0C1\uC601\uC77C\uC815";

const cache = new Map<string, { expiresAt: number; value: unknown }>();

function getCached<T>(key: string) {
  const item = cache.get(key);
  if (!item || item.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }

  return item.value as T;
}

function setCached(key: string, value: unknown, ttlMs: number) {
  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  });
}

async function fetchText(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  return response.text();
}

function stripJsonp(text: string) {
  const start = text.indexOf("(");
  const end = text.lastIndexOf(")");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Invalid Naver widget response.");
  }

  return text.slice(start + 1, end);
}

function getBrand(theater: string) {
  if (theater.includes("CGV")) {
    return "CGV";
  }

  if (theater.includes("\uB86F\uB370\uC2DC\uB124\uB9C8")) {
    return "Lotte Cinema";
  }

  if (theater.includes("\uBA54\uAC00\uBC15\uC2A4")) {
    return "Megabox";
  }

  return "Other";
}

function uniqItems(items: ShowtimeItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.theater}-${item.screen}-${item.time}-${item.endTime}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function parseNaverMovieId(html: string) {
  const scriptMatch = html.match(/"u9"\s*:\s*"[^"]+"\s*,\s*"u2"\s*:\s*"(\d+)"/);
  if (scriptMatch?.[1]) {
    return scriptMatch[1];
  }

  const fallbackMatch = html.match(/[?&]u2=(\d+)/);
  return fallbackMatch?.[1] ?? null;
}

async function getNaverMovieId(movieName: string) {
  const cacheKey = `naver-movie-id:${movieName}`;
  const cached = getCached<string | null>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const query = `${movieName} ${SHOWTIME_QUERY}`;
  const url = `${NAVER_SEARCH_URL}?query=${encodeURIComponent(query)}`;
  const html = await fetchText(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://search.naver.com/",
    },
    cache: "no-store",
  });
  const naverMovieId = parseNaverMovieId(html);

  setCached(cacheKey, naverMovieId, 1000 * 60 * 60);
  return naverMovieId;
}

function parseScheduleHtml(html: string) {
  const $ = cheerio.load(html);
  const items: ShowtimeItem[] = [];

  $("li._scrolling_wrapper").each((_, theaterElement) => {
    const theaterRoot = $(theaterElement);
    const theater = theaterRoot.find(".this_link_place").first().text().replace(/\s+/g, " ").trim();

    if (!theater) {
      return;
    }

    const brand = getBrand(theater);

    theaterRoot.find("li._time_check").each((__, timeElement) => {
      const timeRoot = $(timeElement);
      const timeText = timeRoot.find(".this_text_time").first().text().replace(/\s+/g, "").trim();
      const timeRange = timeText.match(/(\d{1,2}:\d{2})~(\d{1,2}:\d{2})/);
      const time = timeRange?.[1] ?? timeRoot.find(".this_point_big").first().text().trim();
      const endTime = timeRange?.[2] ?? "";
      const screen = timeRoot.find(".this_text_place").first().text().replace(/\s+/g, " ").trim();
      const href = timeRoot.find("a.area_link").first().attr("href") ?? "";

      if (!time) {
        return;
      }

      items.push({
        theater,
        brand,
        time,
        endTime,
        screen,
        sourceQuery: href,
      });
    });
  });

  return uniqItems(items).sort((a, b) => {
    if (a.time === b.time) {
      return a.theater.localeCompare(b.theater);
    }

    return a.time.localeCompare(b.time);
  });
}

async function fetchNaverSchedule(movieName: string, naverMovieId: string, date: string) {
  const params = new URLSearchParams({
    where: "nexearch",
    pkid: "68",
    key: "MovieAPIforScheduleListKB",
    u9: movieName,
    u2: naverMovieId,
    u1: "",
    u3: date,
    u4: SEOUL_CODE,
    u5: "",
    u6: "",
    _callback: "tovieTimetable",
  });

  const text = await fetchText(`${NAVER_SCHEDULE_API_URL}?${params}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://search.naver.com/",
    },
    cache: "no-store",
  });
  const payload = JSON.parse(stripJsonp(text)) as {
    items?: Array<{
      date?: string;
      html?: string;
    }>;
  };

  const current = payload.items?.find((item) => item.date === date) ?? payload.items?.[0];
  return parseScheduleHtml(current?.html ?? "");
}

export async function fetchNaverMovieShowtimes(movie: MovieInput, date: string): Promise<MovieShowtime> {
  const cacheKey = `naver-widget-showtimes:${movie.movieCd}:${movie.movieNm}:${date}`;
  const cached = getCached<MovieShowtime>(cacheKey);
  if (cached) {
    return cached;
  }

  const naverMovieId = await getNaverMovieId(movie.movieNm);
  const items = naverMovieId ? await fetchNaverSchedule(movie.movieNm, naverMovieId, date) : [];
  const searchUrl = `${NAVER_SEARCH_URL}?query=${encodeURIComponent(`${movie.movieNm} ${SHOWTIME_QUERY}`)}`;

  const showtime = {
    movieCd: movie.movieCd,
    movieNm: movie.movieNm,
    items,
    searchUrl,
    fetchedAt: new Date().toISOString(),
  };

  setCached(cacheKey, showtime, 1000 * 60 * 30);
  return showtime;
}

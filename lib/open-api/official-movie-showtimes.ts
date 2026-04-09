import * as cheerio from "cheerio";
import crypto from "crypto";

type MovieInput = {
  movieCd: string;
  movieNm: string;
};

type ShowtimeItem = {
  theater: string;
  brand: string;
  time: string;
  sourceQuery: string;
};

type MovieShowtime = {
  movieCd: string;
  movieNm: string;
  items: ShowtimeItem[];
  searchUrl: string;
  fetchedAt: string;
};

type LotteCinema = {
  DivisionCode: number;
  DetailDivisionCode: string;
  CinemaID: number;
  CinemaNameKR: string;
  CinemaAddrSummary?: string;
};

type MegaboxBranch = {
  brchNo: string;
  brchName: string;
  city?: string;
};

type CgvSite = {
  siteNo: string;
  siteNm: string;
};

const SEOUL_REGION_NAME = "\uC11C\uC6B8";

const CGV_PROXY_BASE_URL = "https://movie.metadev.kr/proxy/api-mobile.cgv.co.kr";
const CGV_HMAC_KEY = "ydqXY0ocnFLmJGHr_zNzFcpjwAsXq_8JcBNURAkRscg";
const LOTTE_BASE_URL = "https://www.lottecinema.co.kr";
const MEGABOX_BASE_URL = "https://www.megabox.co.kr";

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

function normalizeTitle(value: string) {
  return value.replace(/\s+/g, "").replace(/[^\w\uAC00-\uD7A3]/g, "").toLowerCase();
}

function isSameMovie(a: string, b: string) {
  const left = normalizeTitle(a);
  const right = normalizeTitle(b);
  return left === right || left.includes(right) || right.includes(left);
}

function formatTime(value: string) {
  if (/^\d{4}$/.test(value)) {
    return `${value.slice(0, 2)}:${value.slice(2, 4)}`;
  }

  return value;
}

function uniqItems(items: ShowtimeItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.brand}-${item.theater}-${item.time}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>) {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  return response.json();
}

async function fetchText(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  return response.text();
}

async function fetchCgv(path: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signPath = new URL(`https://placeholder${path}`).pathname;
  const signature = crypto
    .createHmac("sha256", CGV_HMAC_KEY)
    .update(`${timestamp}|${signPath}|`)
    .digest("base64");

  return fetchJson(`${CGV_PROXY_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "ko-KR",
      "User-Agent": "Mozilla/5.0",
      "X-TIMESTAMP": timestamp,
      "X-SIGNATURE": signature,
    },
    cache: "no-store",
  });
}

async function getCgvSites() {
  const cacheKey = "cgv-sites";
  const cached = getCached<CgvSite[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchCgv("/cnm/atkt/searchRegnList?coCd=A420");
  const sites = ((data as any).data ?? [])
    .filter((region: any) => region.regnGrpNm === SEOUL_REGION_NAME)
    .flatMap((region: any) => region.siteList ?? [])
    .map((site: any) => ({
      siteNo: site.siteNo,
      siteNm: site.siteNm,
    })) as CgvSite[];

  setCached(cacheKey, sites, 1000 * 60 * 60);
  return sites;
}

async function getLotteCinemas() {
  const cacheKey = "lotte-cinemas";
  const cached = getCached<LotteCinema[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const form = new FormData();
  form.append(
    "ParamList",
    JSON.stringify({
      MethodName: "GetCinemaItems",
      channelType: "HO",
      osType: "W",
      osVersion: "Mozilla/5.0",
    }),
  );

  const data = await fetchJson(`${LOTTE_BASE_URL}/LCWS/Cinema/CinemaData.aspx`, {
    method: "POST",
    body: form,
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  const cinemas = (((data as any).Cinemas?.Items ?? []) as LotteCinema[]).filter(
    (item) => item.DivisionCode === 1 && (item.CinemaAddrSummary ?? "").includes(SEOUL_REGION_NAME),
  );
  setCached(cacheKey, cinemas, 1000 * 60 * 60);
  return cinemas;
}

async function getMegaboxBranches() {
  const cacheKey = "megabox-branches";
  const cached = getCached<MegaboxBranch[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const html = await fetchText(`${MEGABOX_BASE_URL}/theater/list`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  const $ = cheerio.load(html);
  const branches: MegaboxBranch[] = [];

  $(".theater-place")
    .each((_, placeElement) => {
      const cityName = $(placeElement).find(".sel-city").text().trim();
      const theaterList = $(placeElement).next(".theater-list");

      theaterList.find("li").each((_, element) => {
        const branch = $(element);
        const brchNo = branch.attr("data-brch-no")?.trim() ?? "";
        const brchName = branch.text().trim();

        if (brchNo && brchName && cityName === SEOUL_REGION_NAME) {
          branches.push({ brchNo, brchName, city: cityName });
        }
      });
    });

  setCached(cacheKey, branches, 1000 * 60 * 60);
  return branches;
}

async function fetchCgvMovieShowtimes(movie: MovieInput, date: string) {
  let sites: CgvSite[] = [];

  try {
    sites = await getCgvSites();
  } catch (error) {
    console.error(error);
    return [];
  }

  const results = await mapWithConcurrency(sites, 8, async (site) => {
    try {
      const data = await fetchCgv(
        `/cnm/atkt/searchMovScnInfo?coCd=A420&rtctlScopCd=08&siteNo=${site.siteNo}&scnYmd=${date.replaceAll("-", "")}`,
      );

      return ((data as any).data ?? [])
        .filter((item: any) => isSameMovie(item.prodNm ?? item.movNm ?? "", movie.movieNm))
        .map(
          (item: any): ShowtimeItem => ({
            theater: `CGV ${site.siteNm}`,
            brand: "CGV",
            time: formatTime(item.scnsrtTm),
            sourceQuery: `cgv:${site.siteNo}:${date}`,
          }),
        );
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  return results.flat();
}

async function fetchLotteMovieShowtimes(movie: MovieInput, date: string) {
  let cinemas: LotteCinema[] = [];

  try {
    cinemas = await getLotteCinemas();
  } catch (error) {
    console.error(error);
    return [];
  }

  const results = await mapWithConcurrency(cinemas, 6, async (cinema) => {
    const form = new FormData();
    form.append(
      "ParamList",
      JSON.stringify({
        MethodName: "GetPlaySequence",
        channelType: "HO",
        osType: "W",
        osVersion: "Mozilla/5.0",
        playDate: date,
        cinemaID: `${cinema.DivisionCode}|${cinema.DetailDivisionCode}|${cinema.CinemaID}`,
        representationMovieCode: "",
      }),
    );

    try {
      const data = await fetchJson(`${LOTTE_BASE_URL}/LCWS/Ticketing/TicketingData.aspx`, {
        method: "POST",
        body: form,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        cache: "no-store",
      });

      const items = ((data as any).PlaySeqs?.Items ?? []) as any[];
      return items
        .filter((item) => isSameMovie(item.MovieNameKR ?? "", movie.movieNm))
        .map(
          (item): ShowtimeItem => ({
            theater: `Lotte Cinema ${item.CinemaNameKR ?? cinema.CinemaNameKR}`,
            brand: "Lotte Cinema",
            time: formatTime(item.StartTime ?? ""),
            sourceQuery: `lotte:${cinema.CinemaID}:${date}`,
          }),
        );
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  return results.flat();
}

async function fetchMegaboxMovieShowtimes(movie: MovieInput, date: string) {
  let branches: MegaboxBranch[] = [];

  try {
    branches = await getMegaboxBranches();
  } catch (error) {
    console.error(error);
    return [];
  }

  const results = await mapWithConcurrency(branches, 8, async (branch) => {
    const params = new URLSearchParams({
      brchNm: branch.brchName,
      brchNo: branch.brchNo,
      brchNo1: branch.brchNo,
      masterType: "brch",
      playDe: date.replaceAll("-", ""),
      firstAt: "N",
    });

    try {
      const text = await fetchText(`${MEGABOX_BASE_URL}/on/oh/ohc/Brch/schedulePage.do`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Mozilla/5.0",
        },
        body: params.toString(),
        cache: "no-store",
      });

      const safeText = text.replaceAll('""', '"');
      const data = JSON.parse(safeText);
      const items = ((data?.megaMap?.movieFormList ?? []) as any[]).filter((item) => isSameMovie(item.rpstMovieNm ?? "", movie.movieNm));

      return items.map(
        (item): ShowtimeItem => ({
          theater: `Megabox ${branch.brchName}`,
          brand: "Megabox",
          time: formatTime(item.playStartTime ?? ""),
          sourceQuery: `megabox:${branch.brchNo}:${date}`,
        }),
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  return results.flat();
}

export async function fetchOfficialMovieShowtimes(movie: MovieInput, date: string): Promise<MovieShowtime> {
  const cacheKey = `official-showtimes:${movie.movieCd}:${date}`;
  const cached = getCached<MovieShowtime>(cacheKey);
  if (cached) {
    return cached;
  }

  const [cgv, lotte, megabox] = await Promise.allSettled([
    fetchCgvMovieShowtimes(movie, date),
    fetchLotteMovieShowtimes(movie, date),
    fetchMegaboxMovieShowtimes(movie, date),
  ]);

  const cgvItems = cgv.status === "fulfilled" ? cgv.value : [];
  const lotteItems = lotte.status === "fulfilled" ? lotte.value : [];
  const megaboxItems = megabox.status === "fulfilled" ? megabox.value : [];

  const showtime = {
    movieCd: movie.movieCd,
    movieNm: movie.movieNm,
    items: uniqItems([...cgvItems, ...lotteItems, ...megaboxItems]).sort((a, b) => {
      if (a.theater === b.theater) {
        return a.time.localeCompare(b.time);
      }

      return a.theater.localeCompare(b.theater);
    }),
    searchUrl: `${LOTTE_BASE_URL}/NLCMW/Ticketing`,
    fetchedAt: new Date().toISOString(),
  };

  setCached(cacheKey, showtime, 1000 * 60 * 30);
  return showtime;
}

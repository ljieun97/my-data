import * as cheerio from "cheerio";
import type { AwardCategory, AwardCeremony, AwardsSourceSummary } from "@/lib/awards/types";
import { searchMovieLocalizedTitle } from "@/lib/open-api/tmdb-server";

type AwardsSourceAdapter = AwardsSourceSummary & {
  getCeremony: (year: number) => Promise<AwardCeremony>;
};

function normalizeLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.replace(/\u00a0/g, " ").replace(/^#+\s*/, "").trim())
    .filter(Boolean);
}

function parseBaftaCategories(html: string) {
  const $ = cheerio.load(html);
  const lines = normalizeLines($.root().text());
  const resultsHeaderIndex = lines.findIndex((line) => /^\d{4}\s+Results$/i.test(line));

  if (resultsHeaderIndex < 0) {
    return [] as AwardCategory[];
  }

  const summaryPattern = /^(.+?)\s+Number of items:\(\d+\)\s+Winner:/;
  const baftaStopPatterns = [
    /^Search awards database$/i,
    /^Awards$/i,
    /^\d{4}\s*-\s*results$/i,
    /^\d{4}\s+Results$/i,
    /^\d{4}\s+Film$/i,
    /^EE BAFTA Film Awards$/i,
    /^Awards Number of items shown:\(\d+\)$/i,
  ];
  const categories: AwardCategory[] = [];
  let currentCategory: AwardCategory | null = null;
  let index = resultsHeaderIndex + 1;
  let seenFirstCategory = false;

  while (index < lines.length) {
    const summaryMatch = lines[index].match(summaryPattern);

    if (summaryMatch) {
      seenFirstCategory = true;
      if (currentCategory?.entries.length) {
        categories.push(currentCategory);
      }

      currentCategory = {
        name: summaryMatch[1].replace(/^\*\s*/, "").trim(),
        entries: [],
      };
      index += 1;
      continue;
    }

    if (seenFirstCategory && baftaStopPatterns.some((pattern) => pattern.test(lines[index]))) {
      break;
    }

    if (!currentCategory) {
      index += 1;
      continue;
    }

    const marker = lines[index];

    if (marker !== "Winner" && marker !== "Nominee") {
      index += 1;
      continue;
    }

    index += 1;
    const block: string[] = [];

    while (index < lines.length) {
      if (
        lines[index] === "Winner" ||
        lines[index] === "Nominee" ||
        summaryPattern.test(lines[index]) ||
        baftaStopPatterns.some((pattern) => pattern.test(lines[index]))
      ) {
        break;
      }

      block.push(lines[index].replace(/^###\s*/, "").replace(/^\*\s*/, "").trim());
      index += 1;
    }

    const currentCategoryName = currentCategory.name;
    const filtered = block.filter(
      (line) =>
        line &&
        line !== currentCategoryName &&
        line !== "Publicly Voted" &&
        !baftaStopPatterns.some((pattern) => pattern.test(line)),
    );

    if (!filtered.length) {
      continue;
    }

    currentCategory.entries.push({
      status: marker === "Winner" ? "winner" : "nominee",
      primary: filtered[0],
      details: filtered.slice(1),
    });
  }

  if (currentCategory?.entries.length) {
    categories.push(currentCategory);
  }

  return categories;
}

function looksLikeCannesAwardLine(value: string) {
  return (
    /palme|grand prix|prize|award|distinction|caméra|cinef/i.test(value) ||
    value === "Special Prize"
  );
}

function parseCannesEntry(title: string, byText: string | null) {
  if (!byText) {
    return {
      primary: title,
      details: [] as string[],
      relation: undefined,
    };
  }

  const normalized = byText.replace(/\u00a0/g, " ").trim();

  if (/^by\s+/i.test(normalized)) {
    return {
      primary: title,
      details: [normalized.replace(/^by\s+/i, "").trim()],
      relation: "by" as const,
    };
  }

  if (/^for\s+/i.test(normalized)) {
    return {
      primary: normalized.replace(/^for\s+/i, "").trim(),
      details: [title],
      relation: "for" as const,
    };
  }

  return {
    primary: title,
    details: [normalized],
    relation: undefined,
  };
}

function parseOscarCategories(html: string) {
  const $ = cheerio.load(html);
  const categoryRoot = $(
    ".field--name-field-award-categories.field--type-entity-reference-revisions.field--label-hidden.field__items",
  ).first();

  if (!categoryRoot.length) {
    return [] as AwardCategory[];
  }

  const categories: AwardCategory[] = [];
  categoryRoot.children(".field__item").each((_, element) => {
    const item = $(element);
    const lines = normalizeLines(item.text());
    const categoryName =
      item.find("h1, h2, h3, h4, h5, h6").first().text().replace(/\[\d+\]/g, "").trim() ||
      lines.find((line) => line && !/^(Winner|Nominee|Nominees|Awards|Winners and nominees|View by Category|Select a Category)/i.test(line)) ||
      "";

    if (!categoryName) {
      return;
    }

    const category: AwardCategory = {
      name: categoryName,
      entries: [],
    };

    let index = lines.findIndex((line) => line === categoryName);
    if (index < 0) {
      index = 0;
    } else {
      index += 1;
    }

    while (index < lines.length) {
      const marker = lines[index];

      if (marker !== "Winner" && marker !== "Nominee" && marker !== "Nominees") {
        index += 1;
        continue;
      }

      const status = marker === "Winner" ? "winner" : "nominee";
      index += 1;
      const block: string[] = [];

      while (index < lines.length) {
        const next = lines[index];

        if (next === "Winner" || next === "Nominee" || next === "Nominees") {
          break;
        }

        block.push(next);
        index += 1;
      }

      const filtered = block.filter(
        (line) =>
          line &&
          line !== categoryName &&
          line !== "Awards" &&
          line !== "Winners and nominees" &&
          line !== "View by Category" &&
          !/^Select a Category/i.test(line),
      );

      if (!filtered.length) {
        continue;
      }

      category.entries.push({
        status,
        primary: filtered[0],
        details: filtered.slice(1),
      });
    }

    if (category.entries.length) {
      categories.push(category);
    }
  });

  const bestPictureIndex = categories.findIndex((category) => /^Best Picture$/i.test(category.name));

  if (bestPictureIndex > 0) {
    const [bestPicture] = categories.splice(bestPictureIndex, 1);
    categories.unshift(bestPicture);
  }

  return categories;
}

function parseCannesCategories(html: string) {
  const $ = cheerio.load(html);
  const listContainer = $(".list_container").first();
  const categories: AwardCategory[] = [];

  if (!listContainer.length) {
    return [] as AwardCategory[];
  }

  listContainer.children("div").each((_, element) => {
    const item = $(element);
    const title = item
      .find("p")
      .first()
      .text()
      .replace(/\u00a0/g, " ")
      .trim();

    if (!title) {
      return;
    }

    const spanTexts = item
      .find("span")
      .map((__, span) => $(span).text().replace(/\u00a0/g, " ").trim())
      .get()
      .filter(Boolean);

    const byText = spanTexts.find((text) => /^by\s+/i.test(text) || /^for\s+/i.test(text)) ?? null;
    const awardText = spanTexts.find((text) => looksLikeCannesAwardLine(text)) ?? null;

    if (!awardText) {
      return;
    }

    const entry = parseCannesEntry(title, byText);

    categories.push({
      name: awardText,
      section: undefined,
      entries: [
        {
          status: "winner" as const,
          primary: entry.primary,
          details: entry.details,
          relation: entry.relation,
        },
      ],
    });
  });

  return categories;
}

function parseWikipediaInfobox(html: string) {
  const $ = cheerio.load(html);
  const data = new Map<string, string>();

  $("table.infobox tr").each((_, row) => {
    const header = $(row).find("th").first().text().replace(/\u00a0/g, " ").trim();
    const value = $(row).find("td").first().text().replace(/\u00a0/g, " ").replace(/\[\d+\]/g, "").trim();

    if (header && value) {
      data.set(header, value);
    }
  });

  return data;
}

function shouldLocalizePrimary(categoryName: string) {
  const normalized = categoryName.toLowerCase();

  return (
    normalized.includes("best picture") ||
    normalized.includes("best film") ||
    normalized.includes("animated feature") ||
    normalized.includes("documentary feature") ||
    normalized.includes("international feature") ||
    normalized.includes("palme") ||
    normalized.includes("grand prix") ||
    normalized.includes("jury prize") ||
    normalized.includes("camera d'or") ||
    normalized.includes("caméra d'or") ||
    normalized.includes("최우수작품상") ||
    normalized.includes("최다 수상작") ||
    normalized.includes("최다 노미네이트")
  );
}

function shouldLocalizeDetail(detail: string) {
  const normalized = detail.toLowerCase();

  if (!detail.trim()) {
    return false;
  }

  if (
    normalized === "in competition" ||
    normalized === "un certain regard" ||
    normalized === "feature films" ||
    normalized === "short films" ||
    normalized === "la cinef"
  ) {
    return false;
  }

  return !/[A-Z][a-z]+\s[A-Z][a-z]+/.test(detail);
}

async function localizeAwardCeremonyTitles(ceremony: AwardCeremony) {
  const yearHints =
    ceremony.slug === "cannes"
      ? [ceremony.ceremonyYear]
      : [ceremony.ceremonyYear - 1, ceremony.ceremonyYear, ceremony.ceremonyYear - 2];

  const categories = await Promise.all(
    ceremony.categories.map(async (category) => {
      const entries = await Promise.all(
        category.entries.map(async (entry) => {
          const localizedPrimary =
            ceremony.slug !== "bluedragon" &&
            (shouldLocalizePrimary(category.name) || (ceremony.slug === "cannes" && entry.relation === "for"))
              ? await searchMovieLocalizedTitle(entry.primary, yearHints)
              : entry.primary;
          const localizedDetails =
            ceremony.slug === "cannes" || ceremony.slug === "bluedragon"
              ? entry.details
              : await Promise.all(
                  entry.details.map(async (detail) =>
                    shouldLocalizeDetail(detail) ? searchMovieLocalizedTitle(detail, yearHints) : detail,
                  ),
                );

          return {
            ...entry,
            primary: localizedPrimary,
            details: localizedDetails,
          };
        }),
      );

      return {
        ...category,
        entries,
      };
    }),
  );

  return {
    ...ceremony,
    categories,
  };
}

function normalizeBlueDragonText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*$/, "")
    .trim();
}

function parseBlueDragonCategories(html: string) {
  const $ = cheerio.load(html);
  const awardSection = $("section.awardH").first();

  if (!awardSection.length) {
    return [] as AwardCategory[];
  }

  return awardSection
    .find(".award-box")
    .map((_, element) => {
      const item = $(element);
      const categoryName = normalizeBlueDragonText(item.find("h5").first().text());

      if (!categoryName) {
        return null;
      }

      const entries = item
        .find("li")
        .map((__, li) => {
          const entry = $(li);
          const movieTitle = normalizeBlueDragonText(entry.find("em").first().text());
          const cloned = entry.clone();
          cloned.find("img, em").remove();
          const personOrLabel = normalizeBlueDragonText(cloned.text());
          const isWinner = entry.hasClass("red_c");

          if (movieTitle && (!personOrLabel || personOrLabel === movieTitle)) {
            return {
              status: isWinner ? "winner" : "nominee",
              primary: movieTitle,
              details: [],
            };
          }

          return {
            status: isWinner ? "winner" : "nominee",
            primary: personOrLabel || movieTitle,
            details: movieTitle ? [movieTitle] : [],
          };
        })
        .get()
        .filter((entry) => entry.primary);

      if (!entries.length) {
        return null;
      }

      return {
        name: categoryName,
        entries,
      };
    })
    .get()
    .filter(Boolean) as AwardCategory[];
}

function getBlueDragonEditionNumber(year: number) {
  if (year < 1990) {
    return null;
  }

  return year - 1979;
}

function formatOrdinal(value: number) {
  const mod100 = value % 100;

  if (mod100 >= 11 && mod100 <= 13) {
    return `${value}th`;
  }

  const mod10 = value % 10;

  if (mod10 === 1) return `${value}st`;
  if (mod10 === 2) return `${value}nd`;
  if (mod10 === 3) return `${value}rd`;
  return `${value}th`;
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; awards-bot/1.0)",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch awards source: ${response.status} ${url}`);
  }

  return response.text();
}

const awardsSourceAdapters: AwardsSourceAdapter[] = [
  {
    slug: "oscar",
    name: "Academy Awards",
    country: "미국",
    description: "Official Academy Awards ceremony pages.",
    sourceType: "official",
    latestYear: 2026,
    sourceBaseUrl: "https://www.oscars.org/oscars/ceremonies",
    getCeremony: async (year: number) => {
      const sourceUrl = `https://www.oscars.org/oscars/ceremonies/${year}`;
      const html = await fetchHtml(sourceUrl);
      const categories = parseOscarCategories(html);

      return localizeAwardCeremonyTitles({
        slug: "oscar",
        name: "Academy Awards",
        ceremonyYear: year,
        country: "미국",
        sourceType: "official",
        sourceUrl,
        headline: `${year} Academy Awards`,
        subheadline: "Official Academy Awards archive",
        categories,
      });
    },
  },
  {
    slug: "bafta",
    name: "BAFTA Film Awards",
    country: "영국",
    description: "BAFTA official film awards results archive.",
    sourceType: "official",
    latestYear: 2026,
    sourceBaseUrl: "https://www.bafta.org/awards/film",
    getCeremony: async (year: number) => {
      const sourceUrl = "https://www.bafta.org/awards/film/";
      const html = await fetchHtml(sourceUrl);
      const categories = parseBaftaCategories(html);

      return localizeAwardCeremonyTitles({
        slug: "bafta",
        name: "BAFTA Film Awards",
        ceremonyYear: year,
        country: "영국",
        sourceType: "official",
        sourceUrl,
        headline: `${year} BAFTA Film Awards`,
        subheadline: "Official BAFTA results archive",
        categories,
      });
    },
  },
  {
    slug: "bluedragon",
    name: "Blue Dragon Film Awards",
    country: "대한민국",
    description: "Blue Dragon Awards official history pages.",
    sourceType: "official",
    latestYear: 2025,
    sourceBaseUrl: "http://www.blueaward.co.kr/bbs/board.php?bo_table=blue_2021_awards",
    getCeremony: async (year: number) => {
      const historyNumber = getBlueDragonEditionNumber(year);

      if (!historyNumber) {
        throw new Error(`Blue Dragon ceremony year is not supported: ${year}`);
      }

      const ordinalEdition = formatOrdinal(historyNumber);
      const sourceUrl = `http://www.blueaward.co.kr/bbs/board.php?bo_table=blue_2021_awards&history_no=${historyNumber}`;
      const html = await fetchHtml(sourceUrl);
      const categories = parseBlueDragonCategories(html);

      return localizeAwardCeremonyTitles({
        slug: "bluedragon",
        name: "Blue Dragon Film Awards",
        ceremonyYear: year,
        country: "대한민국",
        sourceType: "official",
        sourceUrl,
        headline: `${ordinalEdition} Blue Dragon Film Awards`,
        subheadline: "Official Blue Dragon Awards nominees and winners",
        categories,
      });
    },
  },
  {
    slug: "cannes",
    name: "Festival de Cannes",
    country: "프랑스",
    description: "Festival de Cannes official competition archive.",
    sourceType: "official",
    latestYear: 2025,
    sourceBaseUrl: "https://www.festival-cannes.com/en/retrospective",
    getCeremony: async (year: number) => {
      const sourceUrl = `https://www.festival-cannes.com/en/retrospective/${year}/awards/`;
      const awardsHtml = await fetchHtml(sourceUrl);
      const categories = parseCannesCategories(awardsHtml);

      return localizeAwardCeremonyTitles({
        slug: "cannes",
        name: "Festival de Cannes",
        ceremonyYear: year,
        country: "프랑스",
        sourceType: "official",
        sourceUrl,
        headline: `${year} Festival de Cannes`,
        subheadline: "Official Cannes competition archive",
        categories,
      });
    },
  },
];

export function getAwardsSources() {
  return awardsSourceAdapters.map(({ getCeremony, ...summary }) => summary);
}

export function getAwardsSource(slug: string) {
  return awardsSourceAdapters.find((source) => source.slug === slug) ?? null;
}

export async function getAwardCeremony(slug: string, year?: number) {
  const source = getAwardsSource(slug);

  if (!source) {
    return null;
  }

  const targetYear = Number.isFinite(year) ? Number(year) : source.latestYear;
  return source.getCeremony(targetYear);
}

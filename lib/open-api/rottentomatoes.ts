import * as cheerio from "cheerio";

type RottenTomatoesMatch = {
  title: string;
  year?: string;
  url: string;
  tomatometer?: string | null;
};

export type RottenTomatoesScore = {
  title: string;
  year?: string;
  url: string;
  tomatometer?: string | null;
  popcornmeter?: string | null;
};

function normalizeTitle(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function scoreCandidate(match: RottenTomatoesMatch, queryTitle: string, queryYear?: string) {
  const normalizedQuery = normalizeTitle(queryTitle);
  const normalizedMatch = normalizeTitle(match.title);
  let score = 0;

  if (normalizedMatch === normalizedQuery) {
    score += 8;
  } else if (
    normalizedMatch.includes(normalizedQuery) ||
    normalizedQuery.includes(normalizedMatch)
  ) {
    score += 4;
  }

  if (queryYear && match.year === queryYear) {
    score += 6;
  }

  if (match.tomatometer) {
    score += 1;
  }

  return score;
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return null;
  }

  return response.text();
}

async function searchRottenTomatoesMovie(title: string, year?: string) {
  const searchUrl = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(title)}`;
  const html = await fetchHtml(searchUrl);

  if (!html) {
    return null;
  }

  const $ = cheerio.load(html);
  const candidates: RottenTomatoesMatch[] = [];

  $("search-page-result[type='movie'] search-page-media-row").each((_, row) => {
    const element = $(row);
    const link = element.find("a[data-qa='info-name']").first();
    const href = link.attr("href");

    if (!href) {
      return;
    }

    candidates.push({
      title: link.text().trim(),
      year: element.attr("release-year")?.trim(),
      url: href.startsWith("http") ? href : `https://www.rottentomatoes.com${href}`,
      tomatometer: element.attr("tomatometer-score")?.trim() || null,
    });
  });

  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, title, year),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.candidate ?? null;
}

export async function getRottenTomatoesScore(title: string, year?: string) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return null;
  }

  const matchedMovie = await searchRottenTomatoesMovie(trimmedTitle, year);

  if (!matchedMovie) {
    return null;
  }

  const html = await fetchHtml(matchedMovie.url);

  if (!html) {
    return {
      title: matchedMovie.title,
      year: matchedMovie.year,
      url: matchedMovie.url,
      tomatometer: matchedMovie.tomatometer ?? null,
      popcornmeter: null,
    };
  }

  const $ = cheerio.load(html);
  const scoreJson = $("#media-scorecard-json").text().trim();

  if (!scoreJson) {
    return {
      title: matchedMovie.title,
      year: matchedMovie.year,
      url: matchedMovie.url,
      tomatometer: matchedMovie.tomatometer ?? null,
      popcornmeter: null,
    };
  }

  try {
    const parsed = JSON.parse(scoreJson) as {
      criticsScore?: { score?: string; scorePercent?: string };
      audienceScore?: { score?: string; scorePercent?: string };
    };

    return {
      title: matchedMovie.title,
      year: matchedMovie.year,
      url: matchedMovie.url,
      tomatometer:
        parsed.criticsScore?.scorePercent ??
        (parsed.criticsScore?.score ? `${parsed.criticsScore.score}%` : matchedMovie.tomatometer ?? null),
      popcornmeter:
        parsed.audienceScore?.scorePercent ??
        (parsed.audienceScore?.score ? `${parsed.audienceScore.score}%` : null),
    };
  } catch (error) {
    console.error("Failed to parse Rotten Tomatoes score JSON", error);
    return {
      title: matchedMovie.title,
      year: matchedMovie.year,
      url: matchedMovie.url,
      tomatometer: matchedMovie.tomatometer ?? null,
      popcornmeter: null,
    };
  }
}

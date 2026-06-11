import { NextResponse } from "next/server";

type ProviderItem = {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
  display_priority?: number;
};

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.API_KEY_TMDB || process.env.NEXT_PUBLIC_API_KEY_TMDB;

function normalizeProviders(items: ProviderItem[]) {
  const unique = new Map<number, ProviderItem>();

  for (const item of items) {
    if (!item?.provider_id || !item?.logo_path || item.provider_id === 1796) continue;
    if (!unique.has(item.provider_id)) {
      unique.set(item.provider_id, item);
    }
  }

  return Array.from(unique.values()).sort((a, b) => {
    const priorityA = Number(a.display_priority ?? 9999);
    const priorityB = Number(b.display_priority ?? 9999);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return String(a.provider_name).localeCompare(String(b.provider_name));
  });
}

async function loadCatalog(type: "movie" | "tv") {
  const url = `${BASE_URL}/watch/providers/${type}?watch_region=KR&api_key=${API_KEY}`;
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) {
    throw new Error(`Failed to load ${type} provider catalog: ${response.status}`);
  }

  const payload = (await response.json()) as { results?: ProviderItem[] };
  return Array.isArray(payload.results) ? payload.results : [];
}

export async function GET() {
  try {
    const [movieProviders, tvProviders] = await Promise.all([loadCatalog("movie"), loadCatalog("tv")]);
    const results = normalizeProviders([...movieProviders, ...tvProviders]);

    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600" } },
    );
  } catch (error) {
    console.error("Failed to load provider catalog", error);
    return NextResponse.json({ results: [], error: "Failed to load provider catalog" }, { status: 500 });
  }
}

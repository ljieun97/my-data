import { NextRequest, NextResponse } from "next/server";
import { getProviders } from "@/lib/open-api/tmdb-server";

type ProviderRequestItem = {
  id: number | string;
  type: string;
};

type ProviderItem = {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
};

function normalizeItems(items: ProviderRequestItem[]) {
  const uniqueItems = new Map<string, ProviderRequestItem>();

  for (const item of items) {
    const id = Number(item?.id);
    const type = item?.type;

    if (!Number.isFinite(id) || !["movie", "tv"].includes(type)) {
      continue;
    }

    uniqueItems.set(`${type}:${id}`, { id, type });
  }

  return Array.from(uniqueItems.values());
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
) {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as { items?: ProviderRequestItem[] };
    const items = normalizeItems(Array.isArray(payload.items) ? payload.items : []);

    const results = await mapWithConcurrency(items, 6, async (item) => {
      try {
        const providers = await getProviders(item.type, item.id);
        const flatrates = Array.isArray(providers?.flatrate)
          ? providers.flatrate.filter((entry: ProviderItem) => entry.provider_id !== 1796 && entry.logo_path)
          : [];

        return {
          key: `${item.type}:${Number(item.id)}`,
          flatrates,
        };
      } catch (error) {
        console.error("Failed to fetch providers", item, error);
        return {
          key: `${item.type}:${Number(item.id)}`,
          flatrates: [],
        };
      }
    });

    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("Failed to load provider batch", error);
    return NextResponse.json(
      { results: [], error: "Failed to load providers" },
      { status: 500 },
    );
  }
}

"use client";

import { useEffect, useMemo, useState } from "react";

type ProviderItem = {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
};

type ProviderRequestItem = {
  id: string | number;
  type: string;
};

const flatratesCache = new Map<string, ProviderItem[]>();
const pendingRequests = new Map<string, Promise<ProviderItem[]>>();
const queuedItems = new Map<string, ProviderRequestItem>();
const queuedResolvers = new Map<string, Array<(value: ProviderItem[]) => void>>();
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function getCacheKey(type: string, providerId: string | number) {
  return `${type}:${providerId}`;
}

function ProviderAvatar({ src, alt, index = 0 }: { src: string; alt: string; index?: number }) {
  return (
    <img
      src={src}
      alt={alt}
      className={[
        "h-6 w-6 rounded-md border border-white/80 object-cover shadow-[0_3px_8px_rgba(15,23,42,0.2)] sm:h-7 sm:w-7",
        index > 0 ? "-ml-2 sm:-ml-2.5" : "",
      ].join(" ")}
      style={{ zIndex: 10 - index }}
    />
  );
}

async function flushBatchQueue() {
  const items = Array.from(queuedItems.values());
  const resolvers = new Map(queuedResolvers);

  queuedItems.clear();
  queuedResolvers.clear();
  batchTimer = null;

  if (!items.length) {
    return;
  }

  try {
    const response = await fetch("/api/providers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error(`Failed to load providers: ${response.status}`);
    }

    const payload = (await response.json()) as {
      results?: Array<{ key: string; flatrates?: ProviderItem[] }>;
    };
    const resultsMap = new Map(
      (payload.results ?? []).map((entry) => [entry.key, Array.isArray(entry.flatrates) ? entry.flatrates : []]),
    );

    for (const item of items) {
      const key = getCacheKey(item.type, item.id);
      const flatrates = resultsMap.get(key) ?? [];
      flatratesCache.set(key, flatrates);
      pendingRequests.delete(key);

      for (const resolve of resolvers.get(key) ?? []) {
        resolve(flatrates);
      }
    }
  } catch (error) {
    console.error(error);

    for (const item of items) {
      const key = getCacheKey(item.type, item.id);
      flatratesCache.set(key, []);
      pendingRequests.delete(key);

      for (const resolve of resolvers.get(key) ?? []) {
        resolve([]);
      }
    }
  }
}

function scheduleBatchFlush() {
  if (batchTimer !== null) {
    return;
  }

  batchTimer = setTimeout(() => {
    void flushBatchQueue();
  }, 0);
}

async function loadFlatrates(type: string, providerId: string | number) {
  const cacheKey = getCacheKey(type, providerId);

  if (flatratesCache.has(cacheKey)) {
    return flatratesCache.get(cacheKey) ?? [];
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) ?? [];
  }

  const request = new Promise<ProviderItem[]>((resolve) => {
    queuedItems.set(cacheKey, { id: providerId, type });
    queuedResolvers.set(cacheKey, [...(queuedResolvers.get(cacheKey) ?? []), resolve]);
    scheduleBatchFlush();
  });

  pendingRequests.set(cacheKey, request);
  return request;
}

export default function Flatrates({ type, provider }: { type: string; provider: any }) {
  const [flatrates, setFlatrates] = useState<ProviderItem[] | null>(() => {
    const cacheKey = getCacheKey(type, provider);
    return flatratesCache.get(cacheKey) ?? null;
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (type === "movie" || type === "tv") {
        const results = await loadFlatrates(type, provider);

        if (mounted) {
          setFlatrates(results);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [provider, type]);

  const title = useMemo(() => (flatrates ?? []).map((entry) => entry.provider_name).join(", "), [flatrates]);

  if (type === "webtoon") {
    return (
      <div title={String(provider)}>
        <ProviderAvatar src={`/images/webtoon_${provider}.png`} alt={String(provider)} />
      </div>
    );
  }

  if (!flatrates?.length) {
    return null;
  }

  const visibleFlatrates = flatrates.slice(0, 3);
  const hiddenCount = flatrates.length - visibleFlatrates.length;

  return (
    <div className="flex max-w-[4.6rem] items-center justify-end" title={title}>
      {visibleFlatrates.map((flatrate, index) => (
        <ProviderAvatar
          key={flatrate.provider_id}
          src={`https://image.tmdb.org/t/p/w500/${flatrate.logo_path}`}
          alt={flatrate.provider_name}
          index={index}
        />
      ))}
      {hiddenCount > 0 ? (
        <span className="-ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-white/80 bg-slate-900 px-1 text-[9px] font-semibold text-white shadow-[0_3px_8px_rgba(15,23,42,0.2)] sm:-ml-2.5 sm:h-7 sm:min-w-7 sm:text-[10px]">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}

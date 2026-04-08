"use client";

import { getProviders } from "@/lib/open-api/tmdb-server";
import { useEffect, useMemo, useState } from "react";

type ProviderItem = {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
};

const flatratesCache = new Map<string, ProviderItem[]>();
const pendingRequests = new Map<string, Promise<ProviderItem[]>>();

function ProviderAvatar({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="h-8 w-8 rounded-md border border-white/70 object-cover shadow-sm" />;
}

async function loadFlatrates(type: string, providerId: string | number) {
  const cacheKey = `${type}:${providerId}`;

  if (flatratesCache.has(cacheKey)) {
    return flatratesCache.get(cacheKey) ?? [];
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) ?? [];
  }

  const request = (async () => {
    const results = await getProviders(type, providerId);
    const nextFlatrates = Array.isArray(results?.flatrate)
      ? results.flatrate.filter((content: ProviderItem) => content.provider_id !== 1796 && content.logo_path)
      : [];

    flatratesCache.set(cacheKey, nextFlatrates);
    pendingRequests.delete(cacheKey);
    return nextFlatrates;
  })();

  pendingRequests.set(cacheKey, request);
  return request;
}

export default function Flatrates({ type, provider }: { type: string; provider: any }) {
  const [flatrates, setFlatrates] = useState<ProviderItem[] | null>(() => {
    const cacheKey = `${type}:${provider}`;
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

  return (
    <div className="flex items-center gap-1" title={title}>
      {flatrates.slice(0, 2).map((flatrate) => (
        <ProviderAvatar
          key={flatrate.provider_id}
          src={`https://image.tmdb.org/t/p/w500/${flatrate.logo_path}`}
          alt={flatrate.provider_name}
        />
      ))}
    </div>
  );
}

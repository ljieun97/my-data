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

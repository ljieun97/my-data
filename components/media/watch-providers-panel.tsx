"use client";

import { useMemo } from "react";
import ProviderLogo from "./provider-logo";

type ProviderItem = {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
};

export default function WatchProvidersPanel({ providers }: { providers: any }) {
  const flatrateProviders = useMemo(
    () =>
      Array.isArray(providers?.flatrate)
        ? (providers.flatrate as ProviderItem[]).filter((item) => item.provider_id !== 1796 && item.logo_path)
        : [],
    [providers],
  );
  const buyProviders = useMemo(
    () =>
      Array.isArray(providers?.buy)
        ? (providers.buy as ProviderItem[]).filter((item) => item.provider_id !== 1796 && item.logo_path)
        : [],
    [providers],
  );
  const rentProviders = useMemo(
    () =>
      Array.isArray(providers?.rent)
        ? (providers.rent as ProviderItem[]).filter((item) => item.provider_id !== 1796 && item.logo_path)
        : [],
    [providers],
  );

  return (
    <section className="space-y-4 rounded-[26px] bg-slate-50/80 p-5 dark:bg-slate-900/70">
      <h4 className="text-base font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">제공처</h4>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.12em] text-slate-400 dark:text-slate-500">스트리밍</p>
          {flatrateProviders.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {flatrateProviders.map((item, index) => (
                <span key={index} title={item.provider_name}>
                  <ProviderLogo src={`https://image.tmdb.org/t/p/w500/${item.logo_path}`} alt={item.provider_name} />
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">현재 스트리밍 정보가 없습니다.</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.12em] text-slate-400 dark:text-slate-500">구매</p>
          {buyProviders.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {buyProviders.map((item, index) => (
                <span key={index} title={item.provider_name}>
                  <ProviderLogo src={`https://image.tmdb.org/t/p/w500/${item.logo_path}`} alt={item.provider_name} />
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">현재 구매 정보가 없습니다.</p>
          )}
        </div>

        {rentProviders.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.12em] text-slate-400 dark:text-slate-500">대여</p>
            <div className="flex flex-wrap gap-2">
              {rentProviders.map((item, index) => (
                <span key={index} title={item.provider_name}>
                  <ProviderLogo src={`https://image.tmdb.org/t/p/w500/${item.logo_path}`} alt={item.provider_name} />
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

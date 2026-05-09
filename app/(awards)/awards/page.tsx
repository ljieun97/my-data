import Link from "next/link";
import { getAwardCeremony, getAwardsSources } from "@/lib/awards/sources";
import { searchMovieMetaByTitleAndDate } from "@/lib/open-api/tmdb-server";

export const metadata = {
  title: "수상",
};

export const dynamic = "force-dynamic";

function getMovieYearHint(sourceSlug: string, ceremonyYear: number) {
  if (sourceSlug === "oscar" || sourceSlug === "bafta") {
    return ceremonyYear - 1;
  }

  return ceremonyYear;
}

function getRepresentativeWinnerName(categoryName: string) {
  const normalized = categoryName.toLowerCase();

  if (
    normalized.includes("best film") ||
    normalized.includes("best picture") ||
    normalized.includes("palme d'or") ||
    normalized.includes("palme d’or") ||
    normalized === "grand prix" ||
    normalized.includes("outstanding british film") ||
    normalized.includes("작품상")
  ) {
    return true;
  }

  return false;
}

export default async function AwardsPage() {
  const sources = getAwardsSources();
  const ceremonies = await Promise.all(
    sources.map(async (source) => ({
      source,
      ceremony: await getAwardCeremony(source.slug, source.latestYear),
    })),
  );
  const cards = await Promise.all(
    ceremonies.map(async ({ source, ceremony }) => {
      const representativeCategory = ceremony?.categories.find((category) =>
        getRepresentativeWinnerName(category.name),
      );
      const representativeWinner = representativeCategory?.entries.find((entry) => entry.status === "winner");
      const movieYearHint = getMovieYearHint(source.slug, source.latestYear);
      const movieMeta = representativeWinner?.primary
        ? await searchMovieMetaByTitleAndDate(representativeWinner.primary, `${movieYearHint}-01-01`)
        : null;

      return {
        source,
        representativeCategory,
        representativeWinner,
        backgroundImage: movieMeta?.backdropPath
          ? `https://image.tmdb.org/t/p/original${movieMeta.backdropPath}`
          : null,
      };
    }),
  );

  return (
    <div className="content-panel">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            시상식 아카이브
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {cards.map(({ source, representativeCategory, representativeWinner, backgroundImage }) => {
            return (
              <Link
                key={source.slug}
                href={`/awards/${source.slug}?year=${source.latestYear}`}
                className="group relative overflow-hidden border border-slate-200 bg-white px-5 py-5 transition hover:border-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-100"
              >
                {backgroundImage ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-45 transition duration-300 group-hover:scale-[1.02]"
                      style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/58 to-white/88 dark:from-slate-950/30 dark:via-slate-950/48 dark:to-slate-950/80" />
                  </>
                ) : null}

                <div className="relative flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
                        {source.name}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{source.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      최근 대표 수상작
                    </div>
                    <div className="mt-2 text-base font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
                      {representativeWinner?.primary ?? "대표 수상작 준비중"}
                    </div>
                    {representativeCategory ? (
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{representativeCategory.name}</div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-200/80 pt-4 text-sm dark:border-slate-800">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">최신 회차</div>
                      <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">{source.latestYear}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">주최 국가</div>
                      <div className="mt-1 truncate font-medium text-slate-900 dark:text-slate-100">{source.country}</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}

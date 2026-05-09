import Link from "next/link";
import { notFound } from "next/navigation";
import type { AwardEntry } from "@/lib/awards/types";
import { getAwardCeremony, getAwardsSource } from "@/lib/awards/sources";
import { searchMovieMetaByTitleAndDate } from "@/lib/open-api/tmdb-server";

export const revalidate = 86400;
export const dynamic = "force-dynamic";

function getMovieYearHint(sourceSlug: string, ceremonyYear: number) {
  if (sourceSlug === "oscar" || sourceSlug === "bafta") {
    return ceremonyYear - 1;
  }

  return ceremonyYear;
}

function isFilmCategory(categoryName: string) {
  const normalized = categoryName.toLowerCase();

  return (
    normalized.includes("best film") ||
    normalized.includes("best picture") ||
    normalized.includes("palme d'or") ||
    normalized.includes("palme d’or") ||
    normalized === "grand prix" ||
    normalized.includes("outstanding british film") ||
    normalized.includes("작품상")
  );
}

function getEntryMovieTitle(categoryName: string, entry: AwardEntry) {
  if (isFilmCategory(categoryName) || entry.relation === "for") {
    return entry.primary;
  }

  return entry.details[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const source = getAwardsSource(type);

  return {
    title: source ? source.name : "Awards",
  };
}

export default async function AwardSourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams?: Promise<{ year?: string }>;
}) {
  const { type } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedYear = Number(resolvedSearchParams.year);
  const ceremony = await getAwardCeremony(type, requestedYear);

  if (!ceremony) {
    notFound();
  }

  const movieYearHint = getMovieYearHint(ceremony.slug, ceremony.ceremonyYear);
  const categories = await Promise.all(
    ceremony.categories.map(async (category) => {
      const entries = await Promise.all(
        category.entries.map(async (entry) => {
          const movieTitle = getEntryMovieTitle(category.name, entry);
          const movieMeta = movieTitle
            ? await searchMovieMetaByTitleAndDate(movieTitle, `${movieYearHint}-01-01`)
            : null;

          return {
            ...entry,
            backgroundImage: movieMeta?.backdropPath
              ? `https://image.tmdb.org/t/p/original${movieMeta.backdropPath}`
              : null,
          };
        }),
      );

      return {
        ...category,
        entries,
      };
    }),
  );

  return (
    <div className="content-panel">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
          <Link
            href="/awards"
            className="w-fit text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100"
          >
            시상식 목록
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="page-title text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-slate-50">
              {ceremony.headline}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">{ceremony.subheadline}</p>
            <div className="w-fit border border-slate-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              {ceremony.country}
            </div>
          </div>
        </header>

        <section className="grid gap-4">
          {categories.map((category, categoryIndex) => (
            <article
              key={`${ceremony.slug}-${category.name}-${categoryIndex}`}
              className="border border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex flex-col gap-5">
                <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                  <h3 className="text-lg font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
                    {category.name}
                  </h3>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                  <div className="grid">
                    {category.entries
                      .filter((entry) => entry.status === "winner")
                      .map((entry, entryIndex) => (
                        <div
                          key={`${ceremony.slug}-${categoryIndex}-winner-${entry.primary}-${entryIndex}`}
                          className="relative h-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                        >
                          {entry.backgroundImage ? (
                            <>
                              <div
                                className="absolute inset-0 bg-cover bg-center opacity-45"
                                style={{ backgroundImage: `url(${entry.backgroundImage})` }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/55 to-white/88 dark:from-slate-950/25 dark:via-slate-950/45 dark:to-slate-950/82" />
                            </>
                          ) : null}

                          <div className="relative flex h-full flex-col gap-2 px-4 py-4">
                            <p className="text-lg font-semibold text-slate-950 dark:text-slate-50">{entry.primary}</p>
                            {entry.details.length ? (
                              <div className="flex flex-col gap-1">
                                {entry.details.map((detail, index) => (
                                  <p key={`${ceremony.slug}-${categoryIndex}-winner-detail-${entryIndex}-${index}`} className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {detail}
                                  </p>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="grid gap-3">
                    {category.entries
                      .filter((entry) => entry.status === "nominee")
                      .map((entry, entryIndex) => (
                        <div
                          key={`${ceremony.slug}-${categoryIndex}-nominee-${entry.primary}-${entryIndex}`}
                          className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                        >
                          {entry.backgroundImage ? (
                            <>
                              <div
                                className="absolute inset-0 bg-cover bg-center opacity-40"
                                style={{ backgroundImage: `url(${entry.backgroundImage})` }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-b from-white/42 via-white/62 to-white/88 dark:from-slate-950/25 dark:via-slate-950/46 dark:to-slate-950/82" />
                            </>
                          ) : null}

                          <div className="relative px-4 py-3">
                            <p className="font-medium text-slate-900 dark:text-slate-100">{entry.primary}</p>
                            {entry.details.length ? (
                              <div className="mt-1 flex flex-col gap-1">
                                {entry.details.map((detail, index) => (
                                  <p key={`${ceremony.slug}-${categoryIndex}-nominee-detail-${entryIndex}-${index}`} className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {detail}
                                  </p>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

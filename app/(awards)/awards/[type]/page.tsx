import Link from "next/link";
import { notFound } from "next/navigation";
import { getAwardCeremony, getAwardsSource } from "@/lib/awards/sources";

export const revalidate = 86400;

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
console.log(ceremony)
  if (!ceremony) {
    notFound();
  }

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
          {ceremony.categories.map((category, categoryIndex) => (
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
                  <div className="border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60">
                    {category.entries
                      .filter((entry) => entry.status === "winner")
                      .map((entry, entryIndex) => (
                        <div key={`${ceremony.slug}-${categoryIndex}-winner-${entry.primary}-${entryIndex}`} className="flex flex-col gap-2">
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
                      ))}
                  </div>

                  <div className="grid gap-3">
                    {category.entries
                      .filter((entry) => entry.status === "nominee")
                      .map((entry, entryIndex) => (
                        <div
                          key={`${ceremony.slug}-${categoryIndex}-nominee-${entry.primary}-${entryIndex}`}
                          className="border border-slate-200 px-4 py-3 dark:border-slate-800"
                        >
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

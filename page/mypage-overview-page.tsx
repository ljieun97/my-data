"use client";

import Link from "next/link";
import Title from "@/components/common/title";

type YearCount = {
  _id: string;
  count: number;
};

type SavedItem = {
  _id: string;
  id: string | number;
  type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  user_date?: string;
};

function groupItemsByMonth(items: SavedItem[]) {
  const buckets = Array.from({ length: 12 }, (_, index) => ({
    monthNumber: index + 1,
    monthLabel: `${index + 1}월`,
    items: [] as SavedItem[],
  }));

  for (const item of items) {
    const monthValue = Number(item.user_date?.slice(5, 7));

    if (!Number.isFinite(monthValue) || monthValue < 1 || monthValue > 12) {
      continue;
    }

    buckets[monthValue - 1].items.push(item);
  }

  return buckets.filter((bucket) => bucket.items.length > 0).sort((a, b) => b.monthNumber - a.monthNumber);
}

export default function MyPageOverviewPage({
  counts,
  currentYear,
  currentYearItems,
}: {
  counts: YearCount[];
  currentYear: string;
  currentYearItems: SavedItem[];
}) {
  const safeCounts = Array.isArray(counts) ? counts : [];
  const safeItems = Array.isArray(currentYearItems) ? currentYearItems : [];
  const totalSaved = safeCounts.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const groupedMonths = groupItemsByMonth(safeItems);

  return (
    <>
      <Title title="마이페이지" sub="저장한 기록과 올해 본 작품을 월별로 확인하세요." />

      <div className="flex items-center justify-between gap-3 py-4">
        <div />
        <div className="flex items-center gap-3">
          <p className="browse-card__meta text-sm">올해 {safeItems.length}개 / 총 {totalSaved}개</p>
          <Link
            href={`/mypage/${currentYear}`}
            className="inline-flex min-h-[2.75rem] items-center rounded-full border border-slate-300/80 bg-white px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            연도별보기
          </Link>
        </div>
      </div>

      {groupedMonths.length ? (
        <div className="flex flex-col gap-8 py-2">
          {groupedMonths.map((group) => (
            <section key={group.monthNumber} className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-3 dark:border-slate-800/80">
                <h2 className="page-title text-lg font-semibold">{group.monthLabel}</h2>
                <span className="browse-card__meta rounded-full bg-white/70 px-3 py-1 text-sm dark:bg-slate-900/70">
                  {group.items.length}개
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                {group.items.map((item) => {
                  const href = item.type ? `/${item.type}/${item.id}` : "#";
                  const title = item.title || item.name || "Untitled";

                  return (
                    <Link
                      key={item._id}
                      href={href}
                      className="browse-card group block overflow-hidden rounded-[22px] border"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
                        {item.poster_path ? (
                          <img
                            alt={title}
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-400 dark:text-slate-500">
                            No poster
                          </div>
                        )}
                      </div>
                      <div className="browse-card__footer px-3 py-3">
                        <p className="browse-card__title line-clamp-2 text-sm font-semibold">{title}</p>
                        <p className="browse-card__meta mt-1 text-xs">{item.user_date ?? "-"}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="py-6 text-sm text-slate-500 dark:text-slate-400">아직 올해 저장한 작품이 없습니다.</div>
      )}
    </>
  );
}

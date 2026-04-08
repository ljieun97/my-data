import Link from "next/link";
import Title from "@/components/common/title";

type YearCount = {
  _id: string;
  count: number;
};

export default function MyPageOverviewPage({ counts }: { counts: YearCount[] }) {
  const safeCounts = Array.isArray(counts) ? counts : [];
  const totalSaved = safeCounts.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const trackedYears = safeCounts.length;
  const mostActiveYear = safeCounts.reduce<YearCount | null>((best, current) => {
    if (!best || current.count > best.count) {
      return current;
    }

    return best;
  }, null);
  const latestYear = safeCounts[0]?._id ?? "-";

  return (
    <>
      <Title title="마이페이지" sub="내 기록을 한눈에 살펴보세요." />

      <div className="grid gap-4 py-4 md:grid-cols-2 xl:grid-cols-4">
        <section className="browse-card rounded-[24px] border p-5">
          <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Total Saved</p>
          <p className="browse-card__title mt-3 text-3xl font-semibold">{totalSaved}</p>
        </section>

        <section className="browse-card rounded-[24px] border p-5">
          <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Tracked Years</p>
          <p className="browse-card__title mt-3 text-3xl font-semibold">{trackedYears}</p>
        </section>

        <section className="browse-card rounded-[24px] border p-5">
          <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Most Active Year</p>
          <p className="browse-card__title mt-3 text-3xl font-semibold">{mostActiveYear?._id ?? "-"}</p>
          <p className="browse-card__meta mt-2 text-sm">{mostActiveYear ? `${mostActiveYear.count} saved` : "No data yet"}</p>
        </section>

        <section className="browse-card rounded-[24px] border p-5">
          <p className="browse-card__meta text-xs uppercase tracking-[0.16em]">Latest Year</p>
          <p className="browse-card__title mt-3 text-3xl font-semibold">{latestYear}</p>
        </section>
      </div>

      <section className="browse-card rounded-[28px] border p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="browse-card__title text-xl font-semibold tracking-[-0.03em]">By year</h2>
            <p className="browse-card__meta mt-1 text-sm">연도를 선택해서 저장한 콘텐츠를 확인해보세요.</p>
          </div>
          <p className="browse-card__meta text-sm">{trackedYears} years archived</p>
        </div>

        {safeCounts.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {safeCounts.map((item) => (
              <Link
                key={item._id}
                href={`/mypage/${item._id}`}
                className="group rounded-[22px] bg-white/70 px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="browse-card__title text-lg font-semibold">{item._id}</p>
                    <p className="browse-card__meta mt-1 text-sm">{item.count} saved titles</p>
                  </div>
                  <span className="browse-card__meta text-xl transition group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[22px] bg-white/60 px-4 py-6 text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
            아직 저장된 콘텐츠가 없습니다.
          </div>
        )}
      </section>
    </>
  );
}

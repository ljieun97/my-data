import InfiniteImages from "@/components/common/infinite-images";
import Title from "@/components/common/title";

function formatKnownFor(value?: string) {
  if (!value) return "-";

  const labels: Record<string, string> = {
    Acting: "배우",
    Directing: "감독",
    Writing: "각본",
    Production: "제작",
    Sound: "음악",
  };

  return labels[value] ?? value;
}

export default function PersonDetailContent({
  person,
  credits,
}: {
  person: any;
  credits: any[];
}) {
  const profilePath = person?.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : null;
  const birthday = person?.birthday || "-";
  const placeOfBirth = person?.place_of_birth || "-";
  const biography = person?.biography || "현재 등록된 인물 소개가 없습니다.";

  return (
    <div className="flex flex-col gap-6">
      <section className="browse-card overflow-hidden rounded-[30px] border p-4 sm:p-6">
        <div className="grid gap-5 md:grid-cols-[12rem_1fr] md:items-start">
          <div className="overflow-hidden rounded-[24px] bg-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.18)] dark:bg-slate-800">
            {profilePath ? (
              <img src={profilePath} alt={person?.name ?? "person profile"} className="aspect-[2/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center text-sm text-slate-500">No profile</div>
            )}
          </div>

          <div className="min-w-0 space-y-4">
            <Title title={person?.name ?? "Unknown person"} sub={formatKnownFor(person?.known_for_department)} compact={false} />

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                생일 {birthday}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                출생지 {placeOfBirth}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                작품 {credits.length}개
              </span>
            </div>

            <p className="max-w-4xl whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
              {biography}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <Title title="출연/참여 작품" sub={`${credits.length} titles`} compact />
        </div>

        {credits.length > 0 ? (
          <InfiniteImages contents={credits} />
        ) : (
          <div className="browse-card rounded-[24px] border p-6 text-sm text-slate-500 dark:text-slate-400">
            현재 등록된 작품 정보가 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}

'use client'

import InfiniteImages from "@/components/common/infinite-images";
import Title from "@/components/common/title";
import PersonWatchStat from "@/components/person/person-watch-stat";

function formatKnownFor(value?: string) {
  if (!value) return "-";

  const labels: Record<string, string> = {
    Acting: "\uBC30\uC6B0",
    Directing: "\uAC10\uB3C5",
    Writing: "\uAC01\uBCF8",
    Production: "\uC81C\uC791",
    Sound: "\uC74C\uC545",
  };

  return labels[value] ?? value;
}

function formatDate(value?: string) {
  return value || "-";
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-slate-100/80 px-4 py-3 dark:bg-slate-900/70">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}

export default function PersonDetailContent({
  person,
  credits,
}: {
  person: any;
  credits: any[];
}) {
  const profilePath = person?.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : null;
  const birthday = formatDate(person?.birthday);
  const deathday = person?.deathday ? formatDate(person.deathday) : null;
  const placeOfBirth = person?.place_of_birth || "-";
  const biography = typeof person?.biography === "string" ? person.biography.trim() : "";
  const movieCount = credits.filter((credit) => credit.media_type === "movie" || credit.title).length;
  const tvCount = credits.filter((credit) => credit.media_type === "tv" || credit.name).length;
  const castCredits = credits.filter((credit) => credit.contribution_type === "cast");
  const crewCredits = credits.filter((credit) => credit.contribution_type === "crew");

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
                {"\uC0DD\uC77C"} {birthday}
              </span>
              {deathday ? (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  {"\uC0AC\uB9DD\uC77C"} {deathday}
                </span>
              ) : null}
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                {"\uCD9C\uC0DD\uC9C0"} {placeOfBirth}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                {"\uC791\uD488"} {credits.length}{"\uAC1C"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard label={"\uC601\uD654"} value={`${movieCount}\uAC1C`} />
              <StatCard label={"\uC2DC\uB9AC\uC988"} value={`${tvCount}\uAC1C`} />
              <PersonWatchStat credits={castCredits} label={"\uCD9C\uC5F0 \uAD00\uB78C"} />
              <PersonWatchStat credits={crewCredits} label={"\uC81C\uC791 \uAD00\uB78C"} />
            </div>

            {biography ? (
              <p className="max-w-4xl whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {biography}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <Title title={"\uCD9C\uC5F0/\uCC38\uC5EC \uC791\uD488"} sub={`${credits.length} titles`} compact />
        </div>

        {credits.length > 0 ? (
          <InfiniteImages contents={credits} type="person" prioritizeRated />
        ) : (
          <div className="browse-card rounded-[24px] border p-6 text-sm text-slate-500 dark:text-slate-400">
            {"\uD604\uC7AC \uB4F1\uB85D\uB41C \uC791\uD488 \uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}
          </div>
        )}
      </section>
    </div>
  );
}

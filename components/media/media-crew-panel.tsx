"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const ROLE_GROUPS = [
  {
    key: "director",
    label: "\uAC10\uB3C5",
    match: (item: any) => item.job === "Director" || item.job === "Series Director",
  },
  {
    key: "writer",
    label: "\uAC01\uBCF8",
    match: (item: any) =>
      item.department === "Writing" ||
      ["Writer", "Screenplay", "Story", "Characters", "Teleplay"].includes(item.job),
  },
  {
    key: "producer",
    label: "\uC81C\uC791",
    match: (item: any) =>
      item.department === "Production" &&
      ["Producer", "Executive Producer", "Co-Producer", "Line Producer"].includes(item.job),
  },
  {
    key: "music",
    label: "\uC74C\uC545",
    match: (item: any) =>
      item.department === "Sound" &&
      ["Original Music Composer", "Music", "Music Supervisor", "Songs"].includes(item.job),
  },
];

function uniquePeople(items: any[]) {
  const byId = new Map<string, any>();

  for (const item of items) {
    const key = String(item.id ?? item.name);

    if (!byId.has(key)) {
      byId.set(key, item);
      continue;
    }

    const previous = byId.get(key);
    byId.set(key, {
      ...previous,
      job: [previous.job, item.job].filter(Boolean).join(", "),
    });
  }

  return Array.from(byId.values()).slice(0, 8);
}

function CrewPersonCard({ person }: { person: any }) {
  return (
    <Link
      href={person.id ? `/person/${person.id}` : "#"}
      className="flex min-w-0 items-center gap-3 rounded-2xl bg-white/90 p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-950/80"
      aria-disabled={!person.id}
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
        {person.profile_path ? (
          <img
            alt={person.name}
            className="h-full w-full object-cover"
            src={`https://image.tmdb.org/t/p/w185/${person.profile_path}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <FontAwesomeIcon icon={faImage} />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{person.name}</p>
        <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{person.job || "-"}</p>
      </div>
    </Link>
  );
}

export default function MediaCrewPanel({ crew }: { crew: any[] }) {
  const groups = ROLE_GROUPS.map((group) => ({
    ...group,
    people: uniquePeople((crew ?? []).filter(group.match)),
  })).filter((group) => group.people.length > 0);

  if (!groups.length) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-[26px] bg-slate-50/80 p-5 dark:bg-slate-900/70">
      <h4 className="text-base font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">
        {"\uC81C\uC791\uC9C4"}
      </h4>

      <div className="grid gap-5 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.key} className="space-y-2">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{group.label}</p>
            <div className="grid gap-2">
              {group.people.map((person: any) => (
                <CrewPersonCard key={`${group.key}-${person.id ?? person.name}`} person={person} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

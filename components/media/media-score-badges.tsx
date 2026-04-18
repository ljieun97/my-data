"use client";

type MediaScoreBadgesProps = {
  tomatometer?: string | null;
  popcornmeter?: string | null;
  rottenTomatoesUrl?: string | null;
  tmdbLabel?: string | null;
  isLoading?: boolean;
  variant?: "home" | "detail";
};

function ScoreLoading() {
  return (
    <span className="score-loading" aria-label="Loading score" role="status">
      <span className="score-loading__dot" />
      <span className="score-loading__dot" />
      <span className="score-loading__dot" />
    </span>
  );
}

function ScoreChip({
  value,
  icon,
  href,
  isLoading = false,
  className = "",
}: {
  value?: string | null;
  icon: string;
  href?: string | null;
  isLoading?: boolean;
  className?: string;
}) {
  const content = (
    <span className={className}>
      <span className="home-score-chip__icon" aria-hidden="true">
        {icon}
      </span>
      {isLoading && !value ? <ScoreLoading /> : <span>{value ?? "-"}</span>}
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex">
      {content}
    </a>
  );
}

export default function MediaScoreBadges({
  tomatometer,
  popcornmeter,
  rottenTomatoesUrl,
  tmdbLabel,
  isLoading = false,
  variant = "home",
}: MediaScoreBadgesProps) {
  if (variant === "detail") {
    return (
      <div className="flex flex-wrap gap-2">
        {tmdbLabel ? (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            {tmdbLabel}
          </span>
        ) : null}
        <ScoreChip
          value={tomatometer}
          icon="🍅"
          href={rottenTomatoesUrl}
          isLoading={isLoading}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <ScoreChip
          value={popcornmeter}
          icon="🍿"
          href={rottenTomatoesUrl}
          isLoading={isLoading}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
      </div>
    );
  }

  return (
    <div className="mb-2 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
      <ScoreChip
        value={tomatometer}
        icon="🍅"
        isLoading={isLoading}
        className="home-score-chip min-w-0 justify-center whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold sm:px-2.5 sm:text-[11px]"
      />
      <ScoreChip
        value={popcornmeter}
        icon="🍿"
        isLoading={isLoading}
        className="home-score-chip min-w-0 justify-center whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold sm:px-2.5 sm:text-[11px]"
      />
    </div>
  );
}

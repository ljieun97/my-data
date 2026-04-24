"use client";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import PosterHoverActions from "@/components/media/poster-hover-actions";
import { useSaveContent } from "@/hooks/useSaveContent";

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

function buildSeasonTitle(seriesName: string, season: any) {
  const seasonNumber = Number(season?.season_number);

  if (Number.isFinite(seasonNumber) && seasonNumber > 0) {
    return `${seriesName} \uC2DC\uC98C ${seasonNumber}`;
  }

  return season?.name ? `${seriesName} ${season.name}` : seriesName;
}

export default function TvSeasonsPanel({ content }: { content: any }) {
  const { saveWithPreference } = useSaveContent();
  const seriesName = content?.name || content?.title || "";
  const seasons = Array.isArray(content?.seasons)
    ? content.seasons.filter((season: any) => Number(season?.season_number) >= 0)
    : [];

  if (!seasons.length) {
    return null;
  }

  const handleSaveSeason = async (season: any) => {
    const seasonContent = {
      ...content,
      id: content.id,
      type: "tv",
      media_type: "tv",
      name: buildSeasonTitle(seriesName, season),
      season_number: season.season_number,
      overview: season.overview || content.overview,
      poster_path: season.poster_path || content.poster_path,
      first_air_date: season.air_date || content.first_air_date,
      vote_average: content.vote_average,
    };

    await saveWithPreference({
      id: String(content.id),
      content: seasonContent,
      rating: 2.5,
    });
  };

  return (
    <section className="space-y-4 rounded-[26px] bg-slate-50/80 p-5 dark:bg-slate-900/70">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-50">Seasons</h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{seasons.length} seasons</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {seasons.map((season: any) => {
          const seasonTitle = buildSeasonTitle(seriesName, season);
          const posterPath = season.poster_path || content.poster_path;
          const airDate = season.air_date || content.first_air_date || "-";
          const episodeCount = Number(season.episode_count);

          return (
            <article key={season.id || season.season_number} className="group/season min-w-0">
              <div className="relative flex min-h-[7.25rem] overflow-hidden rounded-[18px] bg-slate-200 shadow-[0_12px_26px_rgba(15,23,42,0.14)] dark:bg-slate-800">
                <div className="w-24 shrink-0 bg-slate-300 dark:bg-slate-700">
                  {posterPath ? (
                    <img
                      src={`${TMDB_POSTER_BASE_URL}${posterPath}`}
                      alt={seasonTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                      No poster
                    </div>
                  )}
                </div>
                <PosterHoverActions
                  overlayClassName="rounded-[18px] bg-slate-950/28 group-hover/season:visible dark:bg-slate-950/48"
                  actions={[
                    {
                      icon: faPlus,
                      label: `${seasonTitle} save`,
                      onClick: () => handleSaveSeason(season),
                      className: "browse-card__action rounded-full px-3 py-2 text-sm shadow-sm transition",
                    },
                  ]}
                />
                <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-3">
                  <h5 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.03em] text-slate-900 dark:text-slate-50">
                    {seasonTitle}
                  </h5>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {airDate}
                    {Number.isFinite(episodeCount) && episodeCount > 0 ? ` \u00B7 ${episodeCount} episodes` : ""}
                  </p>
                  {season.overview ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                      {season.overview}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

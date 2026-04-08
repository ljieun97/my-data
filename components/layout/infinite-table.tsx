"use client";

import { useCallback } from "react";
import { PopupList } from "../modal/popup-list";

export const InfiniteTable = ({ columns, rows }: { columns: any[]; rows: any[] }) => {
  const renderCell = useCallback((user: any, columnKey: any) => {
    const cellValue = user[columnKey];
    const { likedMovies, likedSeries } = (user.contents ?? []).reduce(
      (acc: any, content: any) => {
        if (content.liked) {
          content.movie ? acc.likedMovies.push(content) : acc.likedSeries.push(content);
        }
        return acc;
      },
      { likedMovies: [], likedSeries: [] },
    );

    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt={String(cellValue)} className="h-10 w-10 rounded-full object-cover" />
            <div>
              <div className="font-semibold">{cellValue}</div>
              <div className="text-xs text-slate-500">{`${user.gender} | ${user.year}`}</div>
            </div>
          </div>
        );
      case "movie":
        return <PopupList type="movie" list={likedMovies} />;
      case "tv":
        return <PopupList type="tv" list={likedSeries} />;
      case "contents":
        return <>{cellValue?.length || 0}</>;
      default:
        return cellValue;
    }
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-950">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="border-b border-slate-200/70 px-4 py-3 text-left text-sm dark:border-slate-800">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.key}>
              {columns.map((column) => (
                <td key={column.key} className="border-b border-slate-200/70 px-4 py-3 text-sm dark:border-slate-800">
                  {renderCell(item, column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function InfiniteImagesSkel() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8">
      {[...Array(18)].map((_, index: number) => (
        <div key={index} className="overflow-hidden rounded-sm">
          <div className="h-[240px] w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

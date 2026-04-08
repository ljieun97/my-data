export default function DetailModalLoading() {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/36 p-3 backdrop-blur-[2px] sm:p-8 lg:p-12 xl:p-16">
      <div className="h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_28px_72px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_32px_80px_rgba(2,6,23,0.48)] sm:h-[calc(100dvh-7rem)] sm:max-w-4xl lg:h-[calc(100dvh-9rem)] lg:max-w-[68rem] xl:h-[calc(100dvh-11rem)] xl:max-w-[72rem]">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
            <span className="text-sm">Loading details</span>
          </div>
        </div>
      </div>
    </div>
  );
}

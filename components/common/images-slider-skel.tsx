export default function ImagesSliderSkel() {
  return (
    <>
      <div className="flex justify-end gap-1 pb-2 pr-6">
        <button className="h-1 w-4 rounded-sm bg-black/10" />
      </div>

      <div className="flex w-full overflow-hidden">
        <button className="mr-[2px] rounded-sm bg-black/10 px-[3px]">‹</button>
        <div className="flex w-full overflow-hidden">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="w-1/5 flex-shrink-0">
              <div className="h-[140px] w-[240px] animate-pulse rounded-sm bg-gray-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
        <button className="ml-[2px] rounded-sm bg-black/10 px-[3px]">›</button>
      </div>
    </>
  );
}

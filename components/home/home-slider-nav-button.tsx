"use client";

export default function HomeSliderNavButton({
  direction,
  onClick,
  disabled,
  style,
}: {
  direction: "previous" | "next";
  onClick: () => void;
  disabled: boolean;
  style?: React.CSSProperties;
}) {
  const isPrevious = direction === "previous";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={[
        "absolute z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300/80 bg-white/92 text-base font-semibold text-slate-900 shadow-md backdrop-blur transition hover:border-slate-400 hover:bg-white disabled:pointer-events-none disabled:opacity-0 dark:border-slate-700 dark:bg-slate-900/88 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-900",
        isPrevious ? "-left-5" : "-right-5",
      ].join(" ")}
      aria-label={isPrevious ? "Previous" : "Next"}
    >
      {isPrevious ? "‹" : "›"}
    </button>
  );
}

"use client";

import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function CapturePanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={joinClasses("border border-slate-200 bg-white/72 p-4 dark:border-slate-800 dark:bg-slate-950/70", className)}>{children}</div>;
}

export function CaptureField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={joinClasses("block", className)}>
      <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export function CaptureTextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={joinClasses(
        "h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100",
        className,
      )}
    />
  );
}

export function CaptureTextArea({
  className,
  rows = 2,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={joinClasses(
        "w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100",
        className,
      )}
    />
  );
}

export function CaptureToggleButton({
  active,
  children,
  className,
  ...props
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button
      {...props}
      className={joinClasses(
        "h-8 border px-2 text-xs font-bold transition",
        active
          ? "border-slate-950 bg-slate-950 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function CaptureHelperText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={joinClasses("text-xs text-slate-500 dark:text-slate-400", className)}>{children}</p>;
}

export function CaptureSizeControls({
  value,
  defaultValue,
  onChange,
  step = 2,
  min = 12,
  max = 48,
}: {
  value: number;
  defaultValue: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={!canDecrease}
        className="h-8 min-w-8 border border-slate-300 bg-white px-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        -
      </button>
      <button
        type="button"
        onClick={() => onChange(defaultValue)}
        className="h-8 border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        기본
      </button>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={!canIncrease}
        className="h-8 min-w-8 border border-slate-300 bg-white px-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        +
      </button>
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{value}px</span>
    </div>
  );
}

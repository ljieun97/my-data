"use client";

import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

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

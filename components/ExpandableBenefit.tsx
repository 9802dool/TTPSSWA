"use client";

import { useState } from "react";

type Props = {
  number: number;
  title: string;
  children?: React.ReactNode;
  /** Used on dark section backgrounds (e.g. membership-services page). */
  variant?: "light" | "dark";
};

export default function ExpandableBenefit({
  number,
  title,
  children,
  variant = "light",
}: Props) {
  const [open, setOpen] = useState(false);

  const isDark = variant === "dark";

  const shell =
    isDark
      ? "overflow-hidden rounded-lg border border-white/15 bg-black/25 shadow-lg shadow-black/30"
      : "overflow-hidden rounded-lg border border-line bg-canvas shadow-corp dark:bg-surface";
  const btnHover =
    isDark
      ? "hover:bg-white/10"
      : "hover:bg-brand-subtle/60 dark:hover:bg-navy-muted/40";
  const numBadge =
    isDark
      ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-600 text-sm font-bold text-white"
      : "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy text-sm font-bold text-white";
  const titleCls =
    isDark
      ? "min-w-0 flex-1 pt-0.5 text-base font-bold leading-snug text-white"
      : "min-w-0 flex-1 pt-0.5 text-base font-bold leading-snug text-ink";
  const chevronBorder = isDark ? "border-white/20 text-sky-400" : "border-line text-brand";
  const panel =
    isDark
      ? "border-t border-white/10 bg-slate-950/50 px-4 py-5"
      : "border-t border-line bg-surface px-4 py-5 dark:bg-stone-900/40";

  return (
    <li>
      <div className={shell}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`flex w-full items-center gap-4 px-4 py-4 text-left transition ${btnHover}`}
        >
          <span className={numBadge}>{number}</span>
          <span className={titleCls}>{title}</span>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition ${chevronBorder} ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        {open && (
          <div className={panel}>
            {children ?? (
              <p className="text-sm leading-relaxed text-muted">
                Add details, contacts, and links here.
              </p>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

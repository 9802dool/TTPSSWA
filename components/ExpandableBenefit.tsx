"use client";

import { useState } from "react";

type Props = {
  number: number;
  title: string;
  children?: React.ReactNode;
  /** Dark page background; benefit row matches home hero white CTAs (app/page.tsx). */
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
      ? "group overflow-hidden rounded-md bg-white shadow-corp-md ring-1 ring-white/20"
      : "overflow-hidden rounded-lg border border-line bg-canvas shadow-corp dark:bg-surface";
  const btnHover =
    isDark
      ? "hover:bg-slate-100"
      : "hover:bg-brand-subtle/60 dark:hover:bg-navy-muted/40";
  const btnBase =
    isDark
      ? `flex w-full min-h-[48px] items-center gap-3 px-4 text-left transition sm:px-8 ${btnHover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f18]`
      : `flex w-full items-center gap-4 px-4 py-4 text-left transition ${btnHover}`;
  const numBadge =
    isDark
      ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy text-xs font-bold text-white"
      : "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy text-sm font-bold text-white";
  const titleCls =
    isDark
      ? "min-w-0 flex-1 text-left text-sm font-semibold leading-snug text-navy"
      : "min-w-0 flex-1 pt-0.5 text-base font-bold leading-snug text-ink";
  const moreInfoCls = isDark
    ? "shrink-0 rounded-md border border-navy/15 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-navy sm:text-sm"
    : "shrink-0 rounded-md border border-line bg-brand-subtle/50 px-3 py-1.5 text-xs font-semibold text-brand sm:text-sm";
  const panel =
    isDark
      ? "border-t border-slate-200/90 bg-slate-50 px-4 py-5 sm:px-8"
      : "border-t border-line bg-surface px-4 py-5 dark:bg-stone-900/40";

  return (
    <li className={isDark ? "h-full" : undefined}>
      <div className={shell}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? `Hide details for ${title}` : `More information about ${title}`}
          className={btnBase}
        >
          <span className={numBadge}>{number}</span>
          <span className={titleCls}>{title}</span>
          <span className={moreInfoCls}>{open ? "Hide" : "More info"}</span>
        </button>
        {open && (
          <div className={panel} role="region" aria-label={`Details for ${title}`}>
            {children ?? (
              <p
                className={
                  isDark
                    ? "text-sm leading-relaxed text-muted"
                    : "text-sm leading-relaxed text-muted"
                }
              >
                Add details, contacts, and links here.
              </p>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

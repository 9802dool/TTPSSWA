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
      ? "group overflow-hidden rounded-2xl border-2 border-sky-500/40 bg-gradient-to-br from-sky-500/[0.18] via-slate-900/50 to-slate-950/70 shadow-[0_6px_24px_rgba(0,0,0,0.45)] ring-1 ring-white/10 transition hover:border-sky-400/55 hover:shadow-[0_8px_32px_rgba(14,165,233,0.16)]"
      : "overflow-hidden rounded-lg border border-line bg-canvas shadow-corp dark:bg-surface";
  const btnHover =
    isDark
      ? "group-hover:bg-white/[0.06]"
      : "hover:bg-brand-subtle/60 dark:hover:bg-navy-muted/40";
  const btnBase =
    isDark
      ? `flex w-full min-h-[3.5rem] items-center gap-3 px-4 py-3.5 text-left transition active:scale-[0.992] ${btnHover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f18]`
      : `flex w-full items-center gap-4 px-4 py-4 text-left transition ${btnHover}`;
  const numBadge =
    isDark
      ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-sm font-bold text-white shadow-inner shadow-sky-900/40 ring-1 ring-white/20"
      : "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy text-sm font-bold text-white";
  const titleCls =
    isDark
      ? "min-w-0 flex-1 text-left text-sm font-semibold leading-snug tracking-wide text-white sm:text-[15px]"
      : "min-w-0 flex-1 pt-0.5 text-base font-bold leading-snug text-ink";
  const chevronBorder = isDark ? "border-sky-400/35 bg-slate-950/30 text-sky-300" : "border-line text-brand";
  const panel =
    isDark
      ? "border-t border-sky-500/25 bg-slate-950/65 px-4 py-5 backdrop-blur-sm"
      : "border-t border-line bg-surface px-4 py-5 dark:bg-stone-900/40";

  return (
    <li className={isDark ? "h-full" : undefined}>
      <div className={shell}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={btnBase}
        >
          <span className={numBadge}>{number}</span>
          <span className={titleCls}>{title}</span>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${chevronBorder} ${
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
              <p
                className={
                  isDark
                    ? "text-sm leading-relaxed text-slate-400"
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

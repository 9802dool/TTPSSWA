"use client";

import { useState } from "react";

type Props = {
  number: number;
  title: string;
  children?: React.ReactNode;
};

export default function ExpandableBenefit({ number, title, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <div className="overflow-hidden rounded-lg border border-line bg-canvas shadow-corp dark:bg-surface">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-brand-subtle/60 dark:hover:bg-navy-muted/40"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy text-sm font-bold text-white">
            {number}
          </span>
          <span className="min-w-0 flex-1 pt-0.5 text-base font-bold leading-snug text-ink">
            {title}
          </span>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line text-brand transition ${
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
          <div className="border-t border-line bg-surface px-4 py-5 dark:bg-stone-900/40">
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

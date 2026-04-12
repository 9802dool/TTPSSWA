"use client";

import { useState } from "react";

const COMMITTEES: { id: number; title: string }[] = [
  { id: 1, title: "Education Committee" },
  { id: 2, title: "Events Committee" },
  { id: 3, title: "Welfare Committee" },
  { id: 4, title: "Entrepreneur Committee" },
  { id: 5, title: "Communication Committee" },
  { id: 6, title: "Housing Committee" },
  { id: 7, title: "Transitioning Committee" },
  { id: 8, title: "Special Projects Committee" },
  { id: 9, title: "Special Purpose Committee" },
  { id: 10, title: "Tobago Committee" },
  { id: 11, title: "Marketing Committee" },
  { id: 12, title: "Municipal Committee" },
  { id: 13, title: "SRP Committee" },
  { id: 14, title: "Disciplinary Committee" },
  { id: 15, title: "Finance Committee" },
  { id: 16, title: "Legal Aid Committee" },
  { id: 17, title: "Elections Committee" },
];

export function CommitteesSection() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <ul
      className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-4"
      aria-label="Committees"
    >
      {COMMITTEES.map((c) => {
        const isOpen = openId === c.id;
        return (
          <li
            key={c.id}
            className="overflow-hidden rounded-xl border border-white/15 bg-slate-800/60 shadow-lg shadow-black/20"
          >
            <button
              type="button"
              onClick={() => setOpenId((prev) => (prev === c.id ? null : c.id))}
              aria-expanded={isOpen}
              aria-controls={`committee-panel-${c.id}`}
              id={`committee-trigger-${c.id}`}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold text-white transition hover:bg-white/5 sm:px-5 sm:py-4 sm:text-base"
            >
              <span className="min-w-0 leading-snug">{c.title}</span>
              <span className="shrink-0 text-slate-400" aria-hidden>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <div
                id={`committee-panel-${c.id}`}
                role="region"
                aria-labelledby={`committee-trigger-${c.id}`}
                className="border-t border-white/10 bg-slate-900/70 px-4 py-4 sm:px-5"
              >
                <p className="text-sm leading-relaxed text-slate-300">
                  Information, contacts, and updates for this committee can be added here.
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

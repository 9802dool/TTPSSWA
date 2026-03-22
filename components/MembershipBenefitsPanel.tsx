"use client";

import { useEffect, useState } from "react";
import { membershipBenefits } from "@/lib/membership-benefits";

const PANEL_ID = "membership-benefits-content";

export default function MembershipBenefitsPanel() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash.startsWith("#benefit-")) {
        setOpen(true);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.startsWith("#benefit-")) return;
    const el = document.querySelector(hash);
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
        Member benefits
      </h2>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        className="mt-4 flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-canvas px-5 py-4 text-left shadow-corp transition hover:border-brand hover:bg-brand-subtle dark:bg-surface"
      >
        <span className="text-xl font-bold tracking-tight text-ink md:text-2xl">
          Select benefits
        </span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-brand transition dark:bg-canvas ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <svg
            width="20"
            height="20"
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
        <div
          id={PANEL_ID}
          className="mt-6 space-y-8 border-t border-line pt-8"
        >
          <p className="text-sm text-muted">
            Click a benefit to jump to its details below. Replace placeholders with
            your policy text, download links, or application forms.
          </p>

          <ul className="list-none space-y-2 p-0">
            {membershipBenefits.map((b) => (
              <li key={b.id}>
                <a
                  href={`#benefit-${b.id}`}
                  className="group flex gap-4 rounded-lg border border-line bg-canvas px-4 py-3.5 shadow-corp transition hover:border-brand hover:bg-brand-subtle dark:bg-surface"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy text-sm font-bold text-white group-hover:bg-brand">
                    {b.id}
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5 text-sm font-bold leading-snug text-ink group-hover:text-brand md:text-base">
                    {b.title}
                  </span>
                  <span
                    className="hidden shrink-0 self-center text-xs font-semibold text-brand group-hover:inline sm:inline"
                    aria-hidden
                  >
                    View →
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-line bg-canvas p-6 dark:bg-surface/80 sm:p-8">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-brand">
              Benefit information
            </h3>
            <p className="mt-2 text-sm text-muted">
              Full details for each benefit follow. Use the list above to jump to a
              section, or scroll through the numbered entries.
            </p>
          </div>

          <div className="space-y-0 border-t border-line pt-8">
            {membershipBenefits.map((b) => (
              <article
                key={b.id}
                id={`benefit-${b.id}`}
                className="scroll-mt-28 border-t border-line py-10 first:border-t-0 first:pt-0"
              >
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy text-sm font-bold text-white">
                    {b.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-ink md:text-lg">
                      {b.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      Add eligibility criteria, contacts, and links here. You can
                      also point a list row to an external PDF by changing{" "}
                      <code className="rounded bg-line/80 px-1 py-0.5 text-xs">
                        href
                      </code>{" "}
                      for that item in{" "}
                      <code className="rounded bg-line/80 px-1 py-0.5 text-xs">
                        lib/membership-benefits.ts
                      </code>{" "}
                      or the link in{" "}
                      <code className="rounded bg-line/80 px-1 py-0.5 text-xs">
                        MembershipBenefitsPanel.tsx
                      </code>
                      .
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

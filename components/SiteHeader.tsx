"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { PromoBanner } from "@/components/PromoBanner";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/executive", label: "Executive team" },
  { href: "/subsidiaries", label: "Subsidiaries" },
  { href: "/partnership", label: "Partnership" },
  { href: "/login", label: "Signup / Login" },
] as const;

const navLinkClass =
  "rounded-xl border border-transparent px-3 py-2.5 text-center text-[0.95em] font-bold text-ink transition hover:border-line hover:bg-canvas sm:px-4 lg:inline-flex lg:rounded-full lg:border-line lg:bg-white/95 lg:py-1.5 lg:text-sm lg:shadow-sm lg:hover:border-brand lg:hover:text-brand";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 shadow-corp">
      <PromoBanner />
      <div className="border-b border-line bg-surface/95 backdrop-blur-md dark:bg-surface/90">
        <div className="site-container flex min-h-[4.25rem] items-center justify-between gap-3 py-2">
          <Link
            href="/"
            className="min-w-0 shrink font-extrabold tracking-tight text-ink transition hover:text-brand"
            onClick={() => setOpen(false)}
          >
            <span className="block truncate text-[clamp(0.95rem,2.5vw,1.125rem)] leading-tight">
              TTPSSWA
            </span>
            <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted sm:block">
              Social &amp; Welfare
            </span>
          </Link>

          <nav
            className="hidden flex-wrap items-center justify-end gap-x-1 gap-y-1 lg:flex"
            aria-label="Primary"
          >
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass}>
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-ink shadow-sm transition hover:border-brand hover:text-brand lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id={menuId}
          className="fixed inset-x-0 bottom-0 top-[var(--site-header-stack)] z-40 flex flex-col overflow-y-auto bg-surface/98 p-4 pb-10 shadow-inner backdrop-blur-md lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <nav className="site-container flex flex-col gap-1 py-2" aria-label="Primary mobile">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-line bg-canvas px-4 py-3.5 text-base font-bold text-ink shadow-sm transition hover:border-brand hover:text-brand"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

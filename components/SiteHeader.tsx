import Link from "next/link";
import { PromoBanner } from "@/components/PromoBanner";

const defaultNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/executive", label: "Executive team" },
  { href: "/partnership", label: "Partnership" },
  { href: "/login", label: "Signup / Login" },
] as const;

/** Home: pills for Home + Signup/Login; middle links are plain white text over the hero. */
const homeNav = [
  { href: "/", label: "Home", kind: "pill" as const },
  { href: "/about", label: "About", kind: "text" as const },
  { href: "/executive", label: "Executive team", kind: "text" as const },
  { href: "/partnership", label: "Partnership", kind: "text" as const },
  { href: "/login", label: "Signup / Login", kind: "pill" as const },
];

const defaultLinkClass = "site-btn-nav-pill font-bold sm:px-3";

const homePillClass =
  "inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm transition hover:bg-slate-100";
const homeTextClass =
  "inline-flex items-center px-3 py-2 text-sm font-semibold text-white transition hover:text-sky-200";

type SiteHeaderProps = { variant?: "default" | "home" };

export default function SiteHeader({ variant = "default" }: SiteHeaderProps) {
  if (variant === "home") {
    return (
      <header className="fixed inset-x-0 top-0 z-50">
        <PromoBanner />
        <div className="bg-transparent">
          <div className="mx-auto flex h-[var(--nav-row-height)] max-w-6xl items-center justify-end gap-0.5 px-4 sm:gap-1 sm:px-6 lg:px-8">
            <nav className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1" aria-label="Primary">
              {homeNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={item.kind === "pill" ? homePillClass : homeTextClass}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 shadow-corp">
      <PromoBanner />
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex min-h-[3.75rem] max-w-6xl flex-wrap items-center justify-end gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
          <nav
            className="flex flex-wrap items-center justify-end gap-x-0.5 gap-y-1 sm:gap-x-1"
            aria-label="Primary"
          >
            {defaultNav.map((item) => (
              <Link key={item.href} href={item.href} className={defaultLinkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

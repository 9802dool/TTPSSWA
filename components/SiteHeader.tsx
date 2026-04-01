import Link from "next/link";
import { PromoBanner } from "@/components/PromoBanner";

const nav = [
  { href: "/", label: "Home" },
  { href: "/#subsidiaries", label: "Subsidiaries" },
  { href: "/partnership", label: "Partnership" },
  { href: "/login", label: "Signup / Login" },
];

const linkClass = "site-btn-nav-pill font-bold sm:px-3";

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 shadow-corp">
      <PromoBanner />
      <div className="border-b border-line bg-surface/95 backdrop-blur-md dark:bg-surface/90">
        <div className="mx-auto flex min-h-[4.25rem] max-w-6xl flex-wrap items-center justify-end gap-x-4 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
          <nav
            className="flex max-w-[min(100%,52rem)] flex-wrap items-center justify-end gap-x-0.5 gap-y-1 sm:gap-x-1"
            aria-label="Primary"
          >
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

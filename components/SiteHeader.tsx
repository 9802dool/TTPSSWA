import Image from "next/image";
import Link from "next/link";

const nav = [
  { href: "/#about", label: "About" },
  { href: "/membership-services", label: "Membership Services" },
  { href: "/#focus", label: "Focus" },
  { href: "/#contact", label: "Contact" },
  { href: "/executive", label: "Executive" },
  {
    href: "/central-committee-representatives",
    label: "Central Committee Representative",
  },
];

const linkClass =
  "rounded-md px-2.5 py-2 text-sm font-medium text-muted transition hover:bg-brand-subtle hover:text-brand dark:hover:bg-navy-muted sm:px-3";

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-surface/95 shadow-corp backdrop-blur-md dark:bg-surface/90">
      <div className="mx-auto flex min-h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-navy dark:text-ink"
        >
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md ring-1 ring-line shadow-corp">
            <Image
              src="/icon.png"
              alt="TTPSSWA"
              width={32}
              height={32}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span>TTPSSWA</span>
        </Link>
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
    </header>
  );
}

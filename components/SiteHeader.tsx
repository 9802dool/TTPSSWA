import Image from "next/image";
import Link from "next/link";

const nav: {
  href: string;
  label: string;
  uppercase?: boolean;
  /** Extra-long all-caps label — smaller type */
  longUppercase?: boolean;
}[] = [
  { href: "/#about", label: "About" },
  { href: "/membership-services", label: "MEMBERSHIP SERVICES", uppercase: true },
  { href: "/#focus", label: "Focus" },
  { href: "/#contact", label: "Contact" },
  { href: "/executive", label: "Executive" },
  {
    href: "/central-committee-representatives",
    label: "CENTRAL COMMITTEE REPRESENTATIVES",
    uppercase: true,
    longUppercase: true,
  },
];

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
            <Link
              key={item.href}
              href={item.href}
              className={
                item.longUppercase
                  ? "rounded-md px-1 py-1.5 text-[7px] font-semibold leading-tight tracking-wide text-muted transition hover:bg-brand-subtle hover:text-brand dark:hover:bg-navy-muted sm:px-1.5 sm:text-[8px] md:text-[9px]"
                  : item.uppercase
                    ? "rounded-md px-1.5 py-2 text-[9px] font-semibold leading-tight tracking-wide text-muted transition hover:bg-brand-subtle hover:text-brand dark:hover:bg-navy-muted sm:px-2 sm:text-[10px]"
                    : "rounded-md px-2.5 py-2 text-sm font-medium text-muted transition hover:bg-brand-subtle hover:text-brand dark:hover:bg-navy-muted sm:px-3"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

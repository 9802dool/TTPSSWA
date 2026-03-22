import Link from "next/link";

const nav = [
  { href: "#about", label: "About" },
  { href: "#focus", label: "Focus" },
  { href: "#contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/80 bg-canvas/90 backdrop-blur-md dark:border-stone-700/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="#top"
          className="font-display text-lg font-semibold tracking-tight text-ink"
        >
          TTPSSWA
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-2 text-sm text-muted transition hover:text-ink sm:px-3"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

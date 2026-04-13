import Image from "next/image";
import Link from "next/link";
import { PromoBanner } from "@/components/PromoBanner";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/executive", label: "Executive team" },
  { href: "/subsidiaries", label: "Subsidiaries" },
  { href: "/partnership", label: "Partnership" },
  { href: "/login", label: "Signup / Login" },
];

const linkClass = "site-btn-nav-pill font-bold sm:px-3";

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 shadow-corp">
      <PromoBanner />
      <div className="border-b border-line bg-white/95 backdrop-blur-md dark:bg-white/90">
        <div className="mx-auto flex min-h-[5.25rem] max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center bg-transparent py-0.5">
            <Image
              src="/logo.png"
              alt="TTPSSWA"
              width={400}
              height={400}
              priority
              className="h-12 w-auto object-contain object-left sm:h-14 md:h-16 lg:h-[4.5rem]"
            />
          </Link>
          <nav
            className="flex flex-1 flex-wrap items-center justify-end gap-x-0.5 gap-y-1 sm:gap-x-1"
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

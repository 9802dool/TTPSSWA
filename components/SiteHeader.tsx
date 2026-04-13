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

/** White-on-black brand PNG → site blue (#1e40af): invert then tint black shapes. */
const brandImageFilter =
  "invert(1) invert(14%) sepia(95%) saturate(3200%) hue-rotate(213deg) brightness(0.94) contrast(1.02)";

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 shadow-corp">
      <PromoBanner />
      <div className="border-b border-line bg-white/95 backdrop-blur-md dark:bg-white/90">
        <div className="mx-auto flex min-h-[5.25rem] max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="order-first flex min-h-0 shrink-0 items-center bg-transparent pr-2 outline-none ring-0 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
            aria-label="TTPSSWA — Trinidad and Tobago Police Service Social and Welfare Association"
          >
            <Image
              src="/ttpsswa-header-brand.png"
              alt=""
              width={440}
              height={100}
              priority
              className="h-11 w-auto max-w-[min(100vw-8rem,22rem)] bg-transparent object-contain object-left sm:h-12 sm:max-w-[26rem] md:h-14 md:max-w-[30rem] lg:h-[3.75rem] lg:max-w-[34rem]"
              style={{ filter: brandImageFilter, backgroundColor: "transparent" }}
            />
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
      </div>
    </header>
  );
}

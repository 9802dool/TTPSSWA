import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-navy text-slate-300">
      <div className="site-container py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-2">
            <p className="text-[clamp(1.05rem,1rem+0.4vw,1.25rem)] font-bold tracking-tight text-white">
              TTPSSWA
            </p>
            <p className="mt-3 max-w-prose text-[0.95em] leading-relaxed text-slate-400">
              Serving members with clear governance, transparent communication, and programs that support our
              community. Update this text in{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-200">SiteFooter.tsx</code>.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Navigate</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="transition hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/hotel-reservations" className="transition hover:text-white">
                  Hotel reservations
                </Link>
              </li>
              <li>
                <Link href="/membership-services" className="transition hover:text-white">
                  Membership services
                </Link>
              </li>
              <li>
                <Link href="/executive" className="transition hover:text-white">
                  Executive
                </Link>
              </li>
              <li>
                <Link href="/central-committee-representatives" className="transition hover:text-white">
                  Central Committee Representative
                </Link>
              </li>
              <li>
                <Link href="/membership-services" className="transition hover:text-white">
                  Members services
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="transition hover:text-white">
                  Admin login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Legal</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Add registration numbers, privacy policy, or terms of use here.
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} TTPSSWA. All rights reserved.</p>
          <p className="text-xs text-slate-600">Trinidad and Tobago</p>
        </div>
      </div>
    </footer>
  );
}

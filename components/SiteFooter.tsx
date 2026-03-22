import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-navy text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-2">
            <p className="text-lg font-bold tracking-tight text-white">TTPSSWA</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              Serving members with clear governance, transparent communication, and
              programs that support our community. Update this text in{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-200">
                SiteFooter.tsx
              </code>
              .
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Navigate
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/#about" className="transition hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/membership-services"
                  className="transition hover:text-white"
                >
                  Membership services
                </Link>
              </li>
              <li>
                <Link href="/executive" className="transition hover:text-white">
                  Executive
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="transition hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Legal
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Add registration numbers, privacy policy, or terms of use here.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} TTPSSWA. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">Trinidad and Tobago</p>
        </div>
      </div>
    </footer>
  );
}

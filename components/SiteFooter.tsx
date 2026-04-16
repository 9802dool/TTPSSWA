import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/15 bg-[rgb(6,12,22)] text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          <div>
            <p className="text-lg font-bold tracking-tight text-white">TTPSSWA</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              Trinidad and Tobago Police Service Social &amp; Welfare Association.
            </p>
          </div>
          <div className="sm:text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Navigate</p>
            <ul className="mt-4 space-y-2 text-sm text-white">
              <li>
                <Link href="/about" className="transition hover:text-sky-200">
                  About
                </Link>
              </li>
              <li>
                <Link href="/membership-services" className="transition hover:text-sky-200">
                  Membership services
                </Link>
              </li>
              <li>
                <Link href="/executive" className="transition hover:text-sky-200">
                  Executive team
                </Link>
              </li>
              <li>
                <Link href="/partnership" className="transition hover:text-sky-200">
                  Partnership
                </Link>
              </li>
              <li>
                <Link href="/subsidiaries" className="transition hover:text-sky-200">
                  Subsidiaries
                </Link>
              </li>
            </ul>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Legal</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Add registration numbers, privacy policy, or terms of use here.
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} TTPSSWA. All rights reserved.</p>
          <p className="text-xs text-slate-600">Trinidad and Tobago</p>
        </div>
      </div>
    </footer>
  );
}

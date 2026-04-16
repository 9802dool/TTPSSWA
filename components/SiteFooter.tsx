import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/25 bg-home-hero text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          <div>
            <p className="text-lg font-bold tracking-tight text-white">TTPSSWA</p>
          </div>
          <div className="sm:text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Navigate</p>
            <ul className="mt-4 text-sm">
              <li>
                <Link href="/about" className="text-white transition hover:text-home-headline">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Legal</p>
            <p className="mt-4 text-sm leading-relaxed text-white">
              Add registration numbers, privacy…
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} TTPSSWA. All rights reserved.</p>
          <p className="text-xs text-slate-500">Trinidad and Tobago</p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { PARTNERSHIP_PROGRAMS } from "@/lib/partnership-programs-data";

const titleCls =
  "min-w-0 flex-1 text-left text-sm font-semibold leading-snug text-white sm:text-base";

export function PartnershipPillars() {
  return (
    <ul
      className="mt-8 grid list-none gap-3 p-0 sm:grid-cols-2 sm:gap-3.5"
      aria-label="Partnership programs"
    >
      {PARTNERSHIP_PROGRAMS.map((p) => (
        <li key={p.slug} id={p.slug} className={p.placement}>
          <div className="overflow-hidden rounded-xl shadow-md shadow-slate-900/15">
            <Link
              href={`/partnership/${p.slug}`}
              className="site-btn-benefit-light"
            >
              <span className={titleCls}>{p.title}</span>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

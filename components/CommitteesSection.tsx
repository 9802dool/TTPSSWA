import Link from "next/link";
import { COMMITTEES } from "@/lib/committees-data";

export function CommitteesSection() {
  return (
    <ul
      className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Committees"
    >
      {COMMITTEES.map((c) => (
        <li key={c.id}>
          <Link
            href={`/beetham-np-service-station/${c.slug}`}
            className="block min-h-[4.25rem] rounded-xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm font-semibold text-white shadow-sm transition hover:border-sky-400/35 hover:bg-slate-900/90"
          >
            {c.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

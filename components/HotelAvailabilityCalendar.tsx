"use client";

import { useMemo, useState } from "react";
import { HOTEL_NIGHT_CAPACITY } from "@/lib/hotel-availability";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type NightInfo = { booked: number; available: number };

/** Days to show in grid (leading/trailing blanks as null). */
function monthGridCells(
  year: number,
  monthIndex: number,
): ({ ymd: string } | null)[] {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: ({ ymd: string } | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ ymd });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function inStayRange(
  ymd: string,
  checkIn: string,
  checkOut: string,
): boolean {
  if (!checkIn || !checkOut) return false;
  return ymd >= checkIn && ymd < checkOut;
}

function cellStyle(
  info: NightInfo | undefined,
  isInStay: boolean,
): string {
  const avail = info?.available ?? HOTEL_NIGHT_CAPACITY;
  let base =
    "relative flex aspect-square max-h-10 items-center justify-center rounded-md text-xs font-medium tabular-nums ";
  if (isInStay) base += "ring-2 ring-brand ring-offset-1 ring-offset-canvas dark:ring-offset-surface ";
  if (avail <= 0) return base + "bg-red-500/25 text-red-800 dark:text-red-200";
  if (avail <= 2) return base + "bg-amber-500/20 text-amber-900 dark:text-amber-100";
  if (avail <= 5) return base + "bg-yellow-500/15 text-ink";
  return base + "bg-emerald-500/15 text-ink";
}

export default function HotelAvailabilityCalendar({
  byNight,
  checkInDate,
  checkOutDate,
  loading,
}: {
  byNight: Record<string, NightInfo>;
  checkInDate: string;
  checkOutDate: string;
  loading?: boolean;
}) {
  const initial = useMemo(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() };
  }, []);
  const [viewY, setViewY] = useState(initial.y);
  const [viewM, setViewM] = useState(initial.m);

  const label = useMemo(
    () =>
      new Date(viewY, viewM, 1).toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [viewY, viewM],
  );

  const cells = useMemo(
    () => monthGridCells(viewY, viewM),
    [viewY, viewM],
  );

  function prevMonth() {
    if (viewM === 0) {
      setViewY((y) => y - 1);
      setViewM(11);
    } else setViewM((m) => m - 1);
  }

  function nextMonth() {
    if (viewM === 11) {
      setViewY((y) => y + 1);
      setViewM(0);
    } else setViewM((m) => m + 1);
  }

  return (
    <div className="rounded-lg border border-line bg-canvas/80 p-4 dark:bg-canvas/50">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">Availability</p>
        {loading ? (
          <span className="text-xs text-muted">Updating…</span>
        ) : null}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Nights show how many rooms are still free based on submitted requests.
        Confirm with the coordinator before travel.
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-medium text-ink shadow-sm hover:bg-canvas dark:bg-surface"
          aria-label="Previous month"
        >
          ←
        </button>
        <span className="text-sm font-medium text-ink">{label}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-medium text-ink shadow-sm hover:bg-canvas dark:bg-surface"
          aria-label="Next month"
        >
          →
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`e-${i}`} className="aspect-square max-h-10" />;
          }
          const { ymd } = cell;
          const dayNum = Number(ymd.slice(8, 10));
          const info = byNight[ymd];
          const stay = inStayRange(ymd, checkInDate, checkOutDate);
          return (
            <div
              key={ymd}
              className={cellStyle(info, stay)}
              title={
                info
                  ? `${ymd}: ${info.available} free (${info.booked} booked)`
                  : `${ymd}: ${HOTEL_NIGHT_CAPACITY} free`
              }
            >
              {dayNum}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-emerald-500/40" /> 6–8 free
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-yellow-500/30" /> 3–5 free
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-amber-500/30" /> 1–2 free
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-red-500/30" /> Full
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2 rounded ring-2 ring-brand" /> Your stay
        </span>
      </div>
    </div>
  );
}

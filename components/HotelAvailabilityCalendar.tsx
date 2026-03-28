"use client";

import { useMemo, useState } from "react";
import {
  HOTEL_NIGHT_CAPACITY,
  ROOM_TYPE_CAPS,
  type NightAvailability,
} from "@/lib/hotel-availability";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  info: NightAvailability | undefined,
  isInStay: boolean,
  isSelected: boolean,
): string {
  const avail = info?.available ?? HOTEL_NIGHT_CAPACITY;
  let base =
    "relative flex aspect-square max-h-10 w-full min-w-0 items-center justify-center rounded-md text-xs font-medium tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-surface ";
  if (isSelected) {
    base +=
      "z-[1] ring-2 ring-navy ring-offset-1 ring-offset-canvas dark:ring-offset-surface ";
  } else if (isInStay) {
    base +=
      "ring-2 ring-brand ring-offset-1 ring-offset-canvas dark:ring-offset-surface ";
  }
  if (avail <= 0) return base + "bg-red-500/25 text-red-800 dark:text-red-200";
  if (avail <= 2) return base + "bg-amber-500/20 text-amber-900 dark:text-amber-100";
  if (avail <= 5) return base + "bg-yellow-500/15 text-ink";
  return base + "bg-emerald-500/15 text-ink";
}

function formatSelectedLabel(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function HotelAvailabilityCalendar({
  byNight,
  checkInDate,
  checkOutDate,
  loading,
}: {
  byNight: Record<string, NightAvailability>;
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
  const [selectedYmd, setSelectedYmd] = useState<string | null>(null);

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

  const selectedInfo = useMemo(() => {
    if (!selectedYmd) return null;
    const info = byNight[selectedYmd];
    const booked = info?.booked ?? 0;
    const available = info?.available ?? HOTEL_NIGHT_CAPACITY;
    const pres =
      info?.presidentialAvailable ?? ROOM_TYPE_CAPS.presidential;
    const full = info?.fullBedAvailable ?? ROOM_TYPE_CAPS.fullBed;
    const dbl = info?.doubleBedAvailable ?? ROOM_TYPE_CAPS.doubleBed;
    return {
      ymd: selectedYmd,
      label: formatSelectedLabel(selectedYmd),
      booked,
      available,
      presidentialAvailable: pres,
      fullBedAvailable: full,
      doubleBedAvailable: dbl,
    };
  }, [selectedYmd, byNight]);

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
        Click a date for details. Confirm with the coordinator before travel.
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
          const isSelected = selectedYmd === ymd;
          const presA =
            info?.presidentialAvailable ?? ROOM_TYPE_CAPS.presidential;
          const fullA = info?.fullBedAvailable ?? ROOM_TYPE_CAPS.fullBed;
          const dblA = info?.doubleBedAvailable ?? ROOM_TYPE_CAPS.doubleBed;
          const availHint = info
            ? `${info.available} free total; presidential ${presA}, full ${fullA}, double ${dblA}`
            : `${HOTEL_NIGHT_CAPACITY} free total; all room types open`;
          return (
            <button
              key={ymd}
              type="button"
              onClick={() =>
                setSelectedYmd((prev) => (prev === ymd ? null : ymd))
              }
              className={cellStyle(info, stay, isSelected)}
              title={`${ymd}: ${availHint}. Click for details.`}
              aria-pressed={isSelected}
              aria-label={`${formatSelectedLabel(ymd)}, ${availHint}`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
      <div
        className="mt-4 rounded-lg border border-line bg-surface px-4 py-3 text-sm dark:bg-surface"
        role="region"
        aria-live="polite"
        aria-label="Selected night availability"
      >
        {selectedInfo ? (
          <>
            <p className="font-semibold text-ink">{selectedInfo.label}</p>
            <p className="mt-2 text-ink">
              <span className="tabular-nums text-lg font-bold text-brand">
                {selectedInfo.available}
              </span>{" "}
              of {HOTEL_NIGHT_CAPACITY} rooms available this night (all types
              combined)
            </p>
            <ul className="mt-3 space-y-2 border-t border-line pt-3 text-ink">
              <li className="flex justify-between gap-3 text-sm">
                <span className="text-muted">Presidential suites</span>
                <span className="tabular-nums font-medium">
                  {selectedInfo.presidentialAvailable} of{" "}
                  {ROOM_TYPE_CAPS.presidential} available
                </span>
              </li>
              <li className="flex justify-between gap-3 text-sm">
                <span className="text-muted">Full bed rooms</span>
                <span className="tabular-nums font-medium">
                  {selectedInfo.fullBedAvailable} of {ROOM_TYPE_CAPS.fullBed}{" "}
                  available
                </span>
              </li>
              <li className="flex justify-between gap-3 text-sm">
                <span className="text-muted">Double bed rooms</span>
                <span className="tabular-nums font-medium">
                  {selectedInfo.doubleBedAvailable} of{" "}
                  {ROOM_TYPE_CAPS.doubleBed} available
                </span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted">
              {selectedInfo.booked} room
              {selectedInfo.booked === 1 ? "" : "s"} booked in total from
              requests received on the site. Requests without a room type count
              toward the total and are spread across types for this estimate.
            </p>
          </>
        ) : (
          <p className="text-xs text-muted">
            Click a date in the calendar to see total availability and how many
            presidential, full bed, and double bed rooms are still free.
          </p>
        )}
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

"use client";

import { useMemo, useState } from "react";
import {
  HOTEL_NIGHT_CAPACITY,
  ROOM_TYPE_CAPS,
  type NightAvailability,
} from "@/lib/hotel-availability";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function monthGridCells(year: number, monthIndex: number): ({ ymd: string } | null)[] {
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

function inStayRange(ymd: string, checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return false;
  return ymd >= checkIn && ymd < checkOut;
}

function dayStyle(info: NightAvailability | undefined, isStay: boolean, isSelected: boolean): string {
  const avail = info?.available ?? HOTEL_NIGHT_CAPACITY;
  let base =
    "relative flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-medium tabular-nums transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#222] ";

  if (isSelected) {
    return base + "bg-[#222] text-white shadow-md dark:bg-white dark:text-[#222]";
  }
  if (isStay) {
    return base + "bg-[#f7f7f7] text-[#222] ring-1 ring-[#222]/20 dark:bg-[#2a2a2a] dark:text-white dark:ring-white/20";
  }
  if (avail <= 0) return base + "bg-[#ffe5e5] text-[#c13515]/60 line-through dark:bg-[#3a1515] dark:text-[#ff9999]/60";
  if (avail <= 2) return base + "text-[#c77a15] hover:bg-[#fef3e2] dark:text-[#f5c773] dark:hover:bg-[#2a2215]";
  return base + "text-[#222] hover:bg-[#f7f7f7] dark:text-[#e8e8e8] dark:hover:bg-[#2a2a2a]";
}

function formatSelectedDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
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

  const monthLabel = useMemo(
    () => new Date(viewY, viewM, 1).toLocaleString(undefined, { month: "long", year: "numeric" }),
    [viewY, viewM],
  );

  const cells = useMemo(() => monthGridCells(viewY, viewM), [viewY, viewM]);

  function prevMonth() {
    if (viewM === 0) { setViewY((y) => y - 1); setViewM(11); } else setViewM((m) => m - 1);
  }
  function nextMonth() {
    if (viewM === 11) { setViewY((y) => y + 1); setViewM(0); } else setViewM((m) => m + 1);
  }

  const selectedInfo = useMemo(() => {
    if (!selectedYmd) return null;
    const info = byNight[selectedYmd];
    return {
      label: formatSelectedDate(selectedYmd),
      booked: info?.booked ?? 0,
      available: info?.available ?? HOTEL_NIGHT_CAPACITY,
      pres: info?.presidentialAvailable ?? ROOM_TYPE_CAPS.presidential,
      full: info?.fullBedAvailable ?? ROOM_TYPE_CAPS.fullBed,
      dbl: info?.doubleBedAvailable ?? ROOM_TYPE_CAPS.doubleBed,
    };
  }, [selectedYmd, byNight]);

  return (
    <div className="rounded-2xl border border-[#ebebeb] bg-white p-5 dark:border-[#333] dark:bg-[#1a1a1a]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[#222] dark:text-white">
          Availability
        </h3>
        {loading ? (
          <span className="animate-pulse text-[12px] text-[#717171]">Loading…</span>
        ) : null}
      </div>

      {/* Month nav */}
      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-full text-[#717171] transition hover:bg-[#f7f7f7] dark:hover:bg-[#2a2a2a]" aria-label="Previous month">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.22 8.53a.75.75 0 0 1 0-1.06l3.5-3.5a.75.75 0 0 1 1.06 0Z" /></svg>
        </button>
        <span className="text-[14px] font-semibold text-[#222] dark:text-white">{monthLabel}</span>
        <button type="button" onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-full text-[#717171] transition hover:bg-[#f7f7f7] dark:hover:bg-[#2a2a2a]" aria-label="Next month">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" /></svg>
        </button>
      </div>

      {/* Weekday labels */}
      <div className="mt-3 grid grid-cols-7 text-center text-[12px] font-semibold text-[#717171]">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="mt-1 grid grid-cols-7 justify-items-center gap-y-0.5">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} className="h-10 w-10" />;
          const { ymd } = cell;
          const dayNum = Number(ymd.slice(8, 10));
          const info = byNight[ymd];
          const stay = inStayRange(ymd, checkInDate, checkOutDate);
          const isSelected = selectedYmd === ymd;
          return (
            <button
              key={ymd}
              type="button"
              onClick={() => setSelectedYmd((prev) => (prev === ymd ? null : ymd))}
              className={dayStyle(info, stay, isSelected)}
              aria-pressed={isSelected}
              aria-label={formatSelectedDate(ymd)}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 border-t border-[#ebebeb] pt-3 text-[11px] text-[#717171] dark:border-[#333]">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#f7f7f7] ring-1 ring-[#ddd]" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#fef3e2] ring-1 ring-[#f5c773]/40" /> Low</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ffe5e5] ring-1 ring-[#c13515]/20" /> Full</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#222] dark:bg-white" /> Selected</span>
      </div>

      {/* Detail panel */}
      <div className="mt-4 rounded-xl bg-[#f7f7f7] p-4 dark:bg-[#111]" role="region" aria-live="polite" aria-label="Selected night availability">
        {selectedInfo ? (
          <>
            <p className="text-[14px] font-bold text-[#222] dark:text-white">{selectedInfo.label}</p>
            <p className="mt-2 text-[14px] text-[#222] dark:text-[#e8e8e8]">
              <span className="text-[20px] font-bold tabular-nums">{selectedInfo.available}</span>
              <span className="text-[#717171]"> of {HOTEL_NIGHT_CAPACITY} rooms available</span>
            </p>
            <div className="mt-3 space-y-2 border-t border-[#ebebeb] pt-3 dark:border-[#333]">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#717171]">Presidential suites</span>
                <span className="font-semibold text-[#222] tabular-nums dark:text-white">{selectedInfo.pres} / {ROOM_TYPE_CAPS.presidential}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#717171]">Full bed rooms</span>
                <span className="font-semibold text-[#222] tabular-nums dark:text-white">{selectedInfo.full} / {ROOM_TYPE_CAPS.fullBed}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#717171]">Double bed rooms</span>
                <span className="font-semibold text-[#222] tabular-nums dark:text-white">{selectedInfo.dbl} / {ROOM_TYPE_CAPS.doubleBed}</span>
              </div>
            </div>
            {selectedInfo.booked > 0 ? (
              <p className="mt-3 text-[11px] text-[#717171]">
                {selectedInfo.booked} room{selectedInfo.booked === 1 ? "" : "s"} already requested for this night.
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-[13px] text-[#717171]">
            Click a date to see how many rooms are available by type.
          </p>
        )}
      </div>
    </div>
  );
}

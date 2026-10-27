"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import HotelAvailabilityCalendar from "@/components/HotelAvailabilityCalendar";
import {
  eachNight,
  HOTEL_NIGHT_CAPACITY,
  checkMultiRoomAvailability,
  type NightAvailability,
} from "@/lib/hotel-availability";
import {
  calculateMultiRoomBookingTotal,
  calculateNights,
  calculateTotalCapacity,
  calculateMealsFromGuestSelections,
  formatTTD,
  formatRoomCategory,
  MEAL_PRICES,
  type RoomCategory,
  type GuestMealSelection as GuestMealSelectionType,
} from "@/lib/hotel-pricing";

/* ── Airbnb-style field class ── */
const fieldClass =
  "w-full rounded-xl border border-[#b0b0b0] bg-white px-4 py-3 text-[15px] text-[#222] outline-none transition placeholder:text-[#717171] focus:border-[#222] focus:ring-1 focus:ring-[#222] dark:border-[#3a3a3a] dark:bg-[#1a1a1a] dark:text-[#e8e8e8] dark:placeholder:text-[#717171] dark:focus:border-white dark:focus:ring-white";

type GuestMeal = {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;
  presidentialSuite: string;
  fullBedRoom: string;
  doubleBedRoom: string;
  guests: string;
  children: string;
  guestMeals: GuestMeal[];  // Per-guest meal selections
  notes: string;
};

const initial: FormState = {
  fullName: "",
  email: "",
  phone: "",
  checkInDate: "",
  checkOutDate: "",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  presidentialSuite: "0",
  fullBedRoom: "0",
  doubleBedRoom: "1",
  guests: "1",
  children: "0",
  guestMeals: [{ breakfast: false, lunch: false, dinner: false }],  // Start with 1 guest
  notes: "",
};

function sumRooms(f: FormState): number {
  return (
    Math.min(2, Math.max(0, parseInt(f.presidentialSuite, 10) || 0)) +
    Math.min(2, Math.max(0, parseInt(f.fullBedRoom, 10) || 0)) +
    Math.min(4, Math.max(0, parseInt(f.doubleBedRoom, 10) || 0))
  );
}

function roomMixLine(f: FormState): string {
  const p = Math.min(2, Math.max(0, parseInt(f.presidentialSuite, 10) || 0));
  const u = Math.min(2, Math.max(0, parseInt(f.fullBedRoom, 10) || 0));
  const d = Math.min(4, Math.max(0, parseInt(f.doubleBedRoom, 10) || 0));
  const parts: string[] = [];
  if (p) parts.push(`${p} presidential suite${p === 1 ? "" : "s"}`);
  if (u) parts.push(`${u} single${u === 1 ? "" : "s"}`);
  if (d) parts.push(`${d} double${d === 1 ? "" : "s"}`);
  return parts.length ? parts.join(", ") : "—";
}

function getRoomLineItems(f: FormState): Array<{ roomCategory: RoomCategory; roomCount: number }> {
  const items: Array<{ roomCategory: RoomCategory; roomCount: number }> = [];
  const p = Math.min(2, Math.max(0, parseInt(f.presidentialSuite, 10) || 0));
  const u = Math.min(2, Math.max(0, parseInt(f.fullBedRoom, 10) || 0));
  const d = Math.min(4, Math.max(0, parseInt(f.doubleBedRoom, 10) || 0));
  
  if (p > 0) items.push({ roomCategory: "PRESIDENTIAL_SUITE", roomCount: p });
  if (u > 0) items.push({ roomCategory: "SINGLE_OCCUPANCY", roomCount: u });
  if (d > 0) items.push({ roomCategory: "DOUBLE_OCCUPANCY", roomCount: d });
  
  return items;
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function icsUtcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function buildStayIcs(f: FormState): string {
  const uid = `hotel-${Date.now()}@ttpsswa.local`;
  const dtStamp = icsUtcStamp(new Date());
  const dStart = f.checkInDate.replace(/-/g, "");
  const dEnd = f.checkOutDate.replace(/-/g, "");
  const total = sumRooms(f);
  const desc = icsEscape(
    [`Rooms (${total}): ${roomMixLine(f)}`, `Guests: ${f.guests} adult${Number(f.guests) === 1 ? "" : "s"}${Number(f.children) > 0 ? `, ${f.children} child${Number(f.children) === 1 ? "" : "ren"}` : ""}`, f.notes.trim() ? `Notes: ${f.notes.trim()}` : ""].filter(Boolean).join("\\n"),
  );
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TTPSSWA//Hotel Stay//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${dtStamp}`, `DTSTART;VALUE=DATE:${dStart}`,
    `DTEND;VALUE=DATE:${dEnd}`, `SUMMARY:${icsEscape("TTPSSWA hotel stay")}`, `DESCRIPTION:${desc}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

function googleCalendarStayUrl(f: FormState): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "TTPSSWA hotel stay",
    dates: `${f.checkInDate.replace(/-/g, "")}/${f.checkOutDate.replace(/-/g, "")}`,
    details: [`Rooms (${sumRooms(f)}): ${roomMixLine(f)}`, `Guests: ${f.guests} adult${Number(f.guests) === 1 ? "" : "s"}${Number(f.children) > 0 ? `, ${f.children} child${Number(f.children) === 1 ? "" : "ren"}` : ""}`, f.notes.trim() ? `Notes: ${f.notes.trim()}` : ""].filter(Boolean).join("\n"),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* ── Room card ── */
function RoomCard({
  emoji,
  title,
  subtitle,
  max,
  value,
  onChange,
  selectId,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  max: number;
  value: string;
  onChange: (v: string) => void;
  selectId: string;
}) {
  const n = parseInt(value, 10) || 0;
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#ddd] bg-white p-5 transition hover:shadow-md dark:border-[#333] dark:bg-[#1a1a1a]">
      <div className="flex items-center gap-3.5">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="text-[15px] font-semibold text-[#222] dark:text-white">
            {title}
          </p>
          <p className="text-xs text-[#717171]">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(String(Math.max(0, n - 1)))}
          disabled={n <= 0}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b0b0b0] text-sm text-[#717171] transition hover:border-[#222] hover:text-[#222] disabled:cursor-not-allowed disabled:border-[#ebebeb] disabled:text-[#ebebeb] dark:border-[#555] dark:hover:border-white dark:hover:text-white dark:disabled:border-[#333] dark:disabled:text-[#333]"
          aria-label={`Decrease ${title}`}
        >
          −
        </button>
        <span
          id={selectId}
          className="w-6 text-center font-mono text-[15px] font-semibold text-[#222] tabular-nums dark:text-white"
        >
          {n}
        </span>
        <button
          type="button"
          onClick={() => onChange(String(Math.min(max, n + 1)))}
          disabled={n >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b0b0b0] text-sm text-[#717171] transition hover:border-[#222] hover:text-[#222] disabled:cursor-not-allowed disabled:border-[#ebebeb] disabled:text-[#ebebeb] dark:border-[#555] dark:hover:border-white dark:hover:text-white dark:disabled:border-[#333] dark:disabled:text-[#333]"
          aria-label={`Increase ${title}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ── Inline date range picker ── */
const PICKER_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function pickerMonthCells(year: number, monthIndex: number): (string | null)[] {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatDisplayDate(ymd: string): string {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function DateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  open,
  onClose,
  pickingField,
  onPickingFieldChange,
}: {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (v: string) => void;
  onCheckOutChange: (v: string) => void;
  open: boolean;
  onClose: () => void;
  pickingField: "checkIn" | "checkOut";
  onPickingFieldChange: (f: "checkIn" | "checkOut") => void;
}) {
  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  }, []);

  const initial = useMemo(() => {
    if (checkIn) {
      const [y, m] = checkIn.split("-").map(Number);
      return { y, m: m - 1 };
    }
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() };
  }, [checkIn]);

  const [viewY, setViewY] = useState(initial.y);
  const [viewM, setViewM] = useState(initial.m);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (open && checkIn) {
      const [y, m] = checkIn.split("-").map(Number);
      setViewY(y);
      setViewM(m - 1);
    } else if (open) {
      const t = new Date();
      setViewY(t.getFullYear());
      setViewM(t.getMonth());
    }
  }, [open, checkIn]);

  const monthLabel = useMemo(
    () => new Date(viewY, viewM, 1).toLocaleString(undefined, { month: "long", year: "numeric" }),
    [viewY, viewM],
  );
  const month2Label = useMemo(() => {
    const m2 = viewM === 11 ? 0 : viewM + 1;
    const y2 = viewM === 11 ? viewY + 1 : viewY;
    return new Date(y2, m2, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [viewY, viewM]);

  const cells1 = useMemo(() => pickerMonthCells(viewY, viewM), [viewY, viewM]);
  const cells2 = useMemo(() => {
    const m2 = viewM === 11 ? 0 : viewM + 1;
    const y2 = viewM === 11 ? viewY + 1 : viewY;
    return pickerMonthCells(y2, m2);
  }, [viewY, viewM]);

  function prevMonth() {
    if (viewM === 0) { setViewY((y) => y - 1); setViewM(11); } else setViewM((m) => m - 1);
  }
  function nextMonth() {
    if (viewM === 11) { setViewY((y) => y + 1); setViewM(0); } else setViewM((m) => m + 1);
  }

  function handleDayClick(ymd: string) {
    if (ymd < todayStr) return;
    if (pickingField === "checkIn") {
      onCheckInChange(ymd);
      if (checkOut && ymd >= checkOut) onCheckOutChange("");
      onPickingFieldChange("checkOut");
    } else {
      if (ymd <= checkIn) {
        onCheckInChange(ymd);
        onCheckOutChange("");
        onPickingFieldChange("checkOut");
      } else {
        onCheckOutChange(ymd);
        onClose();
      }
    }
  }

  function dayClasses(ymd: string): string {
    const isPast = ymd < todayStr;
    const isCheckIn = ymd === checkIn;
    const isCheckOut = ymd === checkOut;
    const effectiveEnd = pickingField === "checkOut" && !checkOut && hovered && hovered > checkIn ? hovered : checkOut;
    const inRange = checkIn && effectiveEnd && ymd > checkIn && ymd < effectiveEnd;
    const isRangeStart = ymd === checkIn && !!effectiveEnd && effectiveEnd > checkIn;
    const isRangeEnd = ymd === effectiveEnd && !!checkIn && effectiveEnd > checkIn;

    let base = "relative flex h-10 w-10 items-center justify-center text-[14px] font-medium tabular-nums transition-all duration-100 ";

    if (isPast) return base + "cursor-default text-[#ccc] dark:text-[#444]";
    if (isCheckIn || isCheckOut) return base + "z-10 rounded-full bg-[#222] text-white shadow-md cursor-pointer dark:bg-white dark:text-[#222]";
    if (inRange) return base + "bg-[#f0f0f0] text-[#222] cursor-pointer dark:bg-[#2a2a2a] dark:text-white " + (isRangeStart ? "rounded-l-full" : "") + (isRangeEnd ? "rounded-r-full" : "");
    return base + "rounded-full cursor-pointer text-[#222] hover:bg-[#f7f7f7] dark:text-[#e8e8e8] dark:hover:bg-[#2a2a2a]";
  }

  function rangeBg(ymd: string): string | null {
    const effectiveEnd = pickingField === "checkOut" && !checkOut && hovered && hovered > checkIn ? hovered : checkOut;
    if (!checkIn || !effectiveEnd || effectiveEnd <= checkIn) return null;
    if (ymd === checkIn) return "rounded-l-full bg-[#f0f0f0] dark:bg-[#2a2a2a]";
    if (ymd === effectiveEnd) return "rounded-r-full bg-[#f0f0f0] dark:bg-[#2a2a2a]";
    if (ymd > checkIn && ymd < effectiveEnd) return "bg-[#f0f0f0] dark:bg-[#2a2a2a]";
    return null;
  }

  if (!open) return null;

  function renderMonth(cells: (string | null)[], label: string) {
    return (
      <div className="min-w-0 flex-1">
        <p className="text-center text-[14px] font-semibold text-[#222] dark:text-white">{label}</p>
        <div className="mt-3 grid grid-cols-7 text-center text-[12px] font-semibold text-[#717171]">
          {PICKER_WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7">
          {cells.map((ymd, i) => {
            if (!ymd) return <div key={`e-${i}`} className="h-10 w-10" />;
            const dayNum = Number(ymd.slice(8, 10));
            const bg = rangeBg(ymd);
            return (
              <div key={ymd} className={`flex items-center justify-center ${bg ?? ""}`}>
                <button
                  type="button"
                  onClick={() => handleDayClick(ymd)}
                  onMouseEnter={() => setHovered(ymd)}
                  onMouseLeave={() => setHovered(null)}
                  className={dayClasses(ymd)}
                  disabled={ymd < todayStr}
                >
                  {dayNum}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#ddd] bg-white p-5 shadow-xl dark:border-[#444] dark:bg-[#1a1a1a]">
      {/* Picking indicator */}
      <div className="mb-4 flex gap-2">
        <button type="button" onClick={() => onPickingFieldChange("checkIn")} className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${pickingField === "checkIn" ? "bg-[#222] text-white dark:bg-white dark:text-[#222]" : "bg-[#f7f7f7] text-[#717171] hover:bg-[#ebebeb] dark:bg-[#333] dark:text-[#aaa] dark:hover:bg-[#444]"}`}>
          Check-in{checkIn ? `: ${formatDisplayDate(checkIn)}` : ""}
        </button>
        <button type="button" onClick={() => onPickingFieldChange("checkOut")} className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${pickingField === "checkOut" ? "bg-[#222] text-white dark:bg-white dark:text-[#222]" : "bg-[#f7f7f7] text-[#717171] hover:bg-[#ebebeb] dark:bg-[#333] dark:text-[#aaa] dark:hover:bg-[#444]"}`}>
          Check-out{checkOut ? `: ${formatDisplayDate(checkOut)}` : ""}
        </button>
      </div>

      {/* Month nav + grids */}
      <div className="flex items-start justify-between">
        <button type="button" onClick={prevMonth} className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#717171] transition hover:bg-[#f7f7f7] dark:hover:bg-[#2a2a2a]" aria-label="Previous month">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.22 8.53a.75.75 0 0 1 0-1.06l3.5-3.5a.75.75 0 0 1 1.06 0Z" /></svg>
        </button>
        <div className="flex min-w-0 flex-1 gap-6">
          {renderMonth(cells1, monthLabel)}
          <div className="hidden min-w-0 flex-1 md:block">
            {renderMonth(cells2, month2Label)}
          </div>
        </div>
        <button type="button" onClick={nextMonth} className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#717171] transition hover:bg-[#f7f7f7] dark:hover:bg-[#2a2a2a]" aria-label="Next month">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" /></svg>
        </button>
      </div>

      {/* Clear + close */}
      <div className="mt-4 flex items-center justify-between border-t border-[#ebebeb] pt-3 dark:border-[#333]">
        <button type="button" onClick={() => { onCheckInChange(""); onCheckOutChange(""); onPickingFieldChange("checkIn"); }} className="text-[13px] font-semibold text-[#222] underline underline-offset-4 dark:text-white">
          Clear dates
        </button>
        <button type="button" onClick={onClose} className="rounded-lg bg-[#222] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#000] dark:bg-white dark:text-[#222] dark:hover:bg-[#e8e8e8]">
          Close
        </button>
      </div>
    </div>
  );
}

/* ── ErrorLine ── */
function Err({ msg }: { msg: string | undefined }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-[13px] text-[#c13515]">{msg}</p>;
}

/* ── Main form ── */
export default function HotelReservationForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mailtoFallbackHref, setMailtoFallbackHref] = useState<string | null>(null);
  const [byNight, setByNight] = useState<Record<string, NightAvailability>>({});
  const [availLoading, setAvailLoading] = useState(true);
  const [availError, setAvailError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pickingField, setPickingField] = useState<"checkIn" | "checkOut">("checkIn");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const update = useCallback((key: keyof FormState, value: string | GuestMeal[]) => {
    setForm((prev) => {
      let next = { ...prev, [key]: value };
      
      // Enforce room capacity limits
      if (key === "presidentialSuite" || key === "fullBedRoom" || key === "doubleBedRoom") {
        let p = Math.min(2, Math.max(0, parseInt(next.presidentialSuite, 10) || 0));
        let u = Math.min(2, Math.max(0, parseInt(next.fullBedRoom, 10) || 0));
        let d = Math.min(4, Math.max(0, parseInt(next.doubleBedRoom, 10) || 0));
        if (p + u + d > HOTEL_NIGHT_CAPACITY) {
          if (key === "presidentialSuite") p = Math.max(0, HOTEL_NIGHT_CAPACITY - u - d);
          else if (key === "fullBedRoom") u = Math.max(0, HOTEL_NIGHT_CAPACITY - p - d);
          else d = Math.max(0, HOTEL_NIGHT_CAPACITY - p - u);
          next = { ...next, presidentialSuite: String(p), fullBedRoom: String(u), doubleBedRoom: String(d) };
        }
      }
      
      // Sync guest meal selections array with guest count
      if (key === "guests") {
        const newGuestCount = Math.max(1, Math.min(10, parseInt(value as string, 10) || 1));
        const currentMeals = prev.guestMeals;
        const newMeals = [...currentMeals];
        
        // Add new guest entries if count increased
        while (newMeals.length < newGuestCount) {
          newMeals.push({ breakfast: false, lunch: false, dinner: false });
        }
        
        // Remove excess entries if count decreased
        if (newMeals.length > newGuestCount) {
          newMeals.splice(newGuestCount);
        }
        
        next.guestMeals = newMeals;
      }
      
      return next;
    });
    setErrors((e) => {
      const n = { ...e };
      delete n[key]; delete n.roomMix; delete n.availability;
      return n;
    });
  }, []);
  
  const updateGuestMeal = useCallback((guestIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', checked: boolean) => {
    setForm((prev) => {
      const newMeals = [...prev.guestMeals];
      if (newMeals[guestIndex]) {
        newMeals[guestIndex] = { ...newMeals[guestIndex], [mealType]: checked };
      }
      return { ...prev, guestMeals: newMeals };
    });
  }, []);

  useEffect(() => {
    const today = new Date();
    const from = today.toISOString().slice(0, 10);
    const end = new Date(today);
    end.setFullYear(end.getFullYear() + 1);
    const to = end.toISOString().slice(0, 10);
    let cancelled = false;
    setAvailLoading(true);
    setAvailError(null);
    fetch(`/api/hotel-availability?from=${from}&to=${to}`)
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as { error?: string; byNight?: Record<string, NightAvailability> };
        if (!res.ok) throw new Error(data.error || "Could not load availability.");
        if (!cancelled && data.byNight) setByNight(data.byNight);
      })
      .catch((err: unknown) => {
        if (!cancelled) { setAvailError(err instanceof Error ? err.message : "Could not load availability."); setByNight({}); }
      })
      .finally(() => { if (!cancelled) setAvailLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Enter your full name.";
    if (!form.email.trim()) e.email = "Enter an email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (!form.phone.trim()) e.phone = "Enter a phone number.";
    if (!form.checkInDate) e.checkInDate = "Choose a check-in date.";
    if (!form.checkOutDate) e.checkOutDate = "Choose a check-out date.";
    if (!form.checkInTime) e.checkInTime = "Choose a check-in time.";
    if (!form.checkOutTime) e.checkOutTime = "Choose a check-out time.";
    
    const total = sumRooms(form);
    if (total < 1) e.roomMix = "Select at least one room.";
    else if (total > HOTEL_NIGHT_CAPACITY) e.roomMix = `Max ${HOTEL_NIGHT_CAPACITY} rooms.`;
    
    if (form.checkInDate && form.checkOutDate) {
      if (new Date(form.checkOutDate) < new Date(form.checkInDate)) {
        e.checkOutDate = "Check-out must be on or after check-in.";
      } else if (form.checkInDate === form.checkOutDate && form.checkInTime && form.checkOutTime) {
        const [ih, im] = form.checkInTime.split(":").map(Number);
        const [oh, om] = form.checkOutTime.split(":").map(Number);
        if (ih * 60 + im >= oh * 60 + om) e.checkOutTime = "Check-out time must be after check-in on the same day.";
      }
      
      // Check if booking exceeds 30 nights
      const nights = calculateNights(form.checkInDate, form.checkOutDate);
      if (nights > 30) {
        e.checkOutDate = "Bookings are limited to 30 nights.";
      }
      
      // Check guest capacity
      const roomLineItems = getRoomLineItems(form);
      const totalCapacity = calculateTotalCapacity(roomLineItems);
      const guestCount = parseInt(form.guests, 10) || 0;
      if (guestCount > totalCapacity) {
        e.guests = `Selected rooms accommodate up to ${totalCapacity} guest${totalCapacity === 1 ? "" : "s"}.`;
      }
    }
    
    // Check per-room-type availability
    if (!e.roomMix && total >= 1 && form.checkInDate && form.checkOutDate && !e.checkOutDate) {
      const p = Math.min(2, Math.max(0, parseInt(form.presidentialSuite, 10) || 0));
      const u = Math.min(2, Math.max(0, parseInt(form.fullBedRoom, 10) || 0));
      const d = Math.min(4, Math.max(0, parseInt(form.doubleBedRoom, 10) || 0));
      
      const availCheck = checkMultiRoomAvailability(
        byNight,
        form.checkInDate,
        form.checkOutDate,
        { presidential: p, fullBed: u, doubleBed: d }
      );
      
      if (!availCheck.available) {
        const typeLabel = availCheck.conflictType === 'presidential' 
          ? 'Presidential Suite' 
          : availCheck.conflictType === 'fullBed' 
          ? 'Single Occupancy' 
          : 'Double Occupancy';
        e.availability = `${typeLabel} rooms not available on ${availCheck.conflictNight}. Please adjust your selection.`;
      }
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, byNight]);

  const summaryLines = useMemo(() => {
    if (!submitted) return [];
    const total = sumRooms(form);
    const nights = calculateNights(form.checkInDate, form.checkOutDate);
    
    const lines = [
      `Guest: ${form.fullName}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Check-in: ${form.checkInDate} at ${form.checkInTime}`,
      `Check-out: ${form.checkOutDate} at ${form.checkOutTime}`,
      `Rooms (${total}): ${roomMixLine(form)}`,
      `Adults: ${form.guests}`,
    ];
    
    if (Number(form.children) > 0) {
      lines.push(`Children: ${form.children}`);
    }
    
    // Add meal summary
    const breakfastCount = form.guestMeals.filter(g => g.breakfast).length;
    const lunchCount = form.guestMeals.filter(g => g.lunch).length;
    const dinnerCount = form.guestMeals.filter(g => g.dinner).length;
    
    if (breakfastCount > 0 || lunchCount > 0 || dinnerCount > 0) {
      lines.push('Meals:');
      if (breakfastCount > 0) lines.push(`  Breakfast: ${breakfastCount} guest${breakfastCount === 1 ? '' : 's'} × ${nights} night${nights === 1 ? '' : 's'} = ${breakfastCount * nights} meals`);
      if (lunchCount > 0) lines.push(`  Lunch: ${lunchCount} guest${lunchCount === 1 ? '' : 's'} × ${nights} night${nights === 1 ? '' : 's'} = ${lunchCount * nights} meals`);
      if (dinnerCount > 0) lines.push(`  Dinner: ${dinnerCount} guest${dinnerCount === 1 ? '' : 's'} × ${nights} night${nights === 1 ? '' : 's'} = ${dinnerCount * nights} meals`);
    } else {
      lines.push('Meals: None selected');
    }
    
    if (form.notes.trim()) {
      lines.push(`Notes: ${form.notes.trim()}`);
    }
    
    return lines;
  }, [submitted, form]);

  const canAddToCalendar = form.checkInDate && form.checkOutDate && new Date(form.checkOutDate) >= new Date(form.checkInDate);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitError(null); setMailtoFallbackHref(null); setSubmitting(true);
    try {
      const roomLineItems = getRoomLineItems(form);
      const total = sumRooms(form);
      
      // Build guest meal selections with indices
      const guestMealSelections = form.guestMeals.map((meal, index) => ({
        guestIndex: index,
        breakfast: meal.breakfast,
        lunch: meal.lunch,
        dinner: meal.dinner,
      }));
      
      // Build multi-room payload
      const payload = { 
        ...form, 
        rooms: roomLineItems,  // Array of {roomCategory, roomCount}
        guestMealSelections,   // Per-guest meal selections
        roomsTotal: String(total),  // Legacy compatibility
        turnstileToken 
      };
      
      const res = await fetch("/api/hotel-booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json().catch(() => ({}))) as { error?: string; mailtoHref?: string };
      if (!res.ok) { setSubmitError(data.error || "Something went wrong."); setMailtoFallbackHref(typeof data.mailtoHref === "string" ? data.mailtoHref : null); return; }
      setSubmitted(true);
    } catch { setSubmitError("Could not reach the server."); } finally { setSubmitting(false); }
  };

  const reset = () => { setForm(initial); setErrors({}); setSubmitted(false); setSubmitError(null); setMailtoFallbackHref(null); };

  const downloadIcs = () => {
    const blob = new Blob([buildStayIcs(form)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ttpsswa-hotel-stay-${form.checkInDate}.ics`; a.click();
    URL.revokeObjectURL(url);
  };

  const nightCount = form.checkInDate && form.checkOutDate && new Date(form.checkOutDate) > new Date(form.checkInDate)
    ? Math.round((new Date(form.checkOutDate).getTime() - new Date(form.checkInDate).getTime()) / 86400000)
    : 0;

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#ddd] bg-white p-8 shadow-lg sm:p-10 dark:border-[#333] dark:bg-[#1a1a1a]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <span className="text-2xl">✓</span>
        </div>
        <h3 className="mt-5 text-2xl font-bold text-[#222] dark:text-white">
          Request received
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[#717171]">
          Your reservation request has been emailed to our accommodations team.
          A coordinator will confirm availability shortly. A room is not
          guaranteed until we confirm with you.
        </p>
        <div className="mt-6 space-y-1.5 rounded-2xl border border-[#ebebeb] bg-[#f7f7f7] p-5 text-[14px] text-[#222] dark:border-[#333] dark:bg-[#111] dark:text-[#e8e8e8]">
          {summaryLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        {canAddToCalendar ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={downloadIcs} className="rounded-xl border border-[#222] px-5 py-2.5 text-sm font-semibold text-[#222] transition hover:bg-[#f7f7f7] dark:border-white dark:text-white dark:hover:bg-[#222]">
              Download .ics
            </button>
            <a href={googleCalendarStayUrl(form)} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#222] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#000] dark:bg-white dark:text-[#222] dark:hover:bg-[#e8e8e8]">
              Add to Google Calendar
            </a>
          </div>
        ) : null}
        <button type="button" onClick={reset} className="mt-8 text-sm font-semibold text-[#222] underline underline-offset-4 hover:text-[#000] dark:text-white dark:hover:text-[#ccc]">
          Make another booking
        </button>
      </div>
    );
  }

  /* ── Booking form ── */
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* ── Left column: main form ── */}
        <div className="space-y-10">
          {/* Room cards */}
          <section>
            <h2 className="text-[22px] font-bold text-[#222] dark:text-white">
              Choose your rooms
            </h2>
            <p className="mt-1 text-[14px] text-[#717171]">
              {HOTEL_NIGHT_CAPACITY} rooms total — rooms can be adjusted to accommodate more persons on request.
            </p>
            <div className="mt-5 space-y-3">
              <RoomCard
                emoji="👑"
                title="Presidential suite"
                subtitle="Max 2 per room · premium suite"
                max={2}
                value={form.presidentialSuite}
                onChange={(v) => update("presidentialSuite", v)}
                selectId="hr-pres"
              />
              <RoomCard
                emoji="🛏️"
                title="Full bed room"
                subtitle="Max 2 per room · standard full"
                max={2}
                value={form.fullBedRoom}
                onChange={(v) => update("fullBedRoom", v)}
                selectId="hr-full"
              />
              <RoomCard
                emoji="🛌"
                title="Double bed room"
                subtitle="Max 4 per room · double occupancy"
                max={4}
                value={form.doubleBedRoom}
                onChange={(v) => update("doubleBedRoom", v)}
                selectId="hr-dbl"
              />
            </div>
            <Err msg={errors.roomMix} />
            <Err msg={errors.availability} />
          </section>

          <hr className="border-[#ebebeb] dark:border-[#333]" />

          {/* Dates & times */}
          <section>
            <h2 className="text-[22px] font-bold text-[#222] dark:text-white">
              When are you staying?
            </h2>
            <p className="mt-1 text-[14px] text-[#717171]">
              Pick your dates on the calendar, then set arrival &amp; departure times.
            </p>
            {availError ? (
              <p className="mt-2 text-[13px] text-amber-700 dark:text-amber-300">{availError}</p>
            ) : null}

            {/* Clickable date cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => { setPickingField("checkIn"); setCalendarOpen(true); }}
                className={`group relative overflow-hidden rounded-2xl border text-left transition hover:shadow-md ${calendarOpen && pickingField === "checkIn" ? "border-[#222] ring-2 ring-[#222] dark:border-white dark:ring-white" : "border-[#b0b0b0] dark:border-[#555]"}`}
              >
                <div className="border-b border-[#ebebeb] px-4 pb-2 pt-3 dark:border-[#333]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">Check-in</span>
                  <p className={`pt-1 text-[15px] font-semibold ${form.checkInDate ? "text-[#222] dark:text-white" : "text-[#b0b0b0] dark:text-[#555]"}`}>
                    {form.checkInDate ? formatDisplayDate(form.checkInDate) : "Add date"}
                  </p>
                </div>
                <div className="px-4 pb-3 pt-2">
                  <label htmlFor="hr-checkin-time" className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">Time</label>
                  <input
                    id="hr-checkin-time"
                    name="checkInTime"
                    type="time"
                    value={form.checkInTime}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => update("checkInTime", e.target.value)}
                    className="w-full border-0 bg-transparent p-0 pt-1 text-[15px] font-semibold text-[#222] outline-none dark:text-white"
                    aria-invalid={!!errors.checkInTime}
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setPickingField("checkOut"); setCalendarOpen(true); }}
                className={`group relative overflow-hidden rounded-2xl border text-left transition hover:shadow-md ${calendarOpen && pickingField === "checkOut" ? "border-[#222] ring-2 ring-[#222] dark:border-white dark:ring-white" : "border-[#b0b0b0] dark:border-[#555]"}`}
              >
                <div className="border-b border-[#ebebeb] px-4 pb-2 pt-3 dark:border-[#333]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">Check-out</span>
                  <p className={`pt-1 text-[15px] font-semibold ${form.checkOutDate ? "text-[#222] dark:text-white" : "text-[#b0b0b0] dark:text-[#555]"}`}>
                    {form.checkOutDate ? formatDisplayDate(form.checkOutDate) : "Add date"}
                  </p>
                </div>
                <div className="px-4 pb-3 pt-2">
                  <label htmlFor="hr-checkout-time" className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">Time</label>
                  <input
                    id="hr-checkout-time"
                    name="checkOutTime"
                    type="time"
                    value={form.checkOutTime}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => update("checkOutTime", e.target.value)}
                    className="w-full border-0 bg-transparent p-0 pt-1 text-[15px] font-semibold text-[#222] outline-none dark:text-white"
                    aria-invalid={!!errors.checkOutTime}
                  />
                </div>
              </button>
            </div>

            {/* Inline date range calendar */}
            <DateRangePicker
              checkIn={form.checkInDate}
              checkOut={form.checkOutDate}
              onCheckInChange={(v) => update("checkInDate", v)}
              onCheckOutChange={(v) => update("checkOutDate", v)}
              open={calendarOpen}
              onClose={() => setCalendarOpen(false)}
              pickingField={pickingField}
              onPickingFieldChange={setPickingField}
            />

            <Err msg={errors.checkInDate} />
            <Err msg={errors.checkOutDate} />
            <Err msg={errors.checkInTime} />
            <Err msg={errors.checkOutTime} />

            {/* Availability calendar */}
            <div className="mt-6">
              <HotelAvailabilityCalendar byNight={byNight} checkInDate={form.checkInDate} checkOutDate={form.checkOutDate} loading={availLoading} />
            </div>
          </section>

          <hr className="border-[#ebebeb] dark:border-[#333]" />

          {/* Guests */}
          <section>
            <h2 className="text-[22px] font-bold text-[#222] dark:text-white">
              Guests
            </h2>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-[#ddd] bg-white p-5 dark:border-[#333] dark:bg-[#1a1a1a]">
                <div>
                  <p className="text-[15px] font-semibold text-[#222] dark:text-white">Adults</p>
                  <p className="text-xs text-[#717171]">Age 13+</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => update("guests", String(Math.max(1, (parseInt(form.guests, 10) || 1) - 1)))} disabled={(parseInt(form.guests, 10) || 1) <= 1} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b0b0b0] text-sm text-[#717171] transition hover:border-[#222] hover:text-[#222] disabled:cursor-not-allowed disabled:border-[#ebebeb] disabled:text-[#ebebeb] dark:border-[#555] dark:hover:border-white dark:hover:text-white dark:disabled:border-[#333] dark:disabled:text-[#333]" aria-label="Decrease adults">−</button>
                  <span id="hr-guests" className="w-6 text-center font-mono text-[15px] font-semibold text-[#222] tabular-nums dark:text-white">{parseInt(form.guests, 10) || 1}</span>
                  <button type="button" onClick={() => update("guests", String(Math.min(10, (parseInt(form.guests, 10) || 1) + 1)))} disabled={(parseInt(form.guests, 10) || 1) >= 10} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b0b0b0] text-sm text-[#717171] transition hover:border-[#222] hover:text-[#222] disabled:cursor-not-allowed disabled:border-[#ebebeb] disabled:text-[#ebebeb] dark:border-[#555] dark:hover:border-white dark:hover:text-white dark:disabled:border-[#333] dark:disabled:text-[#333]" aria-label="Increase adults">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[#ddd] bg-white p-5 dark:border-[#333] dark:bg-[#1a1a1a]">
                <div>
                  <p className="text-[15px] font-semibold text-[#222] dark:text-white">Children</p>
                  <p className="text-xs text-[#717171]">Ages 0–12</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => update("children", String(Math.max(0, (parseInt(form.children, 10) || 0) - 1)))} disabled={(parseInt(form.children, 10) || 0) <= 0} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b0b0b0] text-sm text-[#717171] transition hover:border-[#222] hover:text-[#222] disabled:cursor-not-allowed disabled:border-[#ebebeb] disabled:text-[#ebebeb] dark:border-[#555] dark:hover:border-white dark:hover:text-white dark:disabled:border-[#333] dark:disabled:text-[#333]" aria-label="Decrease children">−</button>
                  <span id="hr-children" className="w-6 text-center font-mono text-[15px] font-semibold text-[#222] tabular-nums dark:text-white">{parseInt(form.children, 10) || 0}</span>
                  <button type="button" onClick={() => update("children", String(Math.min(10, (parseInt(form.children, 10) || 0) + 1)))} disabled={(parseInt(form.children, 10) || 0) >= 10} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b0b0b0] text-sm text-[#717171] transition hover:border-[#222] hover:text-[#222] disabled:cursor-not-allowed disabled:border-[#ebebeb] disabled:text-[#ebebeb] dark:border-[#555] dark:hover:border-white dark:hover:text-white dark:disabled:border-[#333] dark:disabled:text-[#333]" aria-label="Increase children">+</button>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-[#ebebeb] dark:border-[#333]" />

          {/* Meal Selection */}
          <section>
            <h2 className="text-[22px] font-bold text-[#222] dark:text-white">
              Meal preferences
            </h2>
            <p className="mt-1 text-[14px] text-[#717171]">
              Select meals for each guest. Prices are per person, per meal, per night.
            </p>
            
            <div className="mt-5 space-y-3">
              {form.guestMeals.map((guestMeal, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[#ddd] bg-white p-5 dark:border-[#333] dark:bg-[#1a1a1a]"
                >
                  <div className="mb-3">
                    <p className="text-[15px] font-semibold text-[#222] dark:text-white">
                      Guest {index + 1}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={guestMeal.breakfast}
                        onChange={(e) => updateGuestMeal(index, 'breakfast', e.target.checked)}
                        className="h-5 w-5 rounded border-[#b0b0b0] text-[#222] focus:ring-2 focus:ring-[#222] dark:border-[#555] dark:bg-[#1a1a1a] dark:text-white dark:focus:ring-white"
                      />
                      <span className="text-[14px] text-[#222] dark:text-white">
                        Breakfast ({formatTTD(MEAL_PRICES.Breakfast)}/night)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={guestMeal.lunch}
                        onChange={(e) => updateGuestMeal(index, 'lunch', e.target.checked)}
                        className="h-5 w-5 rounded border-[#b0b0b0] text-[#222] focus:ring-2 focus:ring-[#222] dark:border-[#555] dark:bg-[#1a1a1a] dark:text-white dark:focus:ring-white"
                      />
                      <span className="text-[14px] text-[#222] dark:text-white">
                        Lunch ({formatTTD(MEAL_PRICES.Lunch)}/night)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={guestMeal.dinner}
                        onChange={(e) => updateGuestMeal(index, 'dinner', e.target.checked)}
                        className="h-5 w-5 rounded border-[#b0b0b0] text-[#222] focus:ring-2 focus:ring-[#222] dark:border-[#555] dark:bg-[#1a1a1a] dark:text-white dark:focus:ring-white"
                      />
                      <span className="text-[14px] text-[#222] dark:text-white">
                        Dinner ({formatTTD(MEAL_PRICES.Dinner)}/night)
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            
            {nightCount > 0 && form.guestMeals.some(g => g.breakfast || g.lunch || g.dinner) && (
              <div className="mt-4 rounded-xl border border-[#ebebeb] bg-[#f7f7f7] p-4 dark:border-[#333] dark:bg-[#111]">
                <p className="text-[13px] font-semibold text-[#222] dark:text-white">Meal Summary</p>
                <div className="mt-2 space-y-1 text-[13px] text-[#717171]">
                  {(() => {
                    const guestMealSelections = form.guestMeals.map((meal, idx) => ({
                      guestIndex: idx,
                      breakfast: meal.breakfast,
                      lunch: meal.lunch,
                      dinner: meal.dinner,
                    }));
                    const breakdown = calculateMealsFromGuestSelections(guestMealSelections, nightCount);
                    
                    return (
                      <>
                        {breakdown.breakfast.guestCount > 0 && (
                          <p>
                            Breakfast: {breakdown.breakfast.guestCount} guest{breakdown.breakfast.guestCount === 1 ? '' : 's'} × {nightCount} night{nightCount === 1 ? '' : 's'} = {breakdown.breakfast.totalMeals} meals · {formatTTD(breakdown.breakfast.subtotal)}
                          </p>
                        )}
                        {breakdown.lunch.guestCount > 0 && (
                          <p>
                            Lunch: {breakdown.lunch.guestCount} guest{breakdown.lunch.guestCount === 1 ? '' : 's'} × {nightCount} night{nightCount === 1 ? '' : 's'} = {breakdown.lunch.totalMeals} meals · {formatTTD(breakdown.lunch.subtotal)}
                          </p>
                        )}
                        {breakdown.dinner.guestCount > 0 && (
                          <p>
                            Dinner: {breakdown.dinner.guestCount} guest{breakdown.dinner.guestCount === 1 ? '' : 's'} × {nightCount} night{nightCount === 1 ? '' : 's'} = {breakdown.dinner.totalMeals} meals · {formatTTD(breakdown.dinner.subtotal)}
                          </p>
                        )}
                        <p className="pt-2 font-semibold text-[#222] dark:text-white">
                          Total Meals: {formatTTD(breakdown.total)}
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </section>

          <hr className="border-[#ebebeb] dark:border-[#333]" />

          {/* Guest info */}
          <section>
            <h2 className="text-[22px] font-bold text-[#222] dark:text-white">
              Your details
            </h2>
            <p className="mt-1 text-[14px] text-[#717171]">
              We&apos;ll use this to send your booking confirmation.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="hr-name" className="mb-1.5 block text-[13px] font-semibold text-[#222] dark:text-white">Full name</label>
                <input id="hr-name" name="fullName" autoComplete="name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={fieldClass} aria-invalid={!!errors.fullName} />
                <Err msg={errors.fullName} />
              </div>
              <div>
                <label htmlFor="hr-email" className="mb-1.5 block text-[13px] font-semibold text-[#222] dark:text-white">Email</label>
                <input id="hr-email" name="email" type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={fieldClass} aria-invalid={!!errors.email} />
                <Err msg={errors.email} />
              </div>
              <div>
                <label htmlFor="hr-phone" className="mb-1.5 block text-[13px] font-semibold text-[#222] dark:text-white">Phone</label>
                <input id="hr-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={fieldClass} placeholder="Include area code" aria-invalid={!!errors.phone} />
                <Err msg={errors.phone} />
              </div>
            </div>
          </section>

          <hr className="border-[#ebebeb] dark:border-[#333]" />

          {/* Notes */}
          <section>
            <h2 className="text-[22px] font-bold text-[#222] dark:text-white">
              Special requests
            </h2>
            <textarea id="hr-notes" name="notes" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} className={`${fieldClass} mt-4 resize-y`} placeholder="Accessibility, dietary, late arrival, etc." />
          </section>

          {/* Turnstile spam protection */}
          <div className="mt-8">
            <TurnstileWidget onToken={setTurnstileToken} />
          </div>

          {/* Submit — mobile only (desktop uses sticky card) */}
          <div className="lg:hidden">
            <button type="submit" disabled={submitting} className="site-btn-hotel-submit py-4 text-[16px] disabled:opacity-60">
              {submitting ? "Sending…" : "Reserve"}
            </button>
            <p className="mt-3 text-center text-[12px] text-[#717171]">We confirm availability after submission.</p>
          </div>
        </div>

        {/* ── Right column: sticky booking card (desktop) ── */}
        <aside className="sticky top-24 hidden rounded-3xl border border-[#ddd] bg-white p-6 shadow-xl lg:block dark:border-[#333] dark:bg-[#1a1a1a]">
          <p className="text-[22px] font-bold text-[#222] dark:text-white">
            Your stay
          </p>

          <div className="mt-5 space-y-3 text-[14px] text-[#222] dark:text-[#e8e8e8]">
            {form.checkInDate && form.checkOutDate && nightCount > 0 ? (
              <>
                <div className="flex justify-between">
                  <span className="text-[#717171]">Check-in</span>
                  <span className="font-medium text-[13px]">{form.checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717171]">Check-out</span>
                  <span className="font-medium text-[13px]">{form.checkOutDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717171]">Nights</span>
                  <span className="font-semibold tabular-nums">{nightCount}</span>
                </div>
              </>
            ) : null}
            
            <hr className="border-[#ebebeb] dark:border-[#333]" />
            
            <div className="flex justify-between">
              <span className="text-[#717171]">Adults</span>
              <span className="font-semibold tabular-nums">{form.guests}</span>
            </div>
            {Number(form.children) > 0 ? (
              <div className="flex justify-between">
                <span className="text-[#717171]">Children</span>
                <span className="font-semibold tabular-nums">{form.children}</span>
              </div>
            ) : null}
            
            <hr className="border-[#ebebeb] dark:border-[#333]" />
            
            <div className="flex justify-between">
              <span className="text-[#717171]">Rooms</span>
              <span className="font-semibold tabular-nums">{sumRooms(form)}</span>
            </div>
            {sumRooms(form) > 0 && (
              <>
                {(() => {
                  const roomLineItems = getRoomLineItems(form);
                  return roomLineItems.map((room, idx) => (
                    <div key={idx} className="pl-3 flex justify-between text-[13px]">
                      <span className="text-[#717171]">
                        {formatRoomCategory(room.roomCategory)} × {room.roomCount}
                      </span>
                    </div>
                  ));
                })()}
              </>
            )}
            
            {nightCount > 0 && form.guestMeals.some(g => g.breakfast || g.lunch || g.dinner) && (
              <>
                <hr className="border-[#ebebeb] dark:border-[#333]" />
                <div className="flex justify-between">
                  <span className="text-[#717171]">Meals</span>
                </div>
                {(() => {
                  const guestMealSelections = form.guestMeals.map((meal, idx) => ({
                    guestIndex: idx,
                    breakfast: meal.breakfast,
                    lunch: meal.lunch,
                    dinner: meal.dinner,
                  }));
                  const breakdown = calculateMealsFromGuestSelections(guestMealSelections, nightCount);
                  
                  return (
                    <>
                      {breakdown.breakfast.guestCount > 0 && (
                        <div className="pl-3 flex justify-between text-[13px]">
                          <span className="text-[#717171]">
                            Breakfast ({breakdown.breakfast.guestCount}g × {nightCount}n)
                          </span>
                          <span className="font-medium tabular-nums">{formatTTD(breakdown.breakfast.subtotal)}</span>
                        </div>
                      )}
                      {breakdown.lunch.guestCount > 0 && (
                        <div className="pl-3 flex justify-between text-[13px]">
                          <span className="text-[#717171]">
                            Lunch ({breakdown.lunch.guestCount}g × {nightCount}n)
                          </span>
                          <span className="font-medium tabular-nums">{formatTTD(breakdown.lunch.subtotal)}</span>
                        </div>
                      )}
                      {breakdown.dinner.guestCount > 0 && (
                        <div className="pl-3 flex justify-between text-[13px]">
                          <span className="text-[#717171]">
                            Dinner ({breakdown.dinner.guestCount}g × {nightCount}n)
                          </span>
                          <span className="font-medium tabular-nums">{formatTTD(breakdown.dinner.subtotal)}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>

          <hr className="my-5 border-[#ebebeb] dark:border-[#333]" />

          <p className="text-center text-[13px] leading-relaxed text-[#717171]">
            Pricing shown after dates are selected. Availability confirmed after submission.
          </p>

          <button type="submit" disabled={submitting} className="site-btn-hotel-submit mt-5 py-3.5 text-[16px] disabled:opacity-60">
            {submitting ? "Sending…" : "Reserve"}
          </button>

          {submitError ? (
            <div className="mt-4 rounded-xl border border-[#ddd] bg-[#fff5f5] p-3 text-[13px] text-[#c13515] dark:border-[#333] dark:bg-[#2a1515]" role="alert">
              {submitError}
              {mailtoFallbackHref ? (
                <a href={mailtoFallbackHref} className="mt-2 block font-semibold underline">Open email app</a>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>

      {/* Mobile submit error */}
      {submitError ? (
        <div className="mt-4 rounded-xl border border-[#ddd] bg-[#fff5f5] p-4 text-[13px] text-[#c13515] lg:hidden dark:border-[#333] dark:bg-[#2a1515]" role="alert">
          {submitError}
          {mailtoFallbackHref ? (
            <a href={mailtoFallbackHref} className="mt-2 block font-semibold underline">Open email app</a>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

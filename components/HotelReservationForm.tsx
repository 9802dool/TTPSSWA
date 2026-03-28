"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import HotelAvailabilityCalendar from "@/components/HotelAvailabilityCalendar";
import {
  eachNight,
  HOTEL_NIGHT_CAPACITY,
  type NightAvailability,
} from "@/lib/hotel-availability";

/* ── Airbnb-style field class ── */
const fieldClass =
  "w-full rounded-xl border border-[#b0b0b0] bg-white px-4 py-3 text-[15px] text-[#222] outline-none transition placeholder:text-[#717171] focus:border-[#222] focus:ring-1 focus:ring-[#222] dark:border-[#3a3a3a] dark:bg-[#1a1a1a] dark:text-[#e8e8e8] dark:placeholder:text-[#717171] dark:focus:border-white dark:focus:ring-white";

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
  if (u) parts.push(`${u} full bed room${u === 1 ? "" : "s"}`);
  if (d) parts.push(`${d} double bed room${d === 1 ? "" : "s"}`);
  return parts.length ? parts.join(", ") : "—";
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
    [`Rooms (${total}): ${roomMixLine(f)}`, `Guests: ${f.guests}`, f.notes.trim() ? `Notes: ${f.notes.trim()}` : ""].filter(Boolean).join("\\n"),
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
    details: [`Rooms (${sumRooms(f)}): ${roomMixLine(f)}`, `Guests: ${f.guests}`, f.notes.trim() ? `Notes: ${f.notes.trim()}` : ""].filter(Boolean).join("\n"),
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

  const update = useCallback((key: keyof FormState, value: string) => {
    setForm((prev) => {
      let next = { ...prev, [key]: value };
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
      return next;
    });
    setErrors((e) => {
      const n = { ...e };
      delete n[key]; delete n.roomMix; delete n.availability;
      return n;
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
    }
    if (!e.roomMix && total >= 1 && form.checkInDate && form.checkOutDate && !e.checkOutDate) {
      for (const night of eachNight(form.checkInDate, form.checkOutDate)) {
        const avail = byNight[night]?.available ?? HOTEL_NIGHT_CAPACITY;
        if (avail < total) { e.availability = `Only ${avail} room${avail === 1 ? "" : "s"} free on ${night}. Reduce rooms or pick different dates.`; break; }
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, byNight]);

  const summaryLines = useMemo(() => {
    if (!submitted) return [];
    const total = sumRooms(form);
    return [
      `Guest: ${form.fullName}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Check-in: ${form.checkInDate} at ${form.checkInTime}`,
      `Check-out: ${form.checkOutDate} at ${form.checkOutTime}`,
      `Rooms (${total}): ${roomMixLine(form)}`,
      `Guests: ${form.guests}`,
      form.notes.trim() ? `Notes: ${form.notes.trim()}` : "",
    ].filter(Boolean);
  }, [submitted, form]);

  const canAddToCalendar = form.checkInDate && form.checkOutDate && new Date(form.checkOutDate) >= new Date(form.checkInDate);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitError(null); setMailtoFallbackHref(null); setSubmitting(true);
    try {
      const total = sumRooms(form);
      const res = await fetch("/api/hotel-booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, rooms: String(total) }) });
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
          A coordinator will confirm availability and rates shortly. Submitting
          does not charge a card or guarantee a room until we confirm with you.
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
              Select check-in and check-out dates. Click a date on the calendar to check room availability.
            </p>
            {availError ? (
              <p className="mt-2 text-[13px] text-amber-700 dark:text-amber-300">{availError}</p>
            ) : null}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-[#b0b0b0] dark:border-[#555]">
                <div className="border-b border-[#ebebeb] px-4 pb-2 pt-3 dark:border-[#333]">
                  <label htmlFor="hr-checkin-date" className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">
                    Check-in
                  </label>
                  <input id="hr-checkin-date" name="checkInDate" type="date" value={form.checkInDate} onChange={(e) => update("checkInDate", e.target.value)} className="w-full border-0 bg-transparent p-0 pt-1 text-[15px] font-semibold text-[#222] outline-none dark:text-white" aria-invalid={!!errors.checkInDate} />
                </div>
                <div className="px-4 pb-3 pt-2">
                  <label htmlFor="hr-checkin-time" className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">
                    Time
                  </label>
                  <input id="hr-checkin-time" name="checkInTime" type="time" value={form.checkInTime} onChange={(e) => update("checkInTime", e.target.value)} className="w-full border-0 bg-transparent p-0 pt-1 text-[15px] font-semibold text-[#222] outline-none dark:text-white" aria-invalid={!!errors.checkInTime} />
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-[#b0b0b0] dark:border-[#555]">
                <div className="border-b border-[#ebebeb] px-4 pb-2 pt-3 dark:border-[#333]">
                  <label htmlFor="hr-checkout-date" className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">
                    Check-out
                  </label>
                  <input id="hr-checkout-date" name="checkOutDate" type="date" value={form.checkOutDate} min={form.checkInDate || undefined} onChange={(e) => update("checkOutDate", e.target.value)} className="w-full border-0 bg-transparent p-0 pt-1 text-[15px] font-semibold text-[#222] outline-none dark:text-white" aria-invalid={!!errors.checkOutDate} />
                </div>
                <div className="px-4 pb-3 pt-2">
                  <label htmlFor="hr-checkout-time" className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">
                    Time
                  </label>
                  <input id="hr-checkout-time" name="checkOutTime" type="time" value={form.checkOutTime} onChange={(e) => update("checkOutTime", e.target.value)} className="w-full border-0 bg-transparent p-0 pt-1 text-[15px] font-semibold text-[#222] outline-none dark:text-white" aria-invalid={!!errors.checkOutTime} />
                </div>
              </div>
            </div>
            <Err msg={errors.checkInDate} />
            <Err msg={errors.checkOutDate} />
            <Err msg={errors.checkInTime} />
            <Err msg={errors.checkOutTime} />
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
            <div className="mt-4 max-w-xs">
              <select id="hr-guests" name="guests" value={form.guests} onChange={(e) => update("guests", e.target.value)} className={fieldClass}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>{n} guest{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
          </section>

          <hr className="border-[#ebebeb] dark:border-[#333]" />

          {/* Guest info */}
          <section>
            <h2 className="text-[22px] font-bold text-[#222] dark:text-white">
              Your details
            </h2>
            <p className="mt-1 text-[14px] text-[#717171]">
              We&apos;ll use this to send you a quotation and confirmation.
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

          {/* Submit — mobile only (desktop uses sticky card) */}
          <div className="lg:hidden">
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-[#e41d56] to-[#d70466] px-6 py-4 text-[16px] font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60">
              {submitting ? "Sending…" : "Reserve"}
            </button>
            <p className="mt-3 text-center text-[12px] text-[#717171]">You won&apos;t be charged — we confirm availability first.</p>
          </div>
        </div>

        {/* ── Right column: sticky booking card (desktop) ── */}
        <aside className="sticky top-24 hidden rounded-3xl border border-[#ddd] bg-white p-6 shadow-xl lg:block dark:border-[#333] dark:bg-[#1a1a1a]">
          <p className="text-[22px] font-bold text-[#222] dark:text-white">
            Your stay
          </p>

          <div className="mt-5 space-y-3 text-[14px] text-[#222] dark:text-[#e8e8e8]">
            <div className="flex justify-between">
              <span className="text-[#717171]">Rooms</span>
              <span className="font-semibold tabular-nums">{sumRooms(form)} / {HOTEL_NIGHT_CAPACITY}</span>
            </div>
            {sumRooms(form) > 0 ? (
              <p className="text-[13px] text-[#717171]">{roomMixLine(form)}</p>
            ) : null}
            <div className="flex justify-between">
              <span className="text-[#717171]">Guests</span>
              <span className="font-semibold tabular-nums">{form.guests}</span>
            </div>
            {nightCount > 0 ? (
              <div className="flex justify-between">
                <span className="text-[#717171]">Nights</span>
                <span className="font-semibold tabular-nums">{nightCount}</span>
              </div>
            ) : null}
            {form.checkInDate ? (
              <div className="flex justify-between">
                <span className="text-[#717171]">Check-in</span>
                <span className="font-medium">{form.checkInDate}</span>
              </div>
            ) : null}
            {form.checkOutDate ? (
              <div className="flex justify-between">
                <span className="text-[#717171]">Check-out</span>
                <span className="font-medium">{form.checkOutDate}</span>
              </div>
            ) : null}
          </div>

          <hr className="my-5 border-[#ebebeb] dark:border-[#333]" />

          <p className="text-center text-[13px] leading-relaxed text-[#717171]">
            Rates confirmed after submission.<br />No card required to request.
          </p>

          <button type="submit" disabled={submitting} className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#e41d56] to-[#d70466] px-6 py-3.5 text-[16px] font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60">
            {submitting ? "Sending…" : "Reserve"}
          </button>
          <p className="mt-3 text-center text-[12px] text-[#717171]">
            You won&apos;t be charged yet.
          </p>

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

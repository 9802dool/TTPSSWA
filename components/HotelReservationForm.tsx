"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import HotelAvailabilityCalendar from "@/components/HotelAvailabilityCalendar";
import {
  eachNight,
  HOTEL_NIGHT_CAPACITY,
  type NightAvailability,
} from "@/lib/hotel-availability";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink shadow-corp outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/25 dark:bg-surface";

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
  const p = Math.min(2, Math.max(0, parseInt(f.presidentialSuite, 10) || 0));
  const u = Math.min(2, Math.max(0, parseInt(f.fullBedRoom, 10) || 0));
  const d = Math.min(4, Math.max(0, parseInt(f.doubleBedRoom, 10) || 0));
  return p + u + d;
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
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
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
    [
      `Rooms (${total}): ${roomMixLine(f)}`,
      `Guests: ${f.guests}`,
      f.notes.trim() ? `Notes: ${f.notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\\n"),
  );
  const summary = icsEscape("TTPSSWA hotel stay");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TTPSSWA//Hotel Stay//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${dStart}`,
    `DTEND;VALUE=DATE:${dEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function googleCalendarStayUrl(f: FormState): string {
  const start = f.checkInDate.replace(/-/g, "");
  const end = f.checkOutDate.replace(/-/g, "");
  const text = "TTPSSWA hotel stay";
  const details = [
    `Rooms (${sumRooms(f)}): ${roomMixLine(f)}`,
    `Guests: ${f.guests}`,
    f.notes.trim() ? `Notes: ${f.notes.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text,
    dates: `${start}/${end}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function HotelReservationForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mailtoFallbackHref, setMailtoFallbackHref] = useState<string | null>(
    null,
  );
  const [byNight, setByNight] = useState<Record<string, NightAvailability>>({});
  const [availLoading, setAvailLoading] = useState(true);
  const [availError, setAvailError] = useState<string | null>(null);

  const update = useCallback(
    (key: keyof FormState, value: string) => {
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
            next = {
              ...next,
              presidentialSuite: String(p),
              fullBedRoom: String(u),
              doubleBedRoom: String(d),
            };
          }
        }
        return next;
      });
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        delete next.roomMix;
        delete next.availability;
        return next;
      });
    },
    [],
  );

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
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          byNight?: Record<string, NightAvailability>;
        };
        if (!res.ok) {
          throw new Error(data.error || "Could not load availability.");
        }
        if (!cancelled && data.byNight) setByNight(data.byNight);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setAvailError(
            err instanceof Error ? err.message : "Could not load availability.",
          );
          setByNight({});
        }
      })
      .finally(() => {
        if (!cancelled) setAvailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Enter your full name.";
    if (!form.email.trim()) e.email = "Enter an email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address.";
    if (!form.phone.trim()) e.phone = "Enter a phone number.";
    if (!form.checkInDate) e.checkInDate = "Choose a check-in date.";
    if (!form.checkOutDate) e.checkOutDate = "Choose a check-out date.";
    if (!form.checkInTime) e.checkInTime = "Choose a check-in time.";
    if (!form.checkOutTime) e.checkOutTime = "Choose a check-out time.";

    const total = sumRooms(form);
    if (total < 1) e.roomMix = "Select at least one room.";
    else if (total > HOTEL_NIGHT_CAPACITY)
      e.roomMix = `You can book at most ${HOTEL_NIGHT_CAPACITY} rooms.`;

    if (form.checkInDate && form.checkOutDate) {
      const inD = new Date(form.checkInDate);
      const outD = new Date(form.checkOutDate);
      if (outD < inD) {
        e.checkOutDate = "Check-out must be on or after check-in.";
      } else if (
        form.checkInDate === form.checkOutDate &&
        form.checkInTime &&
        form.checkOutTime
      ) {
        const [ih, im] = form.checkInTime.split(":").map(Number);
        const [oh, om] = form.checkOutTime.split(":").map(Number);
        if (ih * 60 + im >= oh * 60 + om) {
          e.checkOutTime =
            "On the same day, check-out time must be after check-in time.";
        }
      }
    }

    if (
      !e.roomMix &&
      total >= 1 &&
      form.checkInDate &&
      form.checkOutDate &&
      !e.checkOutDate
    ) {
      const nights = eachNight(form.checkInDate, form.checkOutDate);
      for (const night of nights) {
        const avail = byNight[night]?.available ?? HOTEL_NIGHT_CAPACITY;
        if (avail < total) {
          e.availability = `Not enough rooms on ${night}: need ${total}, only ${avail} available for that night. Pick fewer rooms or different dates.`;
          break;
        }
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

  const canAddToCalendar =
    form.checkInDate &&
    form.checkOutDate &&
    new Date(form.checkOutDate) >= new Date(form.checkInDate);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    setMailtoFallbackHref(null);
    setSubmitting(true);
    try {
      const total = sumRooms(form);
      const res = await fetch("/api/hotel-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rooms: String(total),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        mailtoHref?: string;
      };
      if (!res.ok) {
        setSubmitError(
          data.error ||
            "Something went wrong. Please try again in a few minutes.",
        );
        setMailtoFallbackHref(
          typeof data.mailtoHref === "string" ? data.mailtoHref : null,
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(initial);
    setErrors({});
    setSubmitted(false);
    setSubmitError(null);
    setMailtoFallbackHref(null);
  };

  const downloadIcs = () => {
    const blob = new Blob([buildStayIcs(form)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ttpsswa-hotel-stay-${form.checkInDate}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-line bg-surface p-8 shadow-corp dark:bg-surface">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Request received
        </p>
        <h3 className="mt-2 text-xl font-bold text-ink">Thank you</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Your request has been emailed to our team. A coordinator will confirm
          availability and rates. Submitting this form does not charge a card or
          guarantee a room until we confirm with you.
        </p>
        <ul className="mt-6 space-y-2 rounded-lg border border-line bg-canvas p-4 text-sm text-ink dark:bg-canvas">
          {summaryLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {canAddToCalendar ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadIcs}
              className="rounded-md border border-line bg-canvas px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:bg-surface dark:bg-canvas"
            >
              Download .ics (Apple / Outlook)
            </button>
            <a
              href={googleCalendarStayUrl(form)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-corp transition hover:opacity-90"
            >
              Add to Google Calendar
            </a>
          </div>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-corp transition hover:bg-brand-hover"
        >
          New booking
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-line bg-surface p-6 shadow-corp sm:p-8 dark:bg-surface"
      noValidate
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="hr-name" className="text-sm font-semibold text-ink">
            Full name <span className="text-red-600">*</span>
          </label>
          <input
            id="hr-name"
            name="fullName"
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className={inputClass}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "err-name" : undefined}
          />
          {errors.fullName ? (
            <p id="err-name" className="mt-1 text-xs text-red-600">
              {errors.fullName}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="hr-email" className="text-sm font-semibold text-ink">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="hr-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
            aria-invalid={!!errors.email}
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="hr-phone" className="text-sm font-semibold text-ink">
            Phone <span className="text-red-600">*</span>
          </label>
          <input
            id="hr-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
            placeholder="Include area code"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "err-phone" : undefined}
          />
          {errors.phone ? (
            <p id="err-phone" className="mt-1 text-xs text-red-600">
              {errors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 border-t border-line pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Stay dates & times
        </p>
        {availError ? (
          <p className="mt-2 text-xs text-amber-800 dark:text-amber-200" role="status">
            {availError} The calendar below assumes full availability.
          </p>
        ) : null}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_minmax(0,280px)] lg:items-start">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="hr-checkin-date"
                className="text-sm font-semibold text-ink"
              >
                Check-in date <span className="text-red-600">*</span>
              </label>
              <input
                id="hr-checkin-date"
                name="checkInDate"
                type="date"
                value={form.checkInDate}
                onChange={(e) => update("checkInDate", e.target.value)}
                className={inputClass}
                aria-invalid={!!errors.checkInDate}
              />
              {errors.checkInDate ? (
                <p className="mt-1 text-xs text-red-600">{errors.checkInDate}</p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="hr-checkout-date"
                className="text-sm font-semibold text-ink"
              >
                Check-out date <span className="text-red-600">*</span>
              </label>
              <input
                id="hr-checkout-date"
                name="checkOutDate"
                type="date"
                value={form.checkOutDate}
                min={form.checkInDate || undefined}
                onChange={(e) => update("checkOutDate", e.target.value)}
                className={inputClass}
                aria-invalid={!!errors.checkOutDate}
              />
              {errors.checkOutDate ? (
                <p className="mt-1 text-xs text-red-600">{errors.checkOutDate}</p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="hr-checkin-time"
                className="text-sm font-semibold text-ink"
              >
                Check-in time <span className="text-red-600">*</span>
              </label>
              <input
                id="hr-checkin-time"
                name="checkInTime"
                type="time"
                value={form.checkInTime}
                onChange={(e) => update("checkInTime", e.target.value)}
                className={inputClass}
                aria-invalid={!!errors.checkInTime}
              />
              {errors.checkInTime ? (
                <p className="mt-1 text-xs text-red-600">{errors.checkInTime}</p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="hr-checkout-time"
                className="text-sm font-semibold text-ink"
              >
                Check-out time <span className="text-red-600">*</span>
              </label>
              <input
                id="hr-checkout-time"
                name="checkOutTime"
                type="time"
                value={form.checkOutTime}
                onChange={(e) => update("checkOutTime", e.target.value)}
                className={inputClass}
                aria-invalid={!!errors.checkOutTime}
              />
              {errors.checkOutTime ? (
                <p className="mt-1 text-xs text-red-600">{errors.checkOutTime}</p>
              ) : null}
            </div>
          </div>
          <HotelAvailabilityCalendar
            byNight={byNight}
            checkInDate={form.checkInDate}
            checkOutDate={form.checkOutDate}
            loading={availLoading}
          />
        </div>
      </div>

      <div className="mt-8 border-t border-line pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Rooms & guests
        </p>
        <div className="mt-4 rounded-lg border border-line bg-surface/80 px-4 py-3 text-sm leading-relaxed text-muted dark:bg-canvas/50">
          <p className="font-medium text-ink">Room inventory ({HOTEL_NIGHT_CAPACITY} rooms total)</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>2 presidential suites (max 2 per booking)</li>
            <li>2 full bed rooms (max 2 per booking)</li>
            <li>4 double bed rooms (max 4 per booking)</li>
          </ul>
        </div>
        <p className="mt-3 text-sm text-ink">
          Selected:{" "}
          <span className="font-semibold tabular-nums">
            {sumRooms(form)} / {HOTEL_NIGHT_CAPACITY}
          </span>{" "}
          rooms · {roomMixLine(form)}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="hr-pres"
              className="text-sm font-semibold text-ink"
            >
              Presidential suites
            </label>
            <select
              id="hr-pres"
              name="presidentialSuite"
              value={form.presidentialSuite}
              onChange={(e) => update("presidentialSuite", e.target.value)}
              className={inputClass}
            >
              {[0, 1, 2].map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="hr-full"
              className="text-sm font-semibold text-ink"
            >
              Full bed rooms
            </label>
            <select
              id="hr-full"
              name="fullBedRoom"
              value={form.fullBedRoom}
              onChange={(e) => update("fullBedRoom", e.target.value)}
              className={inputClass}
            >
              {[0, 1, 2].map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="hr-dbl"
              className="text-sm font-semibold text-ink"
            >
              Double bed rooms
            </label>
            <select
              id="hr-dbl"
              name="doubleBedRoom"
              value={form.doubleBedRoom}
              onChange={(e) => update("doubleBedRoom", e.target.value)}
              className={inputClass}
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        {errors.roomMix ? (
          <p className="mt-2 text-xs text-red-600">{errors.roomMix}</p>
        ) : null}
        {errors.availability ? (
          <p className="mt-2 text-xs text-red-600">{errors.availability}</p>
        ) : null}
        <div className="mt-6">
          <label htmlFor="hr-guests" className="text-sm font-semibold text-ink">
            Guests
          </label>
          <select
            id="hr-guests"
            name="guests"
            value={form.guests}
            onChange={(e) => update("guests", e.target.value)}
            className={inputClass}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="hr-notes" className="text-sm font-semibold text-ink">
          Special requests
        </label>
        <textarea
          id="hr-notes"
          name="notes"
          rows={4}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          className={`${inputClass} resize-y`}
          placeholder="Accessibility, dietary, late arrival, etc."
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white shadow-corp transition hover:bg-brand-hover disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Submit booking request"}
        </button>
        <p className="text-xs text-muted">
          By submitting, you agree we may contact you about this request.
        </p>
      </div>
      {submitError ? (
        <div className="mt-4 rounded-lg border border-line bg-canvas p-4 dark:bg-canvas" role="alert">
          <p className="text-sm text-ink">{submitError}</p>
          {mailtoFallbackHref ? (
            <a
              href={mailtoFallbackHref}
              className="mt-3 inline-flex rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-corp transition hover:opacity-90"
            >
              Open email app with this booking
            </a>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

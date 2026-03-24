"use client";

import { useCallback, useMemo, useState } from "react";

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
  rooms: string;
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
  rooms: "1",
  guests: "1",
  notes: "",
};

export default function HotelReservationForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback(
    (key: keyof FormState, value: string) => {
      setForm((f) => ({ ...f, [key]: value }));
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Enter your full name.";
    if (!form.email.trim()) e.email = "Enter an email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address.";
    if (!form.checkInDate) e.checkInDate = "Choose a check-in date.";
    if (!form.checkOutDate) e.checkOutDate = "Choose a check-out date.";
    if (!form.checkInTime) e.checkInTime = "Choose a check-in time.";
    if (!form.checkOutTime) e.checkOutTime = "Choose a check-out time.";

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

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const summaryLines = useMemo(() => {
    if (!submitted) return [];
    return [
      `Guest: ${form.fullName}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || "—"}`,
      `Check-in: ${form.checkInDate} at ${form.checkInTime}`,
      `Check-out: ${form.checkOutDate} at ${form.checkOutTime}`,
      `Rooms: ${form.rooms}`,
      `Guests: ${form.guests}`,
      form.notes.trim() ? `Notes: ${form.notes.trim()}` : "",
    ].filter(Boolean);
  }, [submitted, form]);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  const reset = () => {
    setForm(initial);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-line bg-surface p-8 shadow-corp dark:bg-surface">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Request received
        </p>
        <h3 className="mt-2 text-xl font-bold text-ink">Thank you</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Your hotel reservation request has been recorded. A coordinator will
          confirm availability and rates by email. This demo does not charge a
          card or guarantee a room until you connect a backend or email
          workflow.
        </p>
        <ul className="mt-6 space-y-2 rounded-lg border border-line bg-canvas p-4 text-sm text-ink dark:bg-canvas">
          {summaryLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
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
            Phone
          </label>
          <input
            id="hr-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="mt-8 border-t border-line pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Stay dates & times
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
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
      </div>

      <div className="mt-8 border-t border-line pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Rooms & guests
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="hr-rooms" className="text-sm font-semibold text-ink">
              Rooms
            </label>
            <select
              id="hr-rooms"
              name="rooms"
              value={form.rooms}
              onChange={(e) => update("rooms", e.target.value)}
              className={inputClass}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={String(n)}>
                  {n} {n === 1 ? "room" : "rooms"}
                </option>
              ))}
            </select>
          </div>
          <div>
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
    </form>
  );
}

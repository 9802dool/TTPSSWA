"use client";

import { useMemo, useState } from "react";

const ROOM_OPTIONS = [
  {
    id: "PRESIDENTIAL_SUITE",
    title: "Presidential Suite",
    desc: "Luxury suite with king bed, executive lounge access, and sea view.",
    maxCount: 2,
    price: "$1,200 / night",
  },
  {
    id: "SINGLE_OCCUPANCY",
    title: "Single Occupancy",
    desc: "Ideal for solo travellers or officers on short administrative stays.",
    maxCount: 2,
    price: "$450 / night",
  },
  {
    id: "DOUBLE_OCCUPANCY",
    title: "Double Occupancy",
    desc: "Spacious room with two queen beds, suitable for families or colleagues.",
    maxCount: 4,
    price: "$650 / night",
  },
] as const;

type RoomCategory = (typeof ROOM_OPTIONS)[number]["id"];

type FormState = {
  guestName: string;
  serviceNumber: string;
  email: string;
  phone: string;
  roomCategory: RoomCategory;
  checkIn: string;
  checkOut: string;
};

const INITIAL_FORM: FormState = {
  guestName: "",
  serviceNumber: "",
  email: "",
  phone: "",
  roomCategory: "DOUBLE_OCCUPANCY",
  checkIn: "",
  checkOut: "",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

function nextDay(date: string): string {
  if (!date) return "";
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + 1);
  return value.toISOString().slice(0, 10);
}

export default function SimpleBookingForm() {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormData((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/hotel/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete booking.");
      }

      setMessage({
        type: "success",
        text: "Booking confirmed! Your reservation has been recorded.",
      });
      setFormData(INITIAL_FORM);
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to complete booking.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto my-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-md sm:p-7">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">
          TTPSSWA Guest House Booking
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Select one room, choose your dates, and confirm your accommodation.
        </p>
      </div>

      {message ? (
        <div
          role={message.type === "error" ? "alert" : "status"}
          className={`mb-6 rounded-md border p-4 text-sm font-medium ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-8">
        <fieldset>
          <legend className="mb-3 block text-sm font-semibold text-slate-700">
            1. Select dates
          </legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="hotel-check-in" className="text-xs text-slate-500">
                Check-in date
              </label>
              <input
                id="hotel-check-in"
                type="date"
                required
                min={today}
                className={inputClass}
                value={formData.checkIn}
                onChange={(event) => {
                  const checkIn = event.target.value;
                  setFormData((current) => ({
                    ...current,
                    checkIn,
                    checkOut:
                      current.checkOut && current.checkOut <= checkIn
                        ? ""
                        : current.checkOut,
                  }));
                  setMessage(null);
                }}
              />
            </div>
            <div>
              <label htmlFor="hotel-check-out" className="text-xs text-slate-500">
                Check-out date
              </label>
              <input
                id="hotel-check-out"
                type="date"
                required
                min={nextDay(formData.checkIn) || today}
                className={inputClass}
                value={formData.checkOut}
                onChange={(event) => update("checkOut", event.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 block text-sm font-semibold text-slate-700">
            2. Choose a room category
          </legend>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {ROOM_OPTIONS.map((room) => {
              const selected = formData.roomCategory === room.id;
              return (
                <label
                  key={room.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    selected
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="roomCategory"
                    value={room.id}
                    checked={selected}
                    onChange={() => update("roomCategory", room.id)}
                    className="sr-only"
                  />
                  <span className="inline-flex rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                    {room.maxCount} rooms total
                  </span>
                  <span className="mt-3 block text-sm font-bold text-slate-900">
                    {room.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                    {room.desc}
                  </span>
                  <span className="mt-3 block text-xs font-semibold text-slate-700">
                    {room.price}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 block text-sm font-semibold text-slate-700">
            3. Guest details
          </legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="hotel-guest-name" className="text-xs text-slate-500">
                Full name
              </label>
              <input
                id="hotel-guest-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Officer name"
                className={inputClass}
                value={formData.guestName}
                onChange={(event) => update("guestName", event.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="hotel-service-number"
                className="text-xs text-slate-500"
              >
                Service / regiment no.
              </label>
              <input
                id="hotel-service-number"
                type="text"
                required
                autoComplete="off"
                placeholder="e.g. 12345"
                className={inputClass}
                value={formData.serviceNumber}
                onChange={(event) => update("serviceNumber", event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="hotel-email" className="text-xs text-slate-500">
                Email address
              </label>
              <input
                id="hotel-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                className={inputClass}
                value={formData.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="hotel-phone" className="text-xs text-slate-500">
                Phone number
              </label>
              <input
                id="hotel-phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="1-868-xxx-xxxx"
                className={inputClass}
                value={formData.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Checking availability..." : "Confirm reservation"}
        </button>
      </form>
    </div>
  );
}

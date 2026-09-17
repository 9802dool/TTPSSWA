"use client";

import { useMemo, useState } from "react";

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner"] as const;
type MealOption = (typeof MEAL_OPTIONS)[number];

const ROOM_OPTIONS = [
  {
    id: "PRESIDENTIAL_SUITE",
    title: "Presidential Suite",
    desc: "Spacious suite featuring a king bed and luxury bathroom.",
    maxCount: 2,
    amenities: ["King Bed", "Free Wi-Fi", "Air Conditioning", "Luxury Bathroom"],
  },
  {
    id: "SINGLE_OCCUPANCY",
    title: "Single Occupancy",
    desc: "Ideal for solo travellers or officers on short administrative stays.",
    maxCount: 2,
    amenities: ["Full Bed", "Free Wi-Fi", "Air Conditioning", "Work Desk"],
  },
  {
    id: "DOUBLE_OCCUPANCY",
    title: "Double Occupancy",
    desc: "Spacious room with two queen beds, suitable for families or colleagues.",
    maxCount: 4,
    amenities: ["Two Queen Beds", "Free Wi-Fi", "Air Conditioning", "Family Space"],
  },
] as const;

type RoomCategory = (typeof ROOM_OPTIONS)[number]["id"];

type FormState = {
  guestName: string;
  email: string;
  phone: string;
  roomCategory: RoomCategory;
  roomCount: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  meals: Record<MealOption, string>;
  specialRequests: string;
};

const INITIAL_FORM: FormState = {
  guestName: "",
  email: "",
  phone: "",
  roomCategory: "DOUBLE_OCCUPANCY",
  roomCount: "1",
  checkIn: "",
  checkOut: "",
  guests: "1",
  meals: {
    Breakfast: "0",
    Lunch: "0",
    Dinner: "0",
  },
  specialRequests: "",
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

  function updateMealQuantity(meal: MealOption, quantity: string) {
    setFormData((current) => ({
      ...current,
      meals: {
        ...current.meals,
        [meal]: quantity,
      },
    }));
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
        guestEmailSent?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete booking.");
      }

      setMessage({
        type: "success",
        text: data.guestEmailSent
          ? "Booking submitted! A thank-you email has been sent to your email address."
          : "Booking submitted! Your reservation has been recorded.",
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
          Hotel Booking Request
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Select a room category and quantity, choose your dates, and confirm
          your accommodation.
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
                <article
                  key={room.id}
                  className={`rounded-xl border bg-white p-4 transition-all ${
                    selected
                      ? "border-blue-600 ring-2 ring-blue-500"
                      : "border-slate-200 hover:border-slate-400 hover:shadow-md"
                  }`}
                >
                  <div>
                    <span className="inline-flex rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                      {room.maxCount} rooms total
                    </span>
                    <h3 className="mt-3 text-sm font-bold text-slate-900">
                      {room.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {room.desc}
                    </p>
                    <ul className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600">
                      {room.amenities.map((amenity) => (
                        <li key={amenity} className="flex items-center gap-1">
                          <span className="text-blue-600" aria-hidden>
                            ✓
                          </span>
                          {amenity}
                        </li>
                      ))}
                    </ul>
                    <label
                      htmlFor={`hotel-room-count-${room.id}`}
                      className="mt-4 block text-xs font-semibold text-slate-700"
                    >
                      Number of rooms
                    </label>
                    <select
                      id={`hotel-room-count-${room.id}`}
                      value={selected ? formData.roomCount : "1"}
                      disabled={!selected}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          roomCategory: room.id,
                          roomCount: event.target.value,
                        }))
                      }
                      className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                    >
                      {Array.from({ length: room.maxCount }, (_, index) => (
                        <option key={index + 1} value={String(index + 1)}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,
                          roomCategory: room.id,
                          roomCount:
                            current.roomCategory === room.id
                              ? current.roomCount
                              : "1",
                        }))
                      }
                      className={`mt-4 w-full rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "border border-blue-600 text-blue-700 hover:bg-blue-50"
                      }`}
                    >
                      {selected ? "Room selected" : "Select room"}
                    </button>
                  </div>
                </article>
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
                placeholder="Name"
                className={inputClass}
                value={formData.guestName}
                onChange={(event) => update("guestName", event.target.value)}
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
            <div>
              <label htmlFor="hotel-guests" className="text-xs text-slate-500">
                Number of guests
              </label>
              <input
                id="hotel-guests"
                type="number"
                required
                min={1}
                max={10}
                inputMode="numeric"
                className={inputClass}
                value={formData.guests}
                onChange={(event) => update("guests", event.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="block text-sm font-semibold text-slate-700">
            Meal options
          </legend>
          <p className="mt-1 text-xs text-slate-500">
            Choose how many of each meal you would like.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {MEAL_OPTIONS.map((meal) => (
              <div
                key={meal}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <label
                  htmlFor={`hotel-meal-${meal.toLowerCase()}`}
                  className="block text-sm font-medium text-slate-700"
                >
                  {meal}
                </label>
                <select
                  id={`hotel-meal-${meal.toLowerCase()}`}
                  value={formData.meals[meal]}
                  onChange={(event) =>
                    updateMealQuantity(meal, event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="0">None</option>
                  {Array.from({ length: 10 }, (_, index) => (
                    <option key={index + 1} value={String(index + 1)}>
                      {index + 1}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="hotel-special-requests"
            className="block text-sm font-semibold text-slate-700"
          >
            Special requests
          </label>
          <textarea
            id="hotel-special-requests"
            rows={4}
            maxLength={2000}
            className={`${inputClass} resize-y`}
            placeholder="Dietary restrictions, room preferences, estimated arrival time, etc."
            value={formData.specialRequests}
            onChange={(event) => update("specialRequests", event.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Checking availability..." : "Submit booking request"}
        </button>
      </form>
    </div>
  );
}

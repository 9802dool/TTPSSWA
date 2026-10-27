"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TurnstileWidget, resetTurnstileWidgets } from "@/components/TurnstileWidget";
import {
  HOTEL_RATES,
  MEAL_PRICES,
  ROOM_CAPACITIES,
  CHECK_IN_TIME,
  CHECK_OUT_TIME,
  HOTEL_CONTACT,
  calculateMultiRoomBookingTotal,
  calculateNights,
  getTrinidadLocalDate,
  formatTTD,
  type GuestMealSelection,
  type RoomCategory,
} from "@/lib/hotel-pricing";

const MAX_GUESTS = 24;

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner"] as const;
type MealOption = (typeof MEAL_OPTIONS)[number];

const ROOM_OPTIONS = [
  {
    id: "PRESIDENTIAL_SUITE" as const,
    title: "Presidential Suite",
    desc: "Spacious suite featuring a king bed and luxury bathroom.",
    maxCount: 2,
    amenities: ["King Bed", "Free Wi-Fi", "Air Conditioning", "Luxury Bathroom"],
  },
  {
    id: "SINGLE_OCCUPANCY" as const,
    title: "Single Occupancy",
    desc: "Ideal for solo travellers or officers on short administrative stays.",
    maxCount: 2,
    amenities: ["Full Bed", "Free Wi-Fi", "Air Conditioning", "Work Desk"],
  },
  {
    id: "DOUBLE_OCCUPANCY" as const,
    title: "Double Occupancy",
    desc: "Spacious room with two queen beds, suitable for families or colleagues.",
    maxCount: 4,
    amenities: ["Two Queen Beds", "Free Wi-Fi", "Air Conditioning", "Family Space"],
  },
] as const;

type RoomCounts = Record<RoomCategory, number>;
type MealFlags = { breakfast: boolean; lunch: boolean; dinner: boolean };
const NO_MEALS: MealFlags = { breakfast: false, lunch: false, dinner: false };
const MEAL_KEYS: Record<MealOption, keyof MealFlags> = {
  Breakfast: "breakfast",
  Lunch: "lunch",
  Dinner: "dinner",
};

type FormState = {
  guestName: string;
  email: string;
  phone: string;
  roomCounts: RoomCounts;
  checkIn: string;
  checkOut: string;
  guests: string;
  isMember: boolean;
  membershipNumber: string;
  /** One entry per guest, index-aligned with guest number. */
  guestMeals: MealFlags[];
  specialRequests: string;
};

const INITIAL_FORM: FormState = {
  guestName: "",
  email: "",
  phone: "",
  roomCounts: { PRESIDENTIAL_SUITE: 0, SINGLE_OCCUPANCY: 0, DOUBLE_OCCUPANCY: 1 },
  checkIn: "",
  checkOut: "",
  guests: "1",
  isMember: false,
  membershipNumber: "",
  guestMeals: [NO_MEALS],
  specialRequests: "",
};

function roomLinesOf(counts: RoomCounts) {
  return ROOM_OPTIONS.filter((r) => counts[r.id] > 0).map((r) => ({
    roomCategory: r.id as RoomCategory,
    roomCount: counts[r.id],
  }));
}

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-base font-medium";

const labelClass = "text-sm font-bold text-slate-900";

function nextDay(date: string): string {
  if (!date) return "";
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + 1);
  return value.toISOString().slice(0, 10);
}

type AvailabilityData = {
  byNight: Record<
    string,
    {
      presidentialAvailable: number;
      fullBedAvailable: number;
      doubleBedAvailable: number;
    }
  >;
};

type BookingConfirmation = {
  id: string;
  roomLines: { roomCategory: RoomCategory; roomCount: number }[];
  checkIn: string;
  checkOut: string;
  guests: number;
  estimatedTotal: number;
  roomsSubtotal: number;
  mealsSubtotal: number;
  isMember: boolean;
};

export default function SimpleBookingForm() {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => getTrinidadLocalDate(), []);

  const nights = useMemo(
    () => calculateNights(formData.checkIn, formData.checkOut),
    [formData.checkIn, formData.checkOut],
  );

  const guestCount = Math.max(0, Math.min(MAX_GUESTS, parseInt(formData.guests) || 0));
  const roomLines = useMemo(() => roomLinesOf(formData.roomCounts), [formData.roomCounts]);
  const totalRooms = roomLines.reduce((sum, l) => sum + l.roomCount, 0);
  const guestMealSelections: GuestMealSelection[] = useMemo(
    () =>
      Array.from({ length: guestCount }, (_, guestIndex) => ({
        guestIndex,
        ...(formData.guestMeals[guestIndex] ?? NO_MEALS),
      })),
    [formData.guestMeals, guestCount],
  );

  const estimate = useMemo(() => {
    if (!nights || nights <= 0 || roomLines.length === 0) return null;
    return calculateMultiRoomBookingTotal({
      rooms: roomLines,
      nights,
      isMember: formData.isMember,
      guestMealSelections,
    });
  }, [roomLines, nights, formData.isMember, guestMealSelections]);

  // Fetch availability when dates change
  useEffect(() => {
    if (!formData.checkIn || !formData.checkOut) {
      setAvailability(null);
      return;
    }

    const controller = new AbortController();
    setAvailabilityLoading(true);

    void fetch(
      `/api/hotel-availability?from=${formData.checkIn}&to=${formData.checkOut}`,
      { signal: controller.signal },
    )
      .then((res) => res.json())
      .then((data) => {
        setAvailability(data as AvailabilityData);
        setAvailabilityLoading(false);
      })
      .catch((err) => {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Failed to fetch availability:", err);
          setAvailabilityLoading(false);
        }
      });

    return () => controller.abort();
  }, [formData.checkIn, formData.checkOut]);

  // Calculate minimum available across all nights
  const availableByCategory = useMemo(() => {
    if (!availability?.byNight) return null;
    const nights = Object.values(availability.byNight);
    if (nights.length === 0) return null;

    return {
      PRESIDENTIAL_SUITE: Math.min(...nights.map((n) => n.presidentialAvailable)),
      SINGLE_OCCUPANCY: Math.min(...nights.map((n) => n.fullBedAvailable)),
      DOUBLE_OCCUPANCY: Math.min(...nights.map((n) => n.doubleBedAvailable)),
    };
  }, [availability]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormData((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  function setRoomCount(category: RoomCategory, count: number) {
    setFormData((current) => ({
      ...current,
      roomCounts: { ...current.roomCounts, [category]: count },
    }));
    setMessage(null);
  }

  function setGuests(value: string) {
    const n = Math.max(0, Math.min(MAX_GUESTS, parseInt(value) || 0));
    setFormData((current) => ({
      ...current,
      guests: value,
      guestMeals: Array.from({ length: n }, (_, i) => current.guestMeals[i] ?? NO_MEALS),
    }));
    setMessage(null);
  }

  function setGuestMeal(guestIndex: number, key: keyof MealFlags, value: boolean) {
    setFormData((current) => {
      const guestMeals = Array.from(
        { length: Math.max(current.guestMeals.length, guestIndex + 1) },
        (_, i) => current.guestMeals[i] ?? NO_MEALS,
      );
      guestMeals[guestIndex] = { ...guestMeals[guestIndex], [key]: value };
      return { ...current, guestMeals };
    });
    setMessage(null);
  }

  function setMealForAll(key: keyof MealFlags, value: boolean) {
    setFormData((current) => ({
      ...current,
      guestMeals: Array.from({ length: guestCount }, (_, i) => ({
        ...(current.guestMeals[i] ?? NO_MEALS),
        [key]: value,
      })),
    }));
    setMessage(null);
  }

  const maxGuestCapacity = roomLines.reduce(
    (sum, l) => sum + ROOM_CAPACITIES[l.roomCategory] * l.roomCount,
    0,
  );

  function getCapacityError(): string | null {
    if (totalRooms === 0) return "Please choose at least one room.";
    const guests = parseInt(formData.guests) || 0;
    if (guests > MAX_GUESTS) return `Bookings are limited to ${MAX_GUESTS} guests.`;
    if (guests > maxGuestCapacity) {
      return `The selected room${totalRooms === 1 ? "" : "s"} accommodate${totalRooms === 1 ? "s" : ""} up to ${maxGuestCapacity} guest${maxGuestCapacity === 1 ? "" : "s"}. Add rooms or reduce the number of guests.`;
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const capacityError = getCapacityError();
    if (capacityError) {
      setMessage({ type: "error", text: capacityError });
      setLoading(false);
      setTimeout(() => messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      return;
    }

    try {
      const response = await fetch("/api/hotel/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: formData.guestName,
          email: formData.email,
          phone: formData.phone,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guests: parseInt(formData.guests) || 0,
          isMember: formData.isMember,
          membershipNumber: formData.membershipNumber,
          specialRequests: formData.specialRequests,
          rooms: roomLines,
          guestMealSelections,
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });
      // Turnstile tokens are single-use: get a fresh one for any retry
      setTurnstileToken(null);
      resetTurnstileWidgets();

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        booking?: {
          id: string;
          roomLines: { roomCategory: RoomCategory; roomCount: number }[];
          checkIn: string;
          checkOut: string;
          guests: number;
        };
        estimatedTotal?: number;
        roomsSubtotal?: number;
        mealsSubtotal?: number;
        guestEmailSent?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete booking request.");
      }

      if (data.booking && data.estimatedTotal !== undefined) {
        setConfirmation({
          id: data.booking.id,
          roomLines: data.booking.roomLines ?? roomLines,
          checkIn: data.booking.checkIn,
          checkOut: data.booking.checkOut,
          guests: data.booking.guests,
          estimatedTotal: data.estimatedTotal,
          roomsSubtotal: data.roomsSubtotal ?? 0,
          mealsSubtotal: data.mealsSubtotal ?? 0,
          isMember: formData.isMember,
        });
        setFormData(INITIAL_FORM);
        setTimeout(() => confirmationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } else {
        setMessage({
          type: "success",
          text: data.guestEmailSent
            ? "Request received! A confirmation email has been sent to your email address."
            : "Request received! Your reservation request has been recorded.",
        });
        setFormData(INITIAL_FORM);
        setTimeout(() => messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      }
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to complete booking request.",
      });
      setTimeout(() => messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } finally {
      setLoading(false);
    }
  }

  if (confirmation) {
    const roomNights = calculateNights(confirmation.checkIn, confirmation.checkOut);
    return (
      <div
        ref={confirmationRef}
        className="mx-auto my-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:p-8"
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-6 w-6 text-green-600"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">Request Received</h2>
            <p className="mt-1 text-sm text-slate-600">
              Your hotel booking request has been submitted successfully.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-lg bg-slate-50 p-6">
          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Reference ID</p>
              <p className="mt-1 font-mono text-sm font-medium text-slate-900">{confirmation.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Rooms</p>
              <ul className="mt-1 space-y-0.5 text-sm font-medium text-slate-900">
                {confirmation.roomLines.map((l) => (
                  <li key={l.roomCategory}>
                    {ROOM_OPTIONS.find((r) => r.id === l.roomCategory)?.title ?? l.roomCategory} × {l.roomCount}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Check-in</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{confirmation.checkIn}</p>
              <p className="text-xs text-slate-500">at {CHECK_IN_TIME}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Check-out</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{confirmation.checkOut}</p>
              <p className="text-xs text-slate-500">by {CHECK_OUT_TIME}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Stay</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {confirmation.roomLines.reduce((s, l) => s + l.roomCount, 0)} room(s) × {roomNights} night{roomNights === 1 ? "" : "s"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Guests</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{confirmation.guests}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Estimated Total</p>
            {confirmation.roomsSubtotal > 0 && (
              <p className="mt-1 text-xs text-slate-600">
                Rooms {formatTTD(confirmation.roomsSubtotal)} · Meals {formatTTD(confirmation.mealsSubtotal)}
              </p>
            )}
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {formatTTD(confirmation.estimatedTotal)} <span className="text-sm font-normal text-slate-600">TTD</span>
            </p>
            <p className="mt-2 text-xs text-slate-600">
              This is an estimate. {confirmation.isMember && "Member rates are subject to verification. "}
              You will receive final confirmation and invoice by email.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900">Next Steps</h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>• We&apos;ll confirm your booking by email within 24-48 hours</li>
            <li>• You&apos;ll receive an invoice with payment instructions</li>
            <li>• Contact us if you have any questions</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setConfirmation(null)}
            className="rounded-lg bg-slate-600 px-6 py-2.5 font-semibold text-white transition hover:bg-slate-700"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  const capacityWarning = getCapacityError();
  const unavailableLine = roomLines.find((l) => {
    const available = availableByCategory?.[l.roomCategory];
    return available !== undefined && available < l.roomCount;
  });
  const isRoomFull = unavailableLine !== undefined;

  return (
    <div className="mx-auto my-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-md sm:p-7">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">
          Hotel Booking Request
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose your dates, pick one or more rooms of any type, select meals
          for each guest, and confirm your accommodation.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span>Check-in: {CHECK_IN_TIME}</span>
          <span>•</span>
          <span>Check-out: {CHECK_OUT_TIME}</span>
        </div>
      </div>

      {message ? (
        <div
          ref={messageRef}
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
          <legend className="mb-3 block text-sm font-semibold text-slate-900">
            1. Select dates<span className="text-red-600">*</span>
          </legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="hotel-check-in" className={labelClass}>
                Check-in date<span className="text-red-600">*</span>
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
              <label htmlFor="hotel-check-out" className={labelClass}>
                Check-out date<span className="text-red-600">*</span>
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
          <legend className="mb-3 block text-sm font-semibold text-slate-900">
            2. Are you a TTPSSWA member?
          </legend>
          <div className="flex items-start gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isMember}
                onChange={(e) => update("isMember", e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-900">
                Yes, I am a TTPSSWA member
              </span>
            </label>
          </div>
          {formData.isMember && (
            <div className="mt-4 max-w-md">
              <label htmlFor="hotel-membership-number" className={labelClass}>
                Regimental/Membership Number (optional)
              </label>
              <input
                id="hotel-membership-number"
                type="text"
                placeholder="e.g., 12345"
                className={inputClass}
                value={formData.membershipNumber}
                onChange={(event) => update("membershipNumber", event.target.value)}
              />
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-3 block text-sm font-semibold text-slate-900">
            3. Choose your rooms<span className="text-red-600">*</span>
            <span className="mt-1 block text-xs font-normal text-slate-600">
              Mix room types as needed, e.g. 1 Presidential + 1 Single + 1 Double.
            </span>
          </legend>
          {availabilityLoading && formData.checkIn && formData.checkOut && (
            <p className="mb-3 text-sm text-blue-600">Checking availability...</p>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {ROOM_OPTIONS.map((room) => {
              const count = formData.roomCounts[room.id];
              const selected = count > 0;
              const memberRate = HOTEL_RATES.member[room.id];
              const nonMemberRate = HOTEL_RATES.nonMember[room.id];
              const activeRate = formData.isMember ? memberRate : nonMemberRate;
              const available = availableByCategory?.[room.id];
              const isFull = available !== undefined && available === 0;
              const maxSelectable = Math.min(room.maxCount, available ?? room.maxCount);

              return (
                <article
                  key={room.id}
                  className={`rounded-xl border bg-white p-3 transition-all ${
                    selected
                      ? "border-blue-600 ring-2 ring-blue-500"
                      : isFull
                        ? "border-slate-200 opacity-60"
                        : "border-slate-200 hover:border-slate-400 hover:shadow-md"
                  }`}
                >
                  <div>
                    {available !== undefined && (
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${
                          available === 0
                            ? "bg-red-100 text-red-800"
                            : available <= 1
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {available} of {room.maxCount} available
                      </span>
                    )}
                    <h3 className="mt-2 text-sm font-bold text-slate-900">
                      {room.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {room.desc}
                    </p>

                    <div className="mt-3 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-600">Member rate:</span>
                        <span
                          className={`text-sm font-bold ${
                            formData.isMember ? "text-green-700" : "text-slate-500"
                          }`}
                        >
                          {formatTTD(memberRate)}/night
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-600">Non-member:</span>
                        <span
                          className={`text-sm font-bold ${
                            !formData.isMember ? "text-slate-900" : "text-slate-500"
                          }`}
                        >
                          {formatTTD(nonMemberRate)}/night
                        </span>
                      </div>
                      <div className="mt-2 border-t border-slate-200 pt-2">
                        <p className="text-xs text-slate-500">
                          Capacity: {ROOM_CAPACITIES[room.id]} guests
                        </p>
                      </div>
                    </div>

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

                    <div className="mt-3">
                      <label
                        htmlFor={`hotel-room-count-${room.id}`}
                        className="block text-xs font-semibold text-slate-900"
                      >
                        Number of rooms
                      </label>
                      <select
                        id={`hotel-room-count-${room.id}`}
                        value={String(count)}
                        disabled={isFull && count === 0}
                        onChange={(event) => setRoomCount(room.id, Number(event.target.value))}
                        className={inputClass}
                      >
                        {Array.from({ length: Math.max(maxSelectable, count) + 1 }, (_, index) => (
                          <option key={index} value={String(index)}>
                            {index === 0 ? "None" : index}
                          </option>
                        ))}
                      </select>
                      {isFull && (
                        <p className="mt-1 text-xs font-semibold text-red-700">Fully booked for these dates</p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 block text-sm font-semibold text-slate-900">
            4. Guest details<span className="text-red-600">*</span>
          </legend>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="hotel-guest-name" className={labelClass}>
                Full name<span className="text-red-600">*</span>
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
              <label htmlFor="hotel-email" className={labelClass}>
                Email address<span className="text-red-600">*</span>
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
              <label htmlFor="hotel-phone" className={labelClass}>
                Phone number<span className="text-red-600">*</span>
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
              <label htmlFor="hotel-guests" className={labelClass}>
                Number of guests<span className="text-red-600">*</span>
              </label>
              <input
                id="hotel-guests"
                type="number"
                required
                min={1}
                max={MAX_GUESTS}
                inputMode="numeric"
                className={inputClass}
                value={formData.guests}
                onChange={(event) => setGuests(event.target.value)}
                aria-invalid={capacityWarning ? "true" : "false"}
                aria-describedby={capacityWarning ? "guest-capacity-error" : undefined}
              />
              {capacityWarning && (
                <p id="guest-capacity-error" className="mt-1 text-xs text-red-600">
                  {capacityWarning}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="block text-sm font-semibold text-slate-900">
            5. Meal options
          </legend>
          <p className="mt-1 text-xs text-slate-600">
            Choose meals for each guest. Each ticked meal is charged per guest, per night
            {nights > 0 ? ` (${nights} night${nights === 1 ? "" : "s"})` : ""}.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MEAL_OPTIONS.map((meal) => {
              const key = MEAL_KEYS[meal];
              const all = guestCount > 0 && guestMealSelections.every((g) => g[key]);
              return (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setMealForAll(key, !all)}
                  disabled={guestCount === 0}
                  className="rounded-full border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                >
                  {all ? `Remove ${meal.toLowerCase()} for all` : `${meal} for all guests`}
                </button>
              );
            })}
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
            <div className="hidden grid-cols-[1fr_repeat(3,5.5rem)] gap-2 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 sm:grid">
              <span>Guest</span>
              {MEAL_OPTIONS.map((meal) => (
                <span key={meal} className="text-center">
                  {meal} ({formatTTD(MEAL_PRICES[meal])})
                </span>
              ))}
            </div>
            <ul className="divide-y divide-slate-200">
              {guestMealSelections.map((g) => (
                <li
                  key={g.guestIndex}
                  className="grid grid-cols-1 gap-2 px-3 py-2 sm:grid-cols-[1fr_repeat(3,5.5rem)] sm:items-center"
                >
                  <span className="text-sm font-semibold text-slate-900">Guest {g.guestIndex + 1}</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 sm:contents">
                    {MEAL_OPTIONS.map((meal) => {
                      const key = MEAL_KEYS[meal];
                      const id = `hotel-meal-${g.guestIndex}-${key}`;
                      return (
                        <label
                          key={meal}
                          htmlFor={id}
                          className="flex min-h-[44px] cursor-pointer items-center gap-2 sm:justify-center"
                        >
                          <input
                            id={id}
                            type="checkbox"
                            checked={g[key]}
                            onChange={(e) => setGuestMeal(g.guestIndex, key, e.target.checked)}
                            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-800 sm:sr-only">
                            {meal} <span className="text-xs text-slate-500">({formatTTD(MEAL_PRICES[meal])})</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </li>
              ))}
              {guestCount === 0 && (
                <li className="px-3 py-3 text-sm text-slate-600">Enter the number of guests to choose meals.</li>
              )}
            </ul>
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="hotel-special-requests"
            className="block text-sm font-semibold text-slate-900"
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

        {estimate && (
          <div className="rounded-lg border border-slate-300 bg-slate-50 p-5">
            <h3 className="text-sm font-bold text-slate-900">Estimated Total</h3>
            <div className="mt-3 space-y-2 text-sm">
              {estimate.roomLineItems.map((line) => (
                <div key={line.roomCategory} className="flex justify-between gap-3">
                  <span className="text-slate-700">
                    {ROOM_OPTIONS.find((r) => r.id === line.roomCategory)?.title} × {line.roomCount} × {nights} night{nights === 1 ? "" : "s"} × {formatTTD(
                      formData.isMember
                        ? HOTEL_RATES.member[line.roomCategory]
                        : HOTEL_RATES.nonMember[line.roomCategory],
                    )}
                  </span>
                  <span className="shrink-0 font-semibold text-slate-900">{formatTTD(line.subtotal)}</span>
                </div>
              ))}
              {estimate.mealsSubtotal > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-700">
                    Meals
                    {estimate.mealBreakdown && (
                      <span className="block text-xs text-slate-500">
                        {MEAL_OPTIONS.filter((m) => estimate.mealBreakdown![MEAL_KEYS[m]].totalMeals > 0)
                          .map((m) => `${m} ×${estimate.mealBreakdown![MEAL_KEYS[m]].totalMeals}`)
                          .join(" · ")}
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatTTD(estimate.mealsSubtotal)}
                  </span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-slate-300 pt-2">
                <span className="text-base font-bold text-slate-900">Total (TTD)</span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatTTD(estimate.total)}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              This is an estimate. {formData.isMember && "Member rates are subject to verification. "}
              Final confirmation and invoice will be sent by email.
            </p>
          </div>
        )}

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-bold text-blue-900">Event Rentals Available</h3>
          <p className="mt-1 text-sm text-blue-800">
            We also offer conference room and pool area rentals. Contact us for availability and pricing:
          </p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <a
              href={`tel:${HOTEL_CONTACT.phone.replace(/\s/g, "")}`}
              className="font-medium text-blue-700 underline hover:text-blue-900"
            >
              Phone: {HOTEL_CONTACT.phone}
            </a>
            <a
              href={`https://wa.me/${HOTEL_CONTACT.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-700 underline hover:text-blue-900"
            >
              WhatsApp: {HOTEL_CONTACT.whatsapp}
            </a>
          </div>
        </div>

        {unavailableLine && (
          <p role="alert" className="text-sm font-medium text-red-700">
            Only {availableByCategory?.[unavailableLine.roomCategory] ?? 0}{" "}
            {ROOM_OPTIONS.find((r) => r.id === unavailableLine.roomCategory)?.title} room(s) are free for every night of these dates.
          </p>
        )}

        <TurnstileWidget onToken={setTurnstileToken} />

        <button
          type="submit"
          disabled={loading || isRoomFull || !!capacityWarning}
          className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit booking request"}
        </button>
      </form>
    </div>
  );
}

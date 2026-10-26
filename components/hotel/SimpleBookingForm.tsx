"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  HOTEL_RATES,
  MEAL_PRICES,
  ROOM_CAPACITIES,
  CHECK_IN_TIME,
  CHECK_OUT_TIME,
  HOTEL_CONTACT,
  calculateBookingTotal,
  calculateNights,
  getTrinidadLocalDate,
  formatTTD,
  type RoomCategory,
} from "@/lib/hotel-pricing";

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

type FormState = {
  guestName: string;
  email: string;
  phone: string;
  roomCategory: RoomCategory;
  roomCount: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  isMember: boolean;
  membershipNumber: string;
  meals: {
    includeBreakfast: boolean;
    includeLunch: boolean;
    includeDinner: boolean;
  };
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
  isMember: false,
  membershipNumber: "",
  meals: {
    includeBreakfast: false,
    includeLunch: false,
    includeDinner: false,
  },
  specialRequests: "",
};

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
  roomCategory: RoomCategory;
  roomCount: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  estimatedTotal: number;
  isMember: boolean;
};

export default function SimpleBookingForm() {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
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

  const mealQuantities = useMemo(() => {
    const totalGuests = parseInt(formData.guests) || 0;
    return {
      Breakfast: formData.meals.includeBreakfast ? totalGuests * nights : 0,
      Lunch: formData.meals.includeLunch ? totalGuests * nights : 0,
      Dinner: formData.meals.includeDinner ? totalGuests * nights : 0,
    };
  }, [formData.meals, formData.guests, nights]);

  const estimate = useMemo(() => {
    if (!nights || nights <= 0) return null;
    const roomCount = parseInt(formData.roomCount) || 1;
    return calculateBookingTotal({
      roomCategory: formData.roomCategory,
      roomCount,
      nights,
      isMember: formData.isMember,
      meals: mealQuantities,
    });
  }, [formData.roomCategory, formData.roomCount, nights, formData.isMember, mealQuantities]);

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

  function updateMeal(meal: "includeBreakfast" | "includeLunch" | "includeDinner", value: boolean) {
    setFormData((current) => ({
      ...current,
      meals: { ...current.meals, [meal]: value },
    }));
    setMessage(null);
  }

  function getCapacityError(): string | null {
    const capacity = ROOM_CAPACITIES[formData.roomCategory];
    const guests = parseInt(formData.guests) || 0;
    const roomCount = parseInt(formData.roomCount) || 1;
    const maxGuests = capacity * roomCount;

    if (guests > maxGuests) {
      return `${formData.roomCategory.replace(/_/g, " ")} rooms accommodate up to ${capacity} guests each. With ${roomCount} room${roomCount === 1 ? "" : "s"}, you can have up to ${maxGuests} guest${maxGuests === 1 ? "" : "s"}.`;
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
          ...formData,
          meals: mealQuantities,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        booking?: {
          id: string;
          roomCategory: RoomCategory;
          roomCount: number;
          checkIn: string;
          checkOut: string;
          guests: number;
        };
        estimatedTotal?: number;
        guestEmailSent?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete booking request.");
      }

      if (data.booking && data.estimatedTotal !== undefined) {
        setConfirmation({
          id: data.booking.id,
          roomCategory: data.booking.roomCategory,
          roomCount: data.booking.roomCount,
          checkIn: data.booking.checkIn,
          checkOut: data.booking.checkOut,
          guests: data.booking.guests,
          estimatedTotal: data.estimatedTotal,
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
              <p className="text-xs font-semibold uppercase text-slate-500">Room Type</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {confirmation.roomCategory.replace(/_/g, " ")}
              </p>
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
              <p className="text-xs font-semibold uppercase text-slate-500">Rooms</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {confirmation.roomCount} × {roomNights} night{roomNights === 1 ? "" : "s"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Guests</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{confirmation.guests}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Estimated Total</p>
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
  const selectedRoom = ROOM_OPTIONS.find((r) => r.id === formData.roomCategory);
  const roomAvailable = availableByCategory?.[formData.roomCategory];
  const isRoomFull = roomAvailable !== undefined && roomAvailable < parseInt(formData.roomCount || "1");

  return (
    <div className="mx-auto my-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-md sm:p-7">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">
          Hotel Booking Request
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Select a room category and quantity, choose your dates, and confirm
          your accommodation.
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
            3. Choose a room category<span className="text-red-600">*</span>
          </legend>
          {availabilityLoading && formData.checkIn && formData.checkOut && (
            <p className="mb-3 text-sm text-blue-600">Checking availability...</p>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {ROOM_OPTIONS.map((room) => {
              const selected = formData.roomCategory === room.id;
              const memberRate = HOTEL_RATES.member[room.id];
              const nonMemberRate = HOTEL_RATES.nonMember[room.id];
              const activeRate = formData.isMember ? memberRate : nonMemberRate;
              const available = availableByCategory?.[room.id];
              const isFull = available !== undefined && available === 0;

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

                    {selected && (
                      <div className="mt-3">
                        <label
                          htmlFor={`hotel-room-count-${room.id}`}
                          className="block text-xs font-semibold text-slate-900"
                        >
                          Number of rooms<span className="text-red-600">*</span>
                        </label>
                        <select
                          id={`hotel-room-count-${room.id}`}
                          value={formData.roomCount}
                          onChange={(event) => update("roomCount", event.target.value)}
                          className={inputClass}
                        >
                          {Array.from({ length: room.maxCount }, (_, index) => (
                            <option key={index + 1} value={String(index + 1)}>
                              {index + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      type="button"
                      aria-pressed={selected}
                      disabled={isFull}
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
                      className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        selected
                          ? "bg-blue-600 text-white"
                          : isFull
                            ? "cursor-not-allowed border border-slate-300 bg-slate-100 text-slate-400"
                            : "border border-blue-600 text-blue-700 hover:bg-blue-50"
                      }`}
                    >
                      {isFull ? "Fully booked" : selected ? "Room selected" : "Select room"}
                    </button>
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
                max={10}
                inputMode="numeric"
                className={inputClass}
                value={formData.guests}
                onChange={(event) => update("guests", event.target.value)}
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
            Select which meals to include for all guests for each day of your stay.
            {nights > 0 && (
              <span className="ml-1 font-medium">
                ({parseInt(formData.guests) || 0} guests × {nights} night{nights === 1 ? "" : "s"})
              </span>
            )}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {MEAL_OPTIONS.map((meal) => {
              const quantity = mealQuantities[meal];
              const price = MEAL_PRICES[meal];
              const total = quantity * price;
              return (
                <div
                  key={meal}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <label
                    htmlFor={`hotel-meal-${meal.toLowerCase()}`}
                    className="flex cursor-pointer items-start gap-3"
                  >
                    <input
                      id={`hotel-meal-${meal.toLowerCase()}`}
                      type="checkbox"
                      checked={
                        meal === "Breakfast"
                          ? formData.meals.includeBreakfast
                          : meal === "Lunch"
                            ? formData.meals.includeLunch
                            : formData.meals.includeDinner
                      }
                      onChange={(e) =>
                        updateMeal(
                          meal === "Breakfast"
                            ? "includeBreakfast"
                            : meal === "Lunch"
                              ? "includeLunch"
                              : "includeDinner",
                          e.target.checked,
                        )
                      }
                      className="mt-0.5 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-semibold text-slate-900">
                        {meal}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-600">
                        {formatTTD(price)} per person
                      </span>
                      {quantity > 0 && (
                        <span className="mt-1 block text-xs font-medium text-blue-700">
                          {quantity} × {formatTTD(price)} = {formatTTD(total)}
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              );
            })}
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
              <div className="flex justify-between">
                <span className="text-slate-700">
                  {parseInt(formData.roomCount)} room{parseInt(formData.roomCount) === 1 ? "" : "s"} × {nights} night{nights === 1 ? "" : "s"} × {formatTTD(
                    formData.isMember
                      ? HOTEL_RATES.member[formData.roomCategory]
                      : HOTEL_RATES.nonMember[formData.roomCategory],
                  )}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatTTD(estimate.roomsSubtotal)}
                </span>
              </div>
              {estimate.mealsSubtotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-700">Meals</span>
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

import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  reserveHotelRoom,
  ROOM_CAPACITY,
  type RoomCategory,
} from "@/lib/simple-hotel-booking-storage";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_MEALS = new Set(["Breakfast", "Lunch", "Dinner"]);

function isRoomCategory(value: string): value is RoomCategory {
  return Object.hasOwn(ROOM_CAPACITY, value);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
  const serviceNumber =
    typeof body.serviceNumber === "string" ? body.serviceNumber.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const roomCategory =
    typeof body.roomCategory === "string" ? body.roomCategory.trim() : "";
  const checkIn = typeof body.checkIn === "string" ? body.checkIn.trim() : "";
  const checkOut = typeof body.checkOut === "string" ? body.checkOut.trim() : "";
  const guests = Number(body.guests);
  const meals = Array.isArray(body.meals)
    ? body.meals.filter(
        (meal): meal is string =>
          typeof meal === "string" && ALLOWED_MEALS.has(meal),
      )
    : [];
  const specialRequests =
    typeof body.specialRequests === "string"
      ? body.specialRequests.trim().slice(0, 2000)
      : "";

  if (
    !guestName ||
    !serviceNumber ||
    !email ||
    !phone ||
    !roomCategory ||
    !checkIn ||
    !checkOut ||
    !Number.isInteger(guests)
  ) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }

  if (guests < 1 || guests > 10) {
    return NextResponse.json(
      { message: "Number of guests must be between 1 and 10." },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  if (!isRoomCategory(roomCategory)) {
    return NextResponse.json(
      { message: "Choose a valid room category." },
      { status: 400 },
    );
  }

  if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut)) {
    return NextResponse.json(
      { message: "Enter valid check-in and check-out dates." },
      { status: 400 },
    );
  }

  if (checkIn >= checkOut) {
    return NextResponse.json(
      { message: "Check-out date must be after check-in date." },
      { status: 400 },
    );
  }

  const result = await reserveHotelRoom({
    guestName,
    serviceNumber,
    email,
    phone,
    roomCategory,
    checkIn,
    checkOut,
    guests,
    meals,
    specialRequests,
  });

  if (!result.ok && result.reason === "full") {
    const label = roomCategory.replaceAll("_", " ").toLowerCase();
    return NextResponse.json(
      { message: `Sorry, all ${label} rooms are fully booked for those dates.` },
      { status: 409 },
    );
  }

  if (!result.ok) {
    return NextResponse.json(
      { message: "Booking storage is unavailable. Please try again shortly." },
      { status: 503 },
    );
  }

  const notify = process.env.HOTEL_BOOKING_NOTIFY_EMAIL?.trim();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (notify && apiKey) {
    try {
      const resend = new Resend(apiKey);
      const from =
        process.env.BOOKING_FROM_EMAIL?.trim() ||
        "TTPSSWA Bookings <onboarding@resend.dev>";
      await resend.emails.send({
        from,
        to: [notify],
        replyTo: [email],
        subject: `Confirmed TTPSSWA hotel booking [${result.booking.id}]`,
        text: [
          `Guest: ${guestName}`,
          `Service number: ${serviceNumber}`,
          `Email: ${email}`,
          `Phone: ${phone}`,
          `Room: ${roomCategory.replaceAll("_", " ")}`,
          `Check-in: ${checkIn}`,
          `Check-out: ${checkOut}`,
          `Guests: ${guests}`,
          `Meals: ${meals.length > 0 ? meals.join(", ") : "None"}`,
          `Special requests: ${specialRequests || "None"}`,
          "Status: CONFIRMED",
        ].join("\n"),
      });
    } catch (error) {
      console.error("hotel booking confirmation email:", error);
    }
  }

  return NextResponse.json(
    {
      message: "Booking successful.",
      booking: result.booking,
    },
    { status: 201 },
  );
}

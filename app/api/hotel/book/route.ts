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
const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner"] as const;
const ALLOWED_MEALS = new Set<string>(MEAL_OPTIONS);

function isRoomCategory(value: string): value is RoomCategory {
  return Object.hasOwn(ROOM_CAPACITY, value);
}

function parseMeals(value: unknown): { meals: string[]; valid: boolean } {
  if (Array.isArray(value)) {
    const meals = Array.from(
      new Set(
        value.filter(
          (meal): meal is string =>
            typeof meal === "string" && ALLOWED_MEALS.has(meal),
        ),
      ),
    ).map((meal) => `${meal} x1`);
    return { meals, valid: true };
  }

  if (value === undefined || value === null) {
    return { meals: [], valid: true };
  }

  if (typeof value !== "object") {
    return { meals: [], valid: false };
  }

  const quantities = value as Record<string, unknown>;
  const meals: string[] = [];
  for (const meal of MEAL_OPTIONS) {
    const rawQuantity = quantities[meal];
    if (rawQuantity === undefined || rawQuantity === "") continue;

    const quantity = Number(rawQuantity);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 10) {
      return { meals: [], valid: false };
    }
    if (quantity > 0) meals.push(`${meal} x${quantity}`);
  }

  return { meals, valid: true };
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const roomCategory =
    typeof body.roomCategory === "string" ? body.roomCategory.trim() : "";
  const checkIn = typeof body.checkIn === "string" ? body.checkIn.trim() : "";
  const checkOut = typeof body.checkOut === "string" ? body.checkOut.trim() : "";
  const roomCount = Number(body.roomCount);
  const guests = Number(body.guests);
  const parsedMeals = parseMeals(body.meals);
  const meals = parsedMeals.meals;
  const specialRequests =
    typeof body.specialRequests === "string"
      ? body.specialRequests.trim().slice(0, 2000)
      : "";

  if (
    !guestName ||
    !email ||
    !phone ||
    !roomCategory ||
    !checkIn ||
    !checkOut ||
    !Number.isInteger(roomCount) ||
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

  if (!parsedMeals.valid) {
    return NextResponse.json(
      { message: "Meal quantities must be whole numbers between 0 and 10." },
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

  if (roomCount < 1 || roomCount > ROOM_CAPACITY[roomCategory]) {
    return NextResponse.json(
      {
        message: `Number of rooms must be between 1 and ${ROOM_CAPACITY[roomCategory]} for this category.`,
      },
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
    email,
    phone,
    roomCategory,
    roomCount,
    checkIn,
    checkOut,
    guests,
    meals,
    specialRequests,
  });

  if (!result.ok && result.reason === "full") {
    const label = roomCategory.replaceAll("_", " ").toLowerCase();
    return NextResponse.json(
      {
        message: `Sorry, ${roomCount} ${label} room${roomCount === 1 ? "" : "s"} are not available for those dates.`,
      },
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
  let guestEmailSent = false;
  if (apiKey) {
    const resend = new Resend(apiKey);
    const from =
      process.env.BOOKING_FROM_EMAIL?.trim() ||
      "TTPSSWA Bookings <onboarding@resend.dev>";

    try {
      const guestEmail = await resend.emails.send({
        from,
        to: [email],
        subject: "Thank you for your TTPSSWA hotel booking",
        text: [
          `Hello ${guestName},`,
          "",
          "Thank you for your booking with the TTPSSWA Noel Chase Hotel and Conference Centre.",
          "Your booking request has been received and recorded.",
          "You will receive another email shortly with your invoice.",
          "",
          `Booking reference: ${result.booking.id}`,
          `Room category: ${roomCategory.replaceAll("_", " ")}`,
          `Number of rooms: ${roomCount}`,
          `Check-in: ${checkIn}`,
          `Check-out: ${checkOut}`,
          "",
          "TTPSSWA",
        ].join("\n"),
      });
      if (guestEmail.error) {
        console.error("hotel guest acknowledgment email:", guestEmail.error);
      } else {
        guestEmailSent = true;
      }
    } catch (error) {
      console.error("hotel guest acknowledgment email:", error);
    }

    if (notify) {
      try {
        await resend.emails.send({
          from,
          to: [notify],
          replyTo: [email],
          subject: `Confirmed TTPSSWA hotel booking [${result.booking.id}]`,
          text: [
            `Guest: ${guestName}`,
            `Email: ${email}`,
            `Phone: ${phone}`,
            `Room category: ${roomCategory.replaceAll("_", " ")}`,
            `Number of rooms: ${roomCount}`,
            `Check-in: ${checkIn}`,
            `Check-out: ${checkOut}`,
            `Guests: ${guests}`,
            `Meals: ${meals.length > 0 ? meals.join(", ") : "None"}`,
            `Special requests: ${specialRequests || "None"}`,
            "Status: CONFIRMED",
          ].join("\n"),
        });
      } catch (error) {
        console.error("hotel booking notification email:", error);
      }
    }
  }

  return NextResponse.json(
    {
      message: "Booking successful.",
      booking: result.booking,
      guestEmailSent,
    },
    { status: 201 },
  );
}

import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  reserveHotelRoom,
  ROOM_CAPACITY,
  type RoomCategory,
} from "@/lib/simple-hotel-booking-storage";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createApplication } from "@/lib/supabase/applications";
import type { HotelBookingData } from "@/lib/supabase/types";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { checkHoneypot, verifyFormToken } from "@/lib/spam-protection";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import {
  ROOM_CAPACITIES,
  calculateBookingTotal,
  calculateNights,
  type RoomCategory as PricingRoomCategory,
} from "@/lib/hotel-pricing";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRoomCategory(value: string): value is RoomCategory {
  return Object.hasOwn(ROOM_CAPACITY, value);
}

function parseMealCounts(value: unknown): {
  breakfast: number;
  lunch: number;
  dinner: number;
  valid: boolean;
} {
  if (typeof value !== "object" || value === null) {
    return { breakfast: 0, lunch: 0, dinner: 0, valid: false };
  }

  const meals = value as Record<string, unknown>;
  const breakfast = Number(meals.Breakfast ?? 0);
  const lunch = Number(meals.Lunch ?? 0);
  const dinner = Number(meals.Dinner ?? 0);

  if (
    !Number.isInteger(breakfast) ||
    !Number.isInteger(lunch) ||
    !Number.isInteger(dinner) ||
    breakfast < 0 ||
    lunch < 0 ||
    dinner < 0
  ) {
    return { breakfast: 0, lunch: 0, dinner: 0, valid: false };
  }

  return { breakfast, lunch, dinner, valid: true };
}

export async function POST(request: Request) {
  const clientIP = getClientIP(request);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  // Spam protection: honeypot check (silent rejection)
  if (checkHoneypot(body.website)) {
    return NextResponse.json({ message: "Booking successful." }, { status: 201 });
  }

  // Spam protection: minimum fill time check (only if token is provided)
  const formToken = typeof body.formToken === "string" ? body.formToken : null;
  const tokenCheck = verifyFormToken(formToken, 3);
  // Only reject if token was provided but invalid (skipCheck means token not provided)
  if (!tokenCheck.valid && !tokenCheck.skipCheck) {
    return NextResponse.json({ message: "Booking successful." }, { status: 201 });
  }

  // Turnstile verification (only if configured)
  if (isTurnstileConfigured()) {
    const turnstileToken =
      typeof body.turnstileToken === "string" ? body.turnstileToken : null;
    if (!turnstileToken) {
      return NextResponse.json(
        { message: "Security verification required. Please refresh and try again." },
        { status: 400 },
      );
    }
    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIP);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { message: "Verification failed. Please try again." },
        { status: 400 },
      );
    }
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
  const isMember = Boolean(body.isMember);
  const membershipNumber =
    typeof body.membershipNumber === "string" ? body.membershipNumber.trim() : "";
  const mealCounts = parseMealCounts(body.meals);
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
    return NextResponse.json(
      { message: "All required fields must be completed." },
      { status: 400 },
    );
  }

  if (guests < 1 || guests > 10) {
    return NextResponse.json(
      { message: "Number of guests must be between 1 and 10." },
      { status: 400 },
    );
  }

  if (!mealCounts.valid) {
    return NextResponse.json(
      { message: "Invalid meal quantities." },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Rate limiting by IP
  const ipLimit = await checkRateLimit(
    `hotel-booking:ip:${clientIP}`,
    RATE_LIMITS.hotelBooking,
  );
  if (!ipLimit.success) {
    return NextResponse.json(
      { message: "Too many booking attempts. Please try again later." },
      { status: 429 },
    );
  }

  // Rate limiting by email
  const emailLimit = await checkRateLimit(
    `hotel-booking:email:${email}`,
    RATE_LIMITS.hotelBooking,
  );
  if (!emailLimit.success) {
    return NextResponse.json(
      {
        message:
          "Too many booking attempts for this email. Please try again later.",
      },
      { status: 429 },
    );
  }

  if (!isRoomCategory(roomCategory)) {
    return NextResponse.json(
      { message: "Please choose a valid room category." },
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
      { message: "Please enter valid check-in and check-out dates." },
      { status: 400 },
    );
  }

  if (checkIn >= checkOut) {
    return NextResponse.json(
      { message: "Check-out date must be after check-in date." },
      { status: 400 },
    );
  }

  // Validate guest capacity
  const capacity =
    ROOM_CAPACITIES[roomCategory as PricingRoomCategory] ?? 2;
  const maxGuests = capacity * roomCount;
  if (guests > maxGuests) {
    return NextResponse.json(
      {
        message: `${roomCategory.replace(/_/g, " ")} rooms accommodate up to ${capacity} guest${capacity === 1 ? "" : "s"} each. With ${roomCount} room${roomCount === 1 ? "" : "s"}, maximum ${maxGuests} guest${maxGuests === 1 ? "" : "s"}.`,
      },
      { status: 400 },
    );
  }

  // Calculate server-side estimate
  const nights = calculateNights(checkIn, checkOut);
  const estimate = calculateBookingTotal({
    roomCategory: roomCategory as PricingRoomCategory,
    roomCount,
    nights,
    isMember,
    meals: {
      Breakfast: mealCounts.breakfast,
      Lunch: mealCounts.lunch,
      Dinner: mealCounts.dinner,
    },
  });

  // Format meals for storage
  const meals: string[] = [];
  if (mealCounts.breakfast > 0)
    meals.push(`Breakfast x${mealCounts.breakfast}`);
  if (mealCounts.lunch > 0) meals.push(`Lunch x${mealCounts.lunch}`);
  if (mealCounts.dinner > 0) meals.push(`Dinner x${mealCounts.dinner}`);

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
        message: `Sorry, ${roomCount} ${label} room${roomCount === 1 ? "" : "s"} ${roomCount === 1 ? "is" : "are"} not available for those dates.`,
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
        subject: "Thank you for your TTPSSWA hotel booking request",
        text: [
          `Hello ${guestName},`,
          "",
          "Thank you for your booking request with the TTPSSWA Noel Chase Hotel and Conference Centre.",
          "Your request has been received and recorded.",
          "You will receive a confirmation email shortly with your invoice and payment instructions.",
          "",
          `Booking reference: ${result.booking.id}`,
          `Room category: ${roomCategory.replaceAll("_", " ")}`,
          `Number of rooms: ${roomCount}`,
          `Check-in: ${checkIn}`,
          `Check-out: ${checkOut}`,
          `Guests: ${guests}`,
          `Estimated total: TTD $${estimate.total.toLocaleString("en-TT")}`,
          "",
          isMember
            ? "Member rates are subject to verification of your membership status."
            : "",
          "",
          "TTPSSWA",
        ]
          .filter(Boolean)
          .join("\n"),
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
            `Nights: ${nights}`,
            `Guests: ${guests}`,
            `Member: ${isMember ? "Yes" : "No"}`,
            isMember && membershipNumber
              ? `Membership number: ${membershipNumber}`
              : "",
            `Meals: ${meals.length > 0 ? meals.join(", ") : "None"}`,
            `Special requests: ${specialRequests || "None"}`,
            "",
            `ESTIMATED TOTAL: TTD $${estimate.total.toLocaleString("en-TT")}`,
            `- Rooms: TTD $${estimate.roomsSubtotal.toLocaleString("en-TT")}`,
            `- Meals: TTD $${estimate.mealsSubtotal.toLocaleString("en-TT")}`,
            "",
            isMember
              ? "** Member rate applied - verify membership before final invoice **"
              : "",
            "",
            "Status: CONFIRMED",
          ]
            .filter(Boolean)
            .join("\n"),
        });
      } catch (error) {
        console.error("hotel booking notification email:", error);
      }
    }
  }

  // Also save to Supabase unified storage if configured
  if (isSupabaseConfigured()) {
    try {
      const bookingData: HotelBookingData = {
        guestName,
        email,
        phone,
        roomCategory: roomCategory as HotelBookingData["roomCategory"],
        roomCount,
        checkIn,
        checkOut,
        guests,
        meals: {
          Breakfast: mealCounts.breakfast,
          Lunch: mealCounts.lunch,
          Dinner: mealCounts.dinner,
        },
        specialRequests: specialRequests || undefined,
      };

      await createApplication({
        member_id: null,
        application_type: "hotel_booking",
        application_data: {
          ...bookingData,
          prismaBookingId: result.booking.id,
          isMember,
          membershipNumber: membershipNumber || undefined,
          estimatedTotal: estimate.total,
        },
      });
    } catch (error) {
      console.error("Failed to save hotel booking to Supabase:", error);
      // Continue - Prisma booking already succeeded
    }
  }

  return NextResponse.json(
    {
      message: "Booking request received.",
      booking: result.booking,
      estimatedTotal: estimate.total,
      guestEmailSent,
    },
    { status: 201 },
  );
}

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { reserveHotelRooms } from "@/lib/simple-hotel-booking-storage";
import {
  MAX_GUESTS,
  describeLines,
  parseGuestMeals,
  parseRoomLines,
} from "@/lib/hotel-booking-request";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createApplication } from "@/lib/supabase/applications";
import type { HotelBookingData } from "@/lib/supabase/types";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { checkHoneypot, verifyFormToken } from "@/lib/spam-protection";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { parseEmailList } from "@/lib/email-notifications";
import {
  HOTEL_RATES,
  ROOM_CAPACITIES,
  calculateMultiRoomBookingTotal,
  calculateNights,
  formatRoomCategory,
  getTrinidadLocalDate,
} from "@/lib/hotel-pricing";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

  // Turnstile verification (reject if configured and token is missing or invalid)
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

  const guestName = typeof body.guestName === "string" ? body.guestName.trim().slice(0, 200) : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 50) : "";
  const checkIn = typeof body.checkIn === "string" ? body.checkIn.trim() : "";
  const checkOut = typeof body.checkOut === "string" ? body.checkOut.trim() : "";
  const guests = Number(body.guests);
  const isMember = body.isMember === true;
  const membershipNumber =
    typeof body.membershipNumber === "string" ? body.membershipNumber.trim().slice(0, 50) : "";
  const specialRequests =
    typeof body.specialRequests === "string"
      ? body.specialRequests.trim().slice(0, 2000)
      : "";

  if (!guestName || !email || !phone || !checkIn || !checkOut || !Number.isInteger(guests)) {
    return NextResponse.json(
      { message: "All required fields must be completed." },
      { status: 400 },
    );
  }

  if (guests < 1 || guests > MAX_GUESTS) {
    return NextResponse.json(
      { message: `Number of guests must be between 1 and ${MAX_GUESTS}.` },
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

  const roomLines = parseRoomLines(body);
  if (typeof roomLines === "string") {
    return NextResponse.json({ message: roomLines }, { status: 400 });
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

  if (checkIn < getTrinidadLocalDate()) {
    return NextResponse.json(
      { message: "Check-in date cannot be in the past." },
      { status: 400 },
    );
  }

  const nights = calculateNights(checkIn, checkOut);
  if (nights > 30) {
    return NextResponse.json(
      { message: "Bookings are limited to 30 nights. Please contact the hotel for longer stays." },
      { status: 400 },
    );
  }

  // Guest capacity across every selected room
  const maxGuests = roomLines.reduce(
    (sum, l) => sum + ROOM_CAPACITIES[l.roomCategory] * l.roomCount,
    0,
  );
  if (guests > maxGuests) {
    return NextResponse.json(
      {
        message: `The selected rooms (${describeLines(roomLines)}) accommodate up to ${maxGuests} guest${maxGuests === 1 ? "" : "s"}. Please add rooms or reduce the number of guests.`,
      },
      { status: 400 },
    );
  }

  const guestMealSelections = parseGuestMeals(body, guests);
  if (typeof guestMealSelections === "string") {
    return NextResponse.json({ message: guestMealSelections }, { status: 400 });
  }

  // All prices are computed here from the published rates; client totals are ignored.
  const estimate = calculateMultiRoomBookingTotal({
    rooms: roomLines,
    nights,
    isMember,
    guestMealSelections,
  });
  const mealCounts = {
    Breakfast: estimate.mealBreakdown?.breakfast.totalMeals ?? 0,
    Lunch: estimate.mealBreakdown?.lunch.totalMeals ?? 0,
    Dinner: estimate.mealBreakdown?.dinner.totalMeals ?? 0,
  };
  const mealGuests = {
    Breakfast: estimate.mealBreakdown?.breakfast.guestCount ?? 0,
    Lunch: estimate.mealBreakdown?.lunch.guestCount ?? 0,
    Dinner: estimate.mealBreakdown?.dinner.guestCount ?? 0,
  };

  const meals: string[] = [];
  for (const meal of ["Breakfast", "Lunch", "Dinner"] as const) {
    if (mealCounts[meal] > 0) {
      meals.push(`${meal} x${mealCounts[meal]} (${mealGuests[meal]} guest${mealGuests[meal] === 1 ? "" : "s"} × ${nights} night${nights === 1 ? "" : "s"})`);
    }
  }
  const rates = isMember ? HOTEL_RATES.member : HOTEL_RATES.nonMember;
  const roomLinesText = estimate.roomLineItems.map(
    (l) =>
      `- ${formatRoomCategory(l.roomCategory)} ×${l.roomCount} × ${nights} night${nights === 1 ? "" : "s"} @ TTD $${rates[l.roomCategory].toLocaleString("en-TT")} = TTD $${l.subtotal.toLocaleString("en-TT")}`,
  );
  const totalRooms = roomLines.reduce((s, l) => s + l.roomCount, 0);

  const result = await reserveHotelRooms({
    guestName,
    email,
    phone,
    roomLines,
    checkIn,
    checkOut,
    guests,
    meals,
    specialRequests,
  });

  if (!result.ok && result.reason === "full") {
    const which = result.category
      ? roomLines.find((l) => l.roomCategory === result.category)
      : undefined;
    return NextResponse.json(
      {
        message: which
          ? `Sorry, ${which.roomCount} ${formatRoomCategory(which.roomCategory)} room${which.roomCount === 1 ? "" : "s"} ${which.roomCount === 1 ? "is" : "are"} not available for every night of those dates.`
          : "Sorry, the selected rooms are not available for those dates.",
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

  const summaryLines = [
    `Booking reference: ${result.booking.id}`,
    `Rooms: ${describeLines(roomLines)} (${totalRooms} total)`,
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    `Nights: ${nights}`,
    `Guests: ${guests}`,
    `Meals: ${meals.length > 0 ? meals.join(", ") : "None"}`,
  ];
  const costLines = [
    `ESTIMATED TOTAL: TTD $${estimate.total.toLocaleString("en-TT")}`,
    ...roomLinesText,
    `- Rooms subtotal: TTD $${estimate.roomsSubtotal.toLocaleString("en-TT")}`,
    `- Meals subtotal: TTD $${estimate.mealsSubtotal.toLocaleString("en-TT")}`,
  ];

  const notifyEmails = parseEmailList(process.env.HOTEL_BOOKING_NOTIFY_EMAIL);
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
          ...summaryLines,
          "",
          ...costLines,
          "",
          isMember
            ? "Member rates are subject to verification of your membership status."
            : "",
          "",
          "TTPSSWA",
        ]
          .filter((line, i, arr) => line !== "" || arr[i - 1] !== "")
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

    if (notifyEmails.length > 0) {
      try {
        await resend.emails.send({
          from,
          to: notifyEmails,
          replyTo: [email],
          subject: `New TTPSSWA hotel booking request [${result.booking.id}] – ${describeLines(roomLines)}`,
          text: [
            `Guest: ${guestName}`,
            `Email: ${email}`,
            `Phone: ${phone}`,
            ...summaryLines,
            `Member: ${isMember ? "Yes" : "No"}`,
            isMember && membershipNumber
              ? `Membership number: ${membershipNumber}`
              : "",
            `Special requests: ${specialRequests || "None"}`,
            "",
            ...costLines,
            "",
            isMember
              ? "** Member rate applied - verify membership before final invoice **"
              : "",
            "Status: Booking request – pending confirmation",
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
        rooms: roomLines,
        // Single-type bookings keep the legacy fields for older readers.
        roomCategory: roomLines.length === 1 ? roomLines[0].roomCategory : undefined,
        roomCount: totalRooms,
        checkIn,
        checkOut,
        guests,
        meals: mealCounts,
        guestMealSelections,
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
          roomsSubtotal: estimate.roomsSubtotal,
          mealsSubtotal: estimate.mealsSubtotal,
        },
      });
    } catch (error) {
      console.error("Failed to save hotel booking to Supabase:", error);
      // Continue - the Redis reservation already succeeded
    }
  }

  return NextResponse.json(
    {
      message: "Booking request received.",
      booking: result.booking,
      estimatedTotal: estimate.total,
      roomsSubtotal: estimate.roomsSubtotal,
      mealsSubtotal: estimate.mealsSubtotal,
      guestEmailSent,
    },
    { status: 201 },
  );
}

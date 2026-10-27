import { NextResponse } from "next/server";
import { recordServiceRequest } from "@/lib/analytics-storage";
import { Resend } from "resend";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createApplication } from "@/lib/supabase/applications";
import type { HotelBookingData, RoomLineItem, GuestMealSelection } from "@/lib/supabase/types";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { checkHoneypot, verifyFormToken } from "@/lib/spam-protection";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { parseEmailList } from "@/lib/email-notifications";
import { 
  calculateNights, 
  calculateMultiRoomBookingTotal, 
  aggregateMealCounts,
  calculateTotalCapacity,
  getTrinidadLocalDate,
  formatTTD,
  formatRoomCategory,
  type RoomCategory,
} from "@/lib/hotel-pricing";
import { 
  checkMultiRoomAvailability, 
  eachNight,
  type NightAvailability 
} from "@/lib/hotel-availability";
import { getHotelReservationRecords } from "@/lib/analytics-storage";
import { aggregateNightsAvailability } from "@/lib/hotel-availability";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildMailtoFallback(payload: Record<string, unknown>): string {
  const fullName = String(payload.fullName ?? "");
  const email = String(payload.email ?? "");
  const subject = encodeURIComponent("TTPSSWA hotel reservation request");
  const body = encodeURIComponent(JSON.stringify(payload, null, 2));
  return `mailto:?subject=${subject}&body=${body}`;
}

export async function POST(request: Request) {
  const clientIP = getClientIP(request);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Spam protection: honeypot check (silent rejection)
  if (checkHoneypot(body.website)) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // Spam protection: minimum fill time check (only if token is provided)
  const formToken = typeof body.formToken === "string" ? body.formToken : null;
  const tokenCheck = verifyFormToken(formToken, 3);
  if (!tokenCheck.valid && !tokenCheck.skipCheck) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // Turnstile verification (reject if configured and token is missing or invalid)
  if (isTurnstileConfigured()) {
    const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : null;
    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIP);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 400 },
      );
    }
  }

  // Extract and validate basic fields
  const guestName = (typeof body.guestName === "string" ? body.guestName.trim() : 
                     typeof body.fullName === "string" ? body.fullName.trim() : "");
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const checkIn = typeof body.checkInDate === "string" ? body.checkInDate.trim() : "";
  const checkOut = typeof body.checkOutDate === "string" ? body.checkOutDate.trim() : "";
  const guests = Number(body.guests);
  const specialRequests = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : "";
  
  if (!guestName || !email || !phone) {
    return NextResponse.json({ 
      error: "Guest name, email and phone are required." 
    }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ 
      error: "Please enter a valid email address." 
    }, { status: 400 });
  }

  if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut)) {
    return NextResponse.json({ 
      error: "Please enter valid check-in and check-out dates." 
    }, { status: 400 });
  }

  if (checkIn >= checkOut) {
    return NextResponse.json({ 
      error: "Check-out date must be after check-in date." 
    }, { status: 400 });
  }

  if (checkIn < getTrinidadLocalDate()) {
    return NextResponse.json({ 
      error: "Check-in date cannot be in the past." 
    }, { status: 400 });
  }

  const nights = calculateNights(checkIn, checkOut);
  
  if (nights > 30) {
    return NextResponse.json({ 
      error: "Bookings are limited to 30 nights. Please contact the hotel for longer stays." 
    }, { status: 400 });
  }

  if (!Number.isInteger(guests) || guests < 1 || guests > 10) {
    return NextResponse.json({ 
      error: "Number of guests must be between 1 and 10." 
    }, { status: 400 });
  }

  // Parse and validate multi-room booking
  let rooms: RoomLineItem[] = [];
  
  if (Array.isArray(body.rooms) && body.rooms.length > 0) {
    // New format: array of room line items
    for (const room of body.rooms) {
      if (typeof room === 'object' && room !== null) {
        const r = room as Record<string, unknown>;
        const category = String(r.roomCategory || '');
        const count = Number(r.roomCount || 0);
        
        if (['PRESIDENTIAL_SUITE', 'SINGLE_OCCUPANCY', 'DOUBLE_OCCUPANCY'].includes(category) && count > 0) {
          rooms.push({
            roomCategory: category as RoomCategory,
            roomCount: count,
          });
        }
      }
    }
  }

  if (rooms.length === 0) {
    return NextResponse.json({ 
      error: "Please select at least one room." 
    }, { status: 400 });
  }

  // Validate guest capacity
  const totalCapacity = calculateTotalCapacity(rooms);
  if (guests > totalCapacity) {
    return NextResponse.json({ 
      error: `Selected rooms accommodate up to ${totalCapacity} guest${totalCapacity === 1 ? '' : 's'}.` 
    }, { status: 400 });
  }

  // Parse guest meal selections
  let guestMealSelections: GuestMealSelection[] = [];
  
  if (Array.isArray(body.guestMealSelections)) {
    for (const selection of body.guestMealSelections) {
      if (typeof selection === 'object' && selection !== null) {
        const s = selection as Record<string, unknown>;
        guestMealSelections.push({
          guestIndex: Number(s.guestIndex || 0),
          breakfast: Boolean(s.breakfast),
          lunch: Boolean(s.lunch),
          dinner: Boolean(s.dinner),
        });
      }
    }
  }

  // Calculate aggregate meal counts for legacy compatibility
  const meals = aggregateMealCounts(guestMealSelections, nights);

  // Rate limiting by IP
  const ipLimit = await checkRateLimit(
    `hotel-booking:ip:${clientIP}`,
    RATE_LIMITS.hotelBooking,
  );
  if (!ipLimit.success) {
    return NextResponse.json(
      { error: "Too many booking attempts. Please try again later." },
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
      { error: "Too many booking attempts for this email. Please try again later." },
      { status: 429 },
    );
  }

  // Check availability per room type
  try {
    const { records } = await getHotelReservationRecords();
    const byNight = aggregateNightsAvailability(records, checkIn, checkOut);
    
    const requestedRooms = {
      presidential: 0,
      fullBed: 0,
      doubleBed: 0,
    };
    
    for (const room of rooms) {
      if (room.roomCategory === 'PRESIDENTIAL_SUITE') {
        requestedRooms.presidential += room.roomCount;
      } else if (room.roomCategory === 'SINGLE_OCCUPANCY') {
        requestedRooms.fullBed += room.roomCount;
      } else if (room.roomCategory === 'DOUBLE_OCCUPANCY') {
        requestedRooms.doubleBed += room.roomCount;
      }
    }
    
    const availCheck = checkMultiRoomAvailability(
      byNight,
      checkIn,
      checkOut,
      requestedRooms
    );
    
    if (!availCheck.available) {
      const typeLabel = availCheck.conflictType === 'presidential' 
        ? 'Presidential Suite' 
        : availCheck.conflictType === 'fullBed' 
        ? 'Single Occupancy' 
        : 'Double Occupancy';
      return NextResponse.json({ 
        error: `${typeLabel} rooms not available on ${availCheck.conflictNight}. Please adjust your selection.` 
      }, { status: 409 });
    }
  } catch (error) {
    console.error('Availability check error:', error);
    // Continue - availability check is best-effort
  }

  // Calculate pricing estimate
  const estimate = calculateMultiRoomBookingTotal({
    rooms,
    nights,
    isMember: false, // We don't track membership in this flow
    guestMealSelections: guestMealSelections.length > 0 ? guestMealSelections : undefined,
    meals: guestMealSelections.length === 0 ? meals : undefined,
  });

  let applicationId: string | null = null;

  // Save to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const bookingData: HotelBookingData = {
        guestName,
        email,
        phone,
        rooms,
        checkIn,
        checkOut,
        guests,
        guestMealSelections: guestMealSelections.length > 0 ? guestMealSelections : undefined,
        meals,
        specialRequests: specialRequests || undefined,
      };

      const result = await createApplication({
        member_id: null,
        application_type: 'hotel_booking',
        application_data: bookingData as unknown as Record<string, unknown>,
      });

      if (result) {
        applicationId = result.application_id;
      }
    } catch (error) {
      console.error('Failed to save hotel booking to Supabase:', error);
    }
  }

  // Also save to Redis for analytics (legacy format compatibility)
  const redisPayload = {
    ...body,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    fullName: guestName,
    notes: specialRequests,
  };
  const redisId = await recordServiceRequest("hotel_booking", redisPayload);
  const id = applicationId || redisId;

  const notifyEmails = parseEmailList(process.env.HOTEL_BOOKING_NOTIFY_EMAIL);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  
  if (apiKey) {
    const resend = new Resend(apiKey);
    const from = process.env.BOOKING_FROM_EMAIL?.trim() || "TTPSSWA Bookings <onboarding@resend.dev>";
    
    // Build room breakdown for emails
    const roomLines = rooms.map(r => 
      `${formatRoomCategory(r.roomCategory)} x${r.roomCount}`
    ).join(", ");
    
    // Build meal breakdown for emails
    const mealLines: string[] = [];
    if (guestMealSelections.length > 0 && estimate.mealBreakdown) {
      if (estimate.mealBreakdown.breakfast.guestCount > 0) {
        mealLines.push(`Breakfast: ${estimate.mealBreakdown.breakfast.guestCount} guest(s) × ${nights} night(s) = ${estimate.mealBreakdown.breakfast.totalMeals} meals (${formatTTD(estimate.mealBreakdown.breakfast.subtotal)})`);
      }
      if (estimate.mealBreakdown.lunch.guestCount > 0) {
        mealLines.push(`Lunch: ${estimate.mealBreakdown.lunch.guestCount} guest(s) × ${nights} night(s) = ${estimate.mealBreakdown.lunch.totalMeals} meals (${formatTTD(estimate.mealBreakdown.lunch.subtotal)})`);
      }
      if (estimate.mealBreakdown.dinner.guestCount > 0) {
        mealLines.push(`Dinner: ${estimate.mealBreakdown.dinner.guestCount} guest(s) × ${nights} night(s) = ${estimate.mealBreakdown.dinner.totalMeals} meals (${formatTTD(estimate.mealBreakdown.dinner.subtotal)})`);
      }
    }
    
    // Send guest confirmation email
    try {
      await resend.emails.send({
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
          `Booking reference: ${id || 'pending'}`,
          `Check-in: ${checkIn}`,
          `Check-out: ${checkOut}`,
          `Nights: ${nights}`,
          `Guests: ${guests}`,
          "",
          "ROOMS:",
          ...rooms.map(r => `  ${formatRoomCategory(r.roomCategory)}: ${r.roomCount} room${r.roomCount === 1 ? '' : 's'}`),
          "",
          ...(mealLines.length > 0 ? ["MEALS:", ...mealLines.map(l => `  ${l}`), ""] : ["MEALS: None selected", ""]),
          ...(estimate.roomLineItems.length > 0 ? [
            "ESTIMATED PRICING:",
            "Rooms:",
            ...estimate.roomLineItems.map(item => 
              `  ${formatRoomCategory(item.roomCategory)} x${item.roomCount}: ${formatTTD(item.subtotal)}`
            ),
            `  Room subtotal: ${formatTTD(estimate.roomsSubtotal)}`,
            ...(estimate.mealsSubtotal > 0 ? [`  Meals subtotal: ${formatTTD(estimate.mealsSubtotal)}`] : []),
            `  TOTAL: ${formatTTD(estimate.total)}`,
            ""
          ] : []),
          ...(specialRequests ? [`Special requests: ${specialRequests}`, ""] : []),
          "TTPSSWA",
        ].join("\n"),
      });
    } catch (error) {
      console.error("Guest confirmation email error:", error);
    }
    
    // Send admin notification email
    if (notifyEmails.length > 0) {
      try {
        await resend.emails.send({
          from,
          to: notifyEmails,
          replyTo: [email],
          subject: `Confirmed TTPSSWA hotel booking${id ? ` [${id}]` : ""}`,
          text: [
            `Guest: ${guestName}`,
            `Email: ${email}`,
            `Phone: ${phone}`,
            `Check-in: ${checkIn}`,
            `Check-out: ${checkOut}`,
            `Nights: ${nights}`,
            `Guests: ${guests}`,
            "",
            "ROOMS:",
            roomLines,
            ...rooms.map(r => `  ${formatRoomCategory(r.roomCategory)}: ${r.roomCount}`),
            "",
            ...(mealLines.length > 0 ? ["MEALS:", ...mealLines, ""] : ["MEALS: None", ""]),
            ...(estimate.roomLineItems.length > 0 ? [
              "ESTIMATED PRICING:",
              ...estimate.roomLineItems.map(item => 
                `  ${formatRoomCategory(item.roomCategory)} x${item.roomCount} × ${nights} nights: ${formatTTD(item.subtotal)}`
              ),
              `  Room subtotal: ${formatTTD(estimate.roomsSubtotal)}`,
              ...(estimate.mealsSubtotal > 0 ? [`  Meals subtotal: ${formatTTD(estimate.mealsSubtotal)}`] : []),
              `  ESTIMATED TOTAL: ${formatTTD(estimate.total)}`,
              ""
            ] : []),
            ...(specialRequests ? [`Special requests: ${specialRequests}`, ""] : []),
            "Status: Booking request – pending confirmation",
          ].join("\n"),
        });
      } catch (error) {
        console.error("Admin notification email error:", error);
      }
    }
  }

  if (!id && notifyEmails.length === 0) {
    return NextResponse.json(
      {
        error:
          "Booking storage is unavailable. Configure Supabase or Redis and/or Resend, or use email below.",
        mailtoHref: buildMailtoFallback(body),
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ 
    ok: true, 
    id,
    estimatedTotal: estimate.total,
  }, { status: 201 });
}

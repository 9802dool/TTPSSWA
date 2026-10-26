import { NextResponse } from "next/server";
import { recordServiceRequest } from "@/lib/analytics-storage";
import { Resend } from "resend";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createApplication } from "@/lib/supabase/applications";
import type { HotelBookingData } from "@/lib/supabase/types";

export const runtime = "nodejs";

function buildMailtoFallback(payload: Record<string, unknown>): string {
  const fullName = String(payload.fullName ?? "");
  const email = String(payload.email ?? "");
  const subject = encodeURIComponent("TTPSSWA hotel reservation request");
  const body = encodeURIComponent(JSON.stringify(payload, null, 2));
  return `mailto:?subject=${subject}&body=${body}`;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const guestName = typeof body.guestName === "string" ? body.guestName.trim() : 
                   typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  
  if (!guestName || !email) {
    return NextResponse.json({ error: "Guest name and email are required." }, { status: 400 });
  }

  let applicationId: string | null = null;

  // Save to Supabase if configured
  if (isSupabaseConfigured() && phone) {
    try {
      const bookingData: Record<string, unknown> = {
        guestName,
        email,
        phone,
        roomCategory: (body.roomCategory as HotelBookingData['roomCategory']) || 'DOUBLE_OCCUPANCY',
        roomCount: typeof body.roomCount === 'number' ? body.roomCount : 1,
        checkIn: typeof body.checkIn === 'string' ? body.checkIn : '',
        checkOut: typeof body.checkOut === 'string' ? body.checkOut : '',
        guests: typeof body.guests === 'number' ? body.guests : 1,
        meals: (body.meals as HotelBookingData['meals']) || { Breakfast: 0, Lunch: 0, Dinner: 0 },
        specialRequests: typeof body.specialRequests === 'string' ? body.specialRequests : undefined,
      };

      const result = await createApplication({
        member_id: null,
        application_type: 'hotel_booking',
        application_data: bookingData,
      });

      if (result) {
        applicationId = result.application_id;
      }
    } catch (error) {
      console.error('Failed to save hotel booking to Supabase:', error);
    }
  }

  // Also save to Redis for analytics
  const redisId = await recordServiceRequest("hotel_booking", body);
  const id = applicationId || redisId;

  const notify = process.env.HOTEL_BOOKING_NOTIFY_EMAIL?.trim();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (notify && apiKey) {
    try {
      const resend = new Resend(apiKey);
      const from =
        process.env.BOOKING_FROM_EMAIL?.trim() || "TTPSSWA Bookings <onboarding@resend.dev>";
      await resend.emails.send({
        from,
        to: [notify],
        replyTo: email ? [email] : undefined,
        subject: `TTPSSWA hotel request${id ? ` [${id}]` : ""}`,
        text: [`Guest: ${guestName}`, `Email: ${email}`, "", JSON.stringify(body, null, 2)].join(
          "\n",
        ),
      });
    } catch (e) {
      console.error("hotel-booking email:", e);
    }
  }

  if (!id && !(notify && apiKey)) {
    return NextResponse.json(
      {
        error:
          "Booking storage is unavailable. Configure Supabase or Redis and/or Resend, or use email below.",
        mailtoHref: buildMailtoFallback(body),
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, id }, { status: 201 });
}

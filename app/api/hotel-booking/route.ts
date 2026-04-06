import { NextResponse } from "next/server";
import { recordServiceRequest } from "@/lib/analytics-storage";
import { Resend } from "resend";

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

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!fullName || !email) {
    return NextResponse.json({ error: "Full name and email are required." }, { status: 400 });
  }

  const id = await recordServiceRequest("hotel_booking", body);

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
        text: [`Guest: ${fullName}`, `Email: ${email}`, "", JSON.stringify(body, null, 2)].join(
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
          "Booking storage is unavailable. Configure Upstash Redis and/or Resend, or use email below.",
        mailtoHref: buildMailtoFallback(body),
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, id }, { status: 201 });
}

import { Resend } from "resend";

const NOTIFY_DEFAULT = "simeondoolarsingh@hotmail.com";

type Body = {
  fullName?: string;
  email?: string;
  phone?: string;
  checkInDate?: string;
  checkOutDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  rooms?: string;
  guests?: string;
  notes?: string;
};

type ValidData = {
  fullName: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;
  rooms: string;
  guests: string;
  notes: string;
};

function validate(body: Body): { ok: true; data: ValidData } | { ok: false; message: string } {
  const fullName = String(body.fullName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const checkInDate = String(body.checkInDate ?? "").trim();
  const checkOutDate = String(body.checkOutDate ?? "").trim();
  const checkInTime = String(body.checkInTime ?? "").trim();
  const checkOutTime = String(body.checkOutTime ?? "").trim();
  const rooms = String(body.rooms ?? "1").trim();
  const guests = String(body.guests ?? "1").trim();
  const notes = String(body.notes ?? "").trim();

  if (!fullName) return { ok: false, message: "Full name is required." };
  if (!email) return { ok: false, message: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, message: "Invalid email address." };
  if (!phone) return { ok: false, message: "Phone is required." };
  if (!checkInDate) return { ok: false, message: "Check-in date is required." };
  if (!checkOutDate) return { ok: false, message: "Check-out date is required." };
  if (!checkInTime) return { ok: false, message: "Check-in time is required." };
  if (!checkOutTime) return { ok: false, message: "Check-out time is required." };

  if (checkInDate && checkOutDate) {
    const inD = new Date(checkInDate);
    const outD = new Date(checkOutDate);
    if (outD < inD) {
      return { ok: false, message: "Check-out must be on or after check-in." };
    }
    if (
      checkInDate === checkOutDate &&
      checkInTime &&
      checkOutTime
    ) {
      const [ih, im] = checkInTime.split(":").map(Number);
      const [oh, om] = checkOutTime.split(":").map(Number);
      if (ih * 60 + im >= oh * 60 + om) {
        return {
          ok: false,
          message:
            "On the same day, check-out time must be after check-in time.",
        };
      }
    }
  }

  return {
    ok: true,
    data: {
      fullName,
      email,
      phone,
      checkInDate,
      checkOutDate,
      checkInTime,
      checkOutTime,
      rooms,
      guests,
      notes,
    },
  };
}

function buildBookingText(d: ValidData): string {
  const textLines = [
    "New hotel reservation request (TTPSSWA website)",
    "",
    `Guest: ${d.fullName}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone}`,
    `Check-in: ${d.checkInDate} at ${d.checkInTime}`,
    `Check-out: ${d.checkOutDate} at ${d.checkOutTime}`,
    `Rooms: ${d.rooms}`,
    `Guests: ${d.guests}`,
  ];
  if (d.notes) textLines.push("", "Special requests:", d.notes);
  return textLines.join("\n");
}

async function sendViaResend(d: ValidData): Promise<{ ok: true } | { ok: false }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false };

  const to = process.env.HOTEL_BOOKING_NOTIFY_EMAIL?.trim() || NOTIFY_DEFAULT;
  const from =
    process.env.BOOKING_FROM_EMAIL?.trim() ||
    "TTPSSWA Bookings <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: d.email,
    subject: `Hotel booking request — ${d.fullName}`,
    text: buildBookingText(d),
  });

  if (error) {
    console.error("Resend error:", error);
    return { ok: false };
  }
  return { ok: true };
}

/** Fallback when RESEND_API_KEY is not set (no env setup on Vercel). */
async function sendViaFormSubmit(d: ValidData): Promise<boolean> {
  const notify = process.env.HOTEL_BOOKING_NOTIFY_EMAIL?.trim() || NOTIFY_DEFAULT;
  const url = `https://formsubmit.co/ajax/${encodeURIComponent(notify)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: d.fullName,
      email: d.email,
      message: buildBookingText(d),
      _subject: `Hotel booking request — ${d.fullName}`,
    }),
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return false;
  }

  if (typeof data === "object" && data !== null && "success" in data) {
    return (data as { success?: boolean }).success === true;
  }
  return res.ok;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = validate(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.message }, { status: 400 });
  }

  const d = parsed.data;

  if (process.env.RESEND_API_KEY) {
    const r = await sendViaResend(d);
    if (r.ok) return Response.json({ ok: true });
    return Response.json(
      { error: "Could not send your request. Please try again later." },
      { status: 502 },
    );
  }

  const formOk = await sendViaFormSubmit(d);
  if (formOk) return Response.json({ ok: true });

  console.error("Hotel booking: FormSubmit failed or returned error");
  return Response.json(
    {
      error:
        "Could not deliver your request. If this keeps happening, ask the site owner to add RESEND_API_KEY or confirm the FormSubmit inbox.",
    },
    { status: 502 },
  );
}

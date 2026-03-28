import { Resend } from "resend";
import { recordServiceRequest } from "@/lib/analytics-storage";
import { mergeHotelBookingMeta } from "@/lib/hotel-booking-meta";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { signQuotationOpenToken } from "@/lib/hotel-quotation-open-token";

export const runtime = "nodejs";

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
  presidentialSuite?: string;
  fullBedRoom?: string;
  doubleBedRoom?: string;
  guests?: string;
  children?: string;
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
  presidentialSuite: number;
  fullBedRoom: number;
  doubleBedRoom: number;
  guests: string;
  children: string;
  notes: string;
};

function parseRoomInt(v: unknown, min: number, max: number): number | null {
  const n = parseInt(String(v ?? "0"), 10);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

function roomMixDescription(d: ValidData): string {
  if (d.presidentialSuite + d.fullBedRoom + d.doubleBedRoom === 0) {
    return `${d.rooms} room(s) total`;
  }
  const parts: string[] = [];
  if (d.presidentialSuite > 0) {
    parts.push(
      `${d.presidentialSuite} presidential suite${d.presidentialSuite === 1 ? "" : "s"}`,
    );
  }
  if (d.fullBedRoom > 0) {
    parts.push(
      `${d.fullBedRoom} full bed room${d.fullBedRoom === 1 ? "" : "s"}`,
    );
  }
  if (d.doubleBedRoom > 0) {
    parts.push(
      `${d.doubleBedRoom} double bed room${d.doubleBedRoom === 1 ? "" : "s"}`,
    );
  }
  return `${parts.join(", ")} (${d.rooms} total)`;
}

function validate(body: Body): { ok: true; data: ValidData } | { ok: false; message: string } {
  const fullName = String(body.fullName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const checkInDate = String(body.checkInDate ?? "").trim();
  const checkOutDate = String(body.checkOutDate ?? "").trim();
  const checkInTime = String(body.checkInTime ?? "").trim();
  const checkOutTime = String(body.checkOutTime ?? "").trim();
  const guests = String(body.guests ?? "1").trim();
  const children = String(body.children ?? "0").trim();
  const notes = String(body.notes ?? "").trim();

  const hasTypedRoomFields =
    body.presidentialSuite !== undefined ||
    body.fullBedRoom !== undefined ||
    body.doubleBedRoom !== undefined;

  let presidentialSuite = 0;
  let fullBedRoom = 0;
  let doubleBedRoom = 0;
  let rooms: string;

  if (!hasTypedRoomFields) {
    const r = parseInt(String(body.rooms ?? "1"), 10);
    if (!Number.isFinite(r) || r < 1 || r > 8) {
      return { ok: false, message: "Rooms must be between 1 and 8." };
    }
    rooms = String(r);
  } else {
    const p = parseRoomInt(body.presidentialSuite, 0, 2);
    const f = parseRoomInt(body.fullBedRoom, 0, 2);
    const d = parseRoomInt(body.doubleBedRoom, 0, 4);
    if (p === null || f === null || d === null) {
      return { ok: false, message: "Invalid room selection." };
    }
    presidentialSuite = p;
    fullBedRoom = f;
    doubleBedRoom = d;
    const sum = p + f + d;
    if (sum < 1) {
      return { ok: false, message: "Select at least one room." };
    }
    if (sum > 8) {
      return { ok: false, message: "Room count cannot exceed 8." };
    }
    rooms = String(sum);
  }

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
      presidentialSuite,
      fullBedRoom,
      doubleBedRoom,
      guests,
      children,
      notes,
    },
  };
}

function guestLine(d: ValidData): string {
  const parts = [`${d.guests} adult${Number(d.guests) === 1 ? "" : "s"}`];
  if (Number(d.children) > 0) parts.push(`${d.children} child${Number(d.children) === 1 ? "" : "ren"}`);
  return parts.join(", ");
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
    `Room mix: ${roomMixDescription(d)}`,
    `Guests: ${guestLine(d)}`,
  ];
  if (d.notes) textLines.push("", "Special requests:", d.notes);
  return textLines.join("\n");
}

function buildMailtoHref(d: ValidData): string {
  const to = process.env.HOTEL_BOOKING_NOTIFY_EMAIL?.trim() || NOTIFY_DEFAULT;
  const subject = `Hotel booking request — ${d.fullName}`;
  const body = buildBookingText(d);
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Tries verified sender first, then Resend’s shared test address (see BOOKING_FROM_EMAIL in .env.example). */
function resendFromCandidates(): string[] {
  const fromEnv = process.env.BOOKING_FROM_EMAIL?.trim();
  const ordered = [
    fromEnv,
    "TTPSSWA Bookings <onboarding@resend.dev>",
    "onboarding@resend.dev",
  ].filter((x): x is string => Boolean(x));
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const f of ordered) {
    if (!seen.has(f)) {
      seen.add(f);
      unique.push(f);
    }
  }
  return unique;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildQuotationOpenPixelUrl(recordId: string): string | null {
  const base = getPublicSiteUrl();
  const sig = signQuotationOpenToken(recordId);
  if (!base || !sig) return null;
  const url = new URL(`${base}/api/hotel-booking/quotation-open`);
  url.searchParams.set("id", recordId);
  url.searchParams.set("sig", sig);
  return url.toString();
}

function buildQuotationEmailHtml(
  d: ValidData,
  recordId: string,
  notifyEmail: string,
  trackingPixelUrl: string | null,
): string {
  const text = buildQuotationEmailText(d, recordId);
  const lines = text.split("\n");
  const paragraphs = lines.map((line) => {
    if (!line.trim()) return "<br />";
    return `<p style="margin:0 0 0.65em 0;line-height:1.5;">${escapeHtml(line)}</p>`;
  });
  const mailtoHref = `mailto:${encodeURIComponent(notifyEmail)}?subject=${encodeURIComponent(`Re: Hotel quotation ${recordId}`)}`;
  const mailtoBlock = `<p style="margin:1.25em 0 0 0;"><a href="${escapeHtml(mailtoHref)}" style="color:#1a56db;">Email us about this quotation</a></p>`;
  const pixel =
    trackingPixelUrl !== null
      ? `<img src="${escapeHtml(trackingPixelUrl)}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px;" />`
      : "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;color:#1a1a1a;">${paragraphs.join("\n")}${mailtoBlock}${pixel}</body></html>`;
}

function buildQuotationEmailText(d: ValidData, recordId: string): string {
  const lines = [
    `Hello ${d.fullName},`,
    "",
    "Thank you for your hotel reservation request with TTPSSWA.",
    "",
    "Below is a provisional quotation based on your request. Final rates and taxes will be confirmed by our coordinator.",
    "",
    `Reference: ${recordId}`,
    "",
    `Stay: check-in ${d.checkInDate} at ${d.checkInTime} → check-out ${d.checkOutDate} at ${d.checkOutTime}`,
    `Room mix: ${roomMixDescription(d)}`,
    `Guests: ${guestLine(d)}`,
  ];
  if (d.notes) {
    lines.push("", "Special requests (from your form):", d.notes);
  }
  lines.push(
    "",
    "Estimated room rates (per night — subject to confirmation):",
    "- Presidential suite: TBD",
    "- Full bed room: TBD",
    "- Double bed room: TBD",
    "",
    "Total estimated stay: TBD",
    "",
    "Rooms can be adjusted to accommodate more persons based on request.",
    "",
    "To confirm this booking or request changes, reply to this email or contact us using the phone number on our website.",
    "",
    "Best regards,",
    "TTPSSWA accommodations team",
  );
  return lines.join("\n");
}

/** Sends a provisional quotation to the guest’s email (Resend only). */
async function sendGuestQuotationEmail(
  d: ValidData,
  recordId: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const notify = process.env.HOTEL_BOOKING_NOTIFY_EMAIL?.trim() || NOTIFY_DEFAULT;
  const resend = new Resend(apiKey);
  const subject = `Your hotel quotation — TTPSSWA (${d.checkInDate})`;
  const mailtoHref = `mailto:${encodeURIComponent(notify)}?subject=${encodeURIComponent(`Re: Hotel quotation ${recordId}`)}`;
  const text =
    buildQuotationEmailText(d, recordId) +
    `\n\nEmail us (opens your mail app): ${mailtoHref}`;
  const pixelUrl = buildQuotationOpenPixelUrl(recordId);
  const html = buildQuotationEmailHtml(d, recordId, notify, pixelUrl);

  for (const from of resendFromCandidates()) {
    const { error } = await resend.emails.send({
      from,
      to: [d.email],
      replyTo: notify,
      subject,
      text,
      html,
    });
    if (!error) return true;
    console.error("Guest quotation Resend failed", { from, error });
  }
  return false;
}

async function sendViaResend(d: ValidData): Promise<{ ok: true } | { ok: false }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false };

  const to = process.env.HOTEL_BOOKING_NOTIFY_EMAIL?.trim() || NOTIFY_DEFAULT;
  const resend = new Resend(apiKey);
  const subject = `Hotel booking request — ${d.fullName}`;
  const text = buildBookingText(d);

  for (const from of resendFromCandidates()) {
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: d.email,
      subject,
      text,
    });
    if (!error) return { ok: true };
    console.error("Resend send failed", { from, error });
  }
  return { ok: false };
}

/** FormSubmit returns success as boolean or string; message explains activation / errors. */
function formSubmitSucceeded(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  const o = data as { success?: unknown };
  const s = o.success;
  return s === true || s === "true" || s === 1 || s === "1";
}

function formSubmitPayload(d: ValidData, message: string, subject: string) {
  const params = new URLSearchParams();
  params.set("name", d.fullName);
  params.set("email", d.email);
  params.set("message", message);
  params.set("_subject", subject);
  params.set("_replyto", d.email);
  params.set("_captcha", "false");
  return params;
}

/** Prefer URL-encoded POST (matches FormSubmit’s own jQuery AJAX examples). */
async function sendViaFormSubmitAjax(
  notify: string,
  d: ValidData,
  message: string,
  subject: string,
  contentType: "urlencoded" | "json",
): Promise<{ ok: boolean; raw: string }> {
  const url = `https://formsubmit.co/ajax/${encodeURIComponent(notify)}`;

  const init: RequestInit =
    contentType === "urlencoded"
      ? {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formSubmitPayload(d, message, subject).toString(),
        }
      : {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: d.fullName,
            email: d.email,
            message,
            _subject: subject,
            _replyto: d.email,
            _captcha: false,
          }),
        };

  const res = await fetch(url, init);
  const raw = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, raw };
  }
  if (formSubmitSucceeded(data)) return { ok: true, raw };
  console.error("FormSubmit AJAX response:", raw.slice(0, 800));
  return { ok: false, raw };
}

/**
 * Classic form POST (non-AJAX) — often succeeds when /ajax/ JSON handling differs.
 * Success is usually a redirect to the thank-you page.
 */
async function sendViaFormSubmitClassic(
  notify: string,
  d: ValidData,
  message: string,
  subject: string,
): Promise<boolean> {
  const url = `https://formsubmit.co/${encodeURIComponent(notify)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formSubmitPayload(d, message, subject).toString(),
    redirect: "manual",
  });

  if (res.status === 302 || res.status === 303 || res.status === 307 || res.status === 308)
    return true;
  if (res.status === 200) {
    const text = await res.text();
    if (/thank you|submission received|success/i.test(text)) return true;
  }
  return false;
}

async function sendViaFormSubmit(d: ValidData): Promise<boolean> {
  const notify = process.env.HOTEL_BOOKING_NOTIFY_EMAIL?.trim() || NOTIFY_DEFAULT;
  const message = buildBookingText(d);
  const subject = `Hotel booking request — ${d.fullName}`;

  const ajaxEncoded = await sendViaFormSubmitAjax(
    notify,
    d,
    message,
    subject,
    "urlencoded",
  );
  if (ajaxEncoded.ok) return true;

  const ajaxJson = await sendViaFormSubmitAjax(notify, d, message, subject, "json");
  if (ajaxJson.ok) return true;

  return sendViaFormSubmitClassic(notify, d, message, subject);
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

  const deliveryFailedMessage =
    "Automatic delivery did not complete. Use the button below to open your email app with your booking details, or try again in a few minutes.";

  const resendKey = process.env.RESEND_API_KEY?.trim();
  let delivered = false;

  if (resendKey) {
    const r = await sendViaResend(d);
    if (r.ok) delivered = true;
    else console.error("Hotel booking: all Resend from-address attempts failed; trying FormSubmit");
  }

  if (!delivered) {
    const formOk = await sendViaFormSubmit(d);
    if (formOk) delivered = true;
  }

  if (delivered) {
    const recordId = await recordServiceRequest("hotel_booking", {
      fullName: d.fullName,
      email: d.email,
      phone: d.phone,
      checkInDate: d.checkInDate,
      checkOutDate: d.checkOutDate,
      checkInTime: d.checkInTime,
      checkOutTime: d.checkOutTime,
      rooms: d.rooms,
      presidentialSuite: d.presidentialSuite,
      fullBedRoom: d.fullBedRoom,
      doubleBedRoom: d.doubleBedRoom,
      guests: d.guests,
      children: d.children,
      notes: d.notes || undefined,
    });

    if (recordId && resendKey) {
      const quotationOk = await sendGuestQuotationEmail(d, recordId);
      if (quotationOk) {
        await mergeHotelBookingMeta(recordId, {
          quotationEmailSentAt: new Date().toISOString(),
        });
      }
    }

    return Response.json({ ok: true });
  }

  console.error("Hotel booking: Resend and FormSubmit both failed");
  return Response.json(
    {
      error: deliveryFailedMessage,
      mailtoHref: buildMailtoHref(d),
    },
    { status: 502 },
  );
}

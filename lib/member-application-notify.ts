import { Resend } from "resend";
import { memberPhoneE164 } from "@/lib/member-phone";

export type MembershipPendingNotifyInput = {
  fullName: string;
  email: string;
  username: string;
  regimentalNumber: string;
  phoneCountryCode: string;
  phone: string;
};

function buildEmailText(d: MembershipPendingNotifyInput): string {
  return [
    `Hello ${d.fullName},`,
    "",
    "We received your TTPSSWA membership application. It is pending review by an administrator.",
    "",
    `Username: ${d.username}`,
    `Regimental number: ${d.regimentalNumber}`,
    "",
    "You will be contacted again when a decision has been made. If you have questions, reply to this email or use the contact options on our website.",
    "",
    "— TTPSSWA",
  ].join("\n");
}

function buildWhatsAppBody(d: MembershipPendingNotifyInput): string {
  return [
    `Hello ${d.fullName},`,
    "",
    "Your TTPSSWA membership application was received and is pending review.",
    "",
    `Username: ${d.username}`,
    `Regimental number: ${d.regimentalNumber}`,
    "",
    "We will contact you when there is a decision.",
    "",
    "— TTPSSWA",
  ].join("\n");
}

function membershipResendFromCandidates(): string[] {
  const fromEnv = process.env.MEMBERSHIP_FROM_EMAIL?.trim();
  const booking = process.env.BOOKING_FROM_EMAIL?.trim();
  const ordered = [
    fromEnv,
    booking,
    "TTPSSWA Membership <onboarding@resend.dev>",
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

async function sendPendingEmail(
  d: MembershipPendingNotifyInput,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const resend = new Resend(apiKey);
  const subject = "TTPSSWA — membership application received (pending review)";
  const text = buildEmailText(d);
  const replyTo =
    process.env.MEMBERSHIP_REPLY_TO_EMAIL?.trim() ||
    process.env.HOTEL_BOOKING_NOTIFY_EMAIL?.trim();

  for (const from of membershipResendFromCandidates()) {
    const { error } = await resend.emails.send({
      from,
      to: [d.email],
      ...(replyTo ? { replyTo: [replyTo] } : {}),
      subject,
      text,
    });
    if (!error) return true;
    console.error("Membership pending email: Resend failed", { from, error });
  }
  return false;
}

/** Twilio WhatsApp — requires approved sender & (in prod) message templates. */
async function sendPendingWhatsAppTwilio(
  d: MembershipPendingNotifyInput,
): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim();
  if (!sid || !token || !from) return false;

  const e164 = memberPhoneE164({
    phone: d.phone,
    phoneCountryCode: d.phoneCountryCode,
  });
  const to = `whatsapp:${e164}`;
  const body = buildWhatsAppBody(d);

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const fromParam = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;
  const params = new URLSearchParams();
  params.set("From", fromParam);
  params.set("To", to);
  params.set("Body", body);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("Membership pending WhatsApp (Twilio) failed:", res.status, t.slice(0, 600));
    return false;
  }
  return true;
}

/**
 * Email + WhatsApp to the applicant after a successful membership submission (pending).
 * Does not throw; logs failures. Safe to fire-and-forget from the API route.
 */
export async function notifyMembershipApplicationPending(
  d: MembershipPendingNotifyInput,
): Promise<void> {
  const [emailOk, waOk] = await Promise.all([
    sendPendingEmail(d),
    sendPendingWhatsAppTwilio(d),
  ]);

  if (!emailOk && process.env.RESEND_API_KEY?.trim()) {
    console.error("Membership pending: email not delivered (Resend)");
  }
  if (
    !waOk &&
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
    process.env.TWILIO_AUTH_TOKEN?.trim() &&
    process.env.TWILIO_WHATSAPP_FROM?.trim()
  ) {
    console.error("Membership pending: WhatsApp not delivered (Twilio)");
  }
}

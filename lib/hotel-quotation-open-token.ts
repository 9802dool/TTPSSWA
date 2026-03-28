import { createHmac, timingSafeEqual } from "node:crypto";

function signingSecret(): string {
  return (
    process.env.HOTEL_BOOKING_OPEN_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    ""
  );
}

/** Returns hex signature, or null if no secret is configured (pixel disabled). */
export function signQuotationOpenToken(recordId: string): string | null {
  const s = signingSecret();
  if (!s || s.length < 8) return null;
  return createHmac("sha256", s)
    .update(`quotation-open:${recordId}`)
    .digest("hex");
}

export function verifyQuotationOpenToken(recordId: string, sig: string): boolean {
  const s = signingSecret();
  if (!s || sig.length !== 64) return false;
  const expected = createHmac("sha256", s)
    .update(`quotation-open:${recordId}`)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

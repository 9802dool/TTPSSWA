import { getRedis } from "./redis";

const KEY_PREFIX = "hotel:booking:";

export type HotelBookingMeta = {
  quotationEmailSentAt?: string;
  /** Set when the guest’s HTML quotation is first opened (tracking pixel). */
  quotationEmailOpenedAt?: string;
  confirmed?: boolean;
  confirmedAt?: string;
  repliedEmailAt?: string;
  repliedEmailNote?: string;
};

export async function getHotelBookingMeta(
  id: string,
): Promise<HotelBookingMeta | null> {
  const redis = getRedis();
  if (!redis) return null;
  const key = `${KEY_PREFIX}${id}`;
  try {
    const raw = await redis.get(key);
    const s = typeof raw === "string" ? raw : raw != null ? String(raw) : "";
    if (!s.trim()) return null;
    return JSON.parse(s) as HotelBookingMeta;
  } catch (e) {
    console.error("getHotelBookingMeta:", e);
    return null;
  }
}

export async function mergeHotelBookingMeta(
  id: string,
  patch: Partial<HotelBookingMeta>,
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const key = `${KEY_PREFIX}${id}`;
  try {
    const prev = (await getHotelBookingMeta(id)) ?? {};
    const next: HotelBookingMeta = { ...prev, ...patch };
    await redis.set(key, JSON.stringify(next));
    return true;
  } catch (e) {
    console.error("mergeHotelBookingMeta:", e);
    return false;
  }
}

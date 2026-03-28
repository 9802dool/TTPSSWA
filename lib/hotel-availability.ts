import type { ServiceRequestRecord } from "./analytics-storage";

export const HOTEL_NIGHT_CAPACITY = 8;

export function addDaysYMD(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Each calendar night occupied: check-in date inclusive, check-out date exclusive. */
export function eachNight(checkIn: string, checkOut: string): string[] {
  const out: string[] = [];
  let cur = checkIn;
  while (cur < checkOut) {
    out.push(cur);
    cur = addDaysYMD(cur, 1);
  }
  return out;
}

export function roomCountFromPayload(p: Record<string, unknown>): number {
  const pres = Number(p.presidentialSuite ?? p.presidential ?? 0);
  const full = Number(p.fullBedRoom ?? p.fullBed ?? 0);
  const dbl = Number(p.doubleBedRoom ?? p.doubleBed ?? 0);
  const hasTyped = [pres, full, dbl].some((x) => Number.isFinite(x) && x > 0);
  if (hasTyped) {
    const sum =
      (Number.isFinite(pres) ? Math.max(0, Math.floor(pres)) : 0) +
      (Number.isFinite(full) ? Math.max(0, Math.floor(full)) : 0) +
      (Number.isFinite(dbl) ? Math.max(0, Math.floor(dbl)) : 0);
    return Math.min(HOTEL_NIGHT_CAPACITY, Math.max(1, sum));
  }
  const r = Number(p.rooms ?? 1);
  if (!Number.isFinite(r) || r < 1) return 1;
  return Math.min(HOTEL_NIGHT_CAPACITY, Math.floor(r));
}

export function aggregateNightsAvailability(
  records: ServiceRequestRecord[],
  rangeFrom: string,
  rangeToExclusive: string,
  capacity = HOTEL_NIGHT_CAPACITY,
): Record<string, { booked: number; available: number }> {
  const booked: Record<string, number> = {};
  for (const rec of records) {
    if (rec.serviceType !== "hotel_booking" || !rec.payload) continue;
    const p = rec.payload as Record<string, unknown>;
    const ci = String(p.checkInDate ?? "").trim();
    const co = String(p.checkOutDate ?? "").trim();
    if (!ci || !co) continue;
    const nights = eachNight(ci, co);
    const n = roomCountFromPayload(p);
    for (const night of nights) {
      if (night < rangeFrom || night >= rangeToExclusive) continue;
      booked[night] = (booked[night] ?? 0) + n;
    }
  }
  const out: Record<string, { booked: number; available: number }> = {};
  let cur = rangeFrom;
  while (cur < rangeToExclusive) {
    const b = Math.min(capacity, booked[cur] ?? 0);
    out[cur] = { booked: b, available: Math.max(0, capacity - b) };
    cur = addDaysYMD(cur, 1);
  }
  return out;
}

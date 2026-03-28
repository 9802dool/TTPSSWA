import type { ServiceRequestRecord } from "./analytics-storage";

export const HOTEL_NIGHT_CAPACITY = 8;

/** Max bookable rooms per category (matches inventory copy on the form). */
export const ROOM_TYPE_CAPS = {
  presidential: 2,
  fullBed: 2,
  doubleBed: 4,
} as const;

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

/** Typed room counts from one booking, or null if legacy (rooms-only) submission. */
export function parseTypedRoomsFromPayload(
  p: Record<string, unknown>,
): { pres: number; full: number; dbl: number } | null {
  const pres = Number(p.presidentialSuite ?? p.presidential ?? 0);
  const full = Number(p.fullBedRoom ?? p.fullBed ?? 0);
  const dbl = Number(p.doubleBedRoom ?? p.doubleBed ?? 0);
  const hasTyped = [pres, full, dbl].some((x) => Number.isFinite(x) && x > 0);
  if (!hasTyped) return null;
  return {
    pres: Math.min(ROOM_TYPE_CAPS.presidential, Math.max(0, Math.floor(pres))),
    full: Math.min(ROOM_TYPE_CAPS.fullBed, Math.max(0, Math.floor(full))),
    dbl: Math.min(ROOM_TYPE_CAPS.doubleBed, Math.max(0, Math.floor(dbl))),
  };
}

/** After capping typed counts per inventory, allocate legacy room total across double → full → presidential. */
function effectiveBookedByCategory(
  presTypedSum: number,
  fullTypedSum: number,
  doubleTypedSum: number,
  legacyRooms: number,
): { p: number; f: number; d: number } {
  const { presidential: capP, fullBed: capF, doubleBed: capD } = ROOM_TYPE_CAPS;
  let d = Math.min(capD, doubleTypedSum);
  let f = Math.min(capF, fullTypedSum);
  let p = Math.min(capP, presTypedSum);
  let rem = legacyRooms;
  const addD = Math.min(rem, capD - d);
  d += addD;
  rem -= addD;
  const addF = Math.min(rem, capF - f);
  f += addF;
  rem -= addF;
  const addP = Math.min(rem, capP - p);
  p += addP;
  rem -= addP;
  return { p, f, d };
}

export type NightAvailability = {
  booked: number;
  available: number;
  presidentialAvailable: number;
  fullBedAvailable: number;
  doubleBedAvailable: number;
};

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
): Record<string, NightAvailability> {
  const bookedTotal: Record<string, number> = {};
  const presSum: Record<string, number> = {};
  const fullSum: Record<string, number> = {};
  const dblSum: Record<string, number> = {};
  const legacySum: Record<string, number> = {};

  for (const rec of records) {
    if (rec.serviceType !== "hotel_booking" || !rec.payload) continue;
    const p = rec.payload as Record<string, unknown>;
    const ci = String(p.checkInDate ?? "").trim();
    const co = String(p.checkOutDate ?? "").trim();
    if (!ci || !co) continue;
    const nights = eachNight(ci, co);
    const n = roomCountFromPayload(p);
    const typed = parseTypedRoomsFromPayload(p);
    for (const night of nights) {
      if (night < rangeFrom || night >= rangeToExclusive) continue;
      bookedTotal[night] = (bookedTotal[night] ?? 0) + n;
      if (typed) {
        presSum[night] = (presSum[night] ?? 0) + typed.pres;
        fullSum[night] = (fullSum[night] ?? 0) + typed.full;
        dblSum[night] = (dblSum[night] ?? 0) + typed.dbl;
      } else {
        legacySum[night] = (legacySum[night] ?? 0) + n;
      }
    }
  }

  const out: Record<string, NightAvailability> = {};
  let cur = rangeFrom;
  while (cur < rangeToExclusive) {
    const b = Math.min(capacity, bookedTotal[cur] ?? 0);
    const avail = Math.max(0, capacity - b);
    const eff = effectiveBookedByCategory(
      presSum[cur] ?? 0,
      fullSum[cur] ?? 0,
      dblSum[cur] ?? 0,
      legacySum[cur] ?? 0,
    );
    out[cur] = {
      booked: b,
      available: avail,
      presidentialAvailable: Math.max(0, ROOM_TYPE_CAPS.presidential - eff.p),
      fullBedAvailable: Math.max(0, ROOM_TYPE_CAPS.fullBed - eff.f),
      doubleBedAvailable: Math.max(0, ROOM_TYPE_CAPS.doubleBed - eff.d),
    };
    cur = addDaysYMD(cur, 1);
  }
  return out;
}

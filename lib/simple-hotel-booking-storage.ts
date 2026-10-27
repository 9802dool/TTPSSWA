import { getRedis } from "./redis";
import type { ServiceRequestRecord } from "./analytics-storage";
import { eachNight } from "./hotel-availability";

const SERVICE_LOG = "analytics:service_requests";

export const ROOM_CAPACITY = {
  PRESIDENTIAL_SUITE: 2,
  SINGLE_OCCUPANCY: 2,
  DOUBLE_OCCUPANCY: 4,
} as const;

export const TOTAL_ROOM_INVENTORY =
  ROOM_CAPACITY.PRESIDENTIAL_SUITE +
  ROOM_CAPACITY.SINGLE_OCCUPANCY +
  ROOM_CAPACITY.DOUBLE_OCCUPANCY;

export type RoomCategory = keyof typeof ROOM_CAPACITY;

export type RoomLine = { roomCategory: RoomCategory; roomCount: number };

export type SimpleHotelBooking = {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  /** Single category when the booking has one room type, otherwise null. */
  roomCategory: RoomCategory | null;
  /** Total rooms across all lines. */
  roomCount: number;
  /** One line per room type (always present for new bookings). */
  roomLines: RoomLine[];
  checkIn: string;
  checkOut: string;
  guests: number;
  meals: string[];
  specialRequests: string;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
};

export type HotelBookingResult =
  | { ok: true; booking: SimpleHotelBooking }
  | { ok: false; reason: "full"; category?: RoomCategory }
  | { ok: false; reason: "unavailable" };

/** Merge duplicate categories and drop empty lines. */
export function normalizeRoomLines(lines: RoomLine[]): RoomLine[] {
  const totals = new Map<RoomCategory, number>();
  for (const line of lines) {
    if (line.roomCount > 0) {
      totals.set(line.roomCategory, (totals.get(line.roomCategory) ?? 0) + line.roomCount);
    }
  }
  return (Object.keys(ROOM_CAPACITY) as RoomCategory[])
    .filter((c) => totals.has(c))
    .map((c) => ({ roomCategory: c, roomCount: totals.get(c)! }));
}

/**
 * Atomic, per-night, per-category reservation.
 * ARGV[1] = JSON array of requested nights (YYYY-MM-DD)
 * ARGV[2..4] = requested presidential / single / double counts
 * ARGV[5..7] = inventory caps for the same categories
 * ARGV[8] = record JSON to LPUSH when every night/category fits
 * Returns 1 on success, or -1/-2/-3 for the first category that is full.
 *
 * Occupancy mirrors aggregateNightsAvailability(): typed counts
 * (presidentialSuite / fullBedRoom / doubleBedRoom) are used when present,
 * otherwise roomCategory+roomCount, otherwise a legacy "rooms" total that is
 * allocated double -> single -> presidential. CANCELLED rows are ignored.
 */
export const RESERVE_ROOMS_IF_AVAILABLE = `
local rows = redis.call("LRANGE", KEYS[1], 0, 499)
local nights = cjson.decode(ARGV[1])
local req = { tonumber(ARGV[2]) or 0, tonumber(ARGV[3]) or 0, tonumber(ARGV[4]) or 0 }
local cap = { tonumber(ARGV[5]), tonumber(ARGV[6]), tonumber(ARGV[7]) }
local function num(v)
  local n = tonumber(v)
  if not n or n ~= n or n < 0 then return 0 end
  return math.floor(n)
end
local typed = {}
local legacy = {}
for i = 1, #nights do typed[i] = {0, 0, 0}; legacy[i] = 0 end

for _, raw in ipairs(rows) do
  local okDecode, row = pcall(cjson.decode, raw)
  if okDecode and type(row) == "table" and row.serviceType == "hotel_booking" and type(row.payload) == "table" then
    local p = row.payload
    local status = p.status
    if type(status) ~= "string" then status = "CONFIRMED" end
    local ci = p.checkIn or p.checkInDate
    local co = p.checkOut or p.checkOutDate
    if status ~= "CANCELLED" and type(ci) == "string" and type(co) == "string" then
      local c = {
        num(p.presidentialSuite or p.presidential),
        num(p.fullBedRoom or p.fullBed),
        num(p.doubleBedRoom or p.doubleBed),
      }
      local isTyped = (c[1] + c[2] + c[3]) > 0
      local legacyRooms = 0
      if not isTyped then
        local cnt = num(p.roomCount)
        if cnt < 1 then cnt = 1 end
        if p.roomCategory == "PRESIDENTIAL_SUITE" then c[1] = cnt; isTyped = true
        elseif p.roomCategory == "SINGLE_OCCUPANCY" then c[2] = cnt; isTyped = true
        elseif p.roomCategory == "DOUBLE_OCCUPANCY" then c[3] = cnt; isTyped = true
        else
          legacyRooms = tonumber(p.rooms) or 1
          if legacyRooms < 1 then legacyRooms = 1 end
          legacyRooms = math.floor(legacyRooms)
        end
      end
      for i = 1, #nights do
        local n = nights[i]
        if ci <= n and n < co then
          if isTyped then
            typed[i][1] = typed[i][1] + c[1]
            typed[i][2] = typed[i][2] + c[2]
            typed[i][3] = typed[i][3] + c[3]
          else
            legacy[i] = legacy[i] + legacyRooms
          end
        end
      end
    end
  end
end

for i = 1, #nights do
  local p = math.min(cap[1], typed[i][1])
  local f = math.min(cap[2], typed[i][2])
  local d = math.min(cap[3], typed[i][3])
  local rem = legacy[i]
  local add = math.min(rem, cap[3] - d); d = d + add; rem = rem - add
  add = math.min(rem, cap[2] - f); f = f + add; rem = rem - add
  add = math.min(rem, cap[1] - p); p = p + add
  if req[1] > 0 and p + req[1] > cap[1] then return -1 end
  if req[2] > 0 and f + req[2] > cap[2] then return -2 end
  if req[3] > 0 and d + req[3] > cap[3] then return -3 end
end

redis.call("LPUSH", KEYS[1], ARGV[8])
redis.call("LTRIM", KEYS[1], 0, 499)
return 1
`;

/** Atomically set payload.status on one hotel booking record in the Redis log. */
export const SET_BOOKING_STATUS = `
local rows = redis.call("LRANGE", KEYS[1], 0, 499)
for i, raw in ipairs(rows) do
  local okDecode, row = pcall(cjson.decode, raw)
  if okDecode and type(row) == "table" and row.id == ARGV[1] and row.serviceType == "hotel_booking" and type(row.payload) == "table" then
    row.payload.status = ARGV[2]
    row.payload.updatedAt = ARGV[3]
    redis.call("LSET", KEYS[1], i - 1, cjson.encode(row))
    return 1
  end
end
return 0
`;

const FULL_CODES: Record<number, RoomCategory> = {
  [-1]: "PRESIDENTIAL_SUITE",
  [-2]: "SINGLE_OCCUPANCY",
  [-3]: "DOUBLE_OCCUPANCY",
};

export async function reserveHotelRooms(
  data: Omit<
    SimpleHotelBooking,
    "id" | "status" | "createdAt" | "updatedAt" | "roomCategory" | "roomCount"
  >,
): Promise<HotelBookingResult> {
  const lines = normalizeRoomLines(data.roomLines);
  if (lines.length === 0) return { ok: false, reason: "full" };
  const redis = getRedis();
  if (!redis) return { ok: false, reason: "unavailable" };

  const countOf = (c: RoomCategory) =>
    lines.find((l) => l.roomCategory === c)?.roomCount ?? 0;
  const now = new Date().toISOString();
  const booking: SimpleHotelBooking = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...data,
    roomLines: lines,
    roomCategory: lines.length === 1 ? lines[0].roomCategory : null,
    roomCount: lines.reduce((s, l) => s + l.roomCount, 0),
    status: "CONFIRMED",
    createdAt: now,
    updatedAt: now,
  };
  const record: ServiceRequestRecord = {
    id: booking.id,
    serviceType: "hotel_booking",
    createdAt: now,
    payload: {
      ...booking,
      // Aliases used by the admin hotel database, availability API and older scripts.
      fullName: booking.guestName,
      checkInDate: booking.checkIn,
      checkOutDate: booking.checkOut,
      rooms: String(booking.roomCount),
      presidentialSuite: String(countOf("PRESIDENTIAL_SUITE")),
      fullBedRoom: String(countOf("SINGLE_OCCUPANCY")),
      doubleBedRoom: String(countOf("DOUBLE_OCCUPANCY")),
    },
  };

  try {
    const script = redis.createScript<number>(RESERVE_ROOMS_IF_AVAILABLE);
    const result = await script.exec(
      [SERVICE_LOG],
      [
        JSON.stringify(eachNight(booking.checkIn, booking.checkOut)),
        String(countOf("PRESIDENTIAL_SUITE")),
        String(countOf("SINGLE_OCCUPANCY")),
        String(countOf("DOUBLE_OCCUPANCY")),
        String(ROOM_CAPACITY.PRESIDENTIAL_SUITE),
        String(ROOM_CAPACITY.SINGLE_OCCUPANCY),
        String(ROOM_CAPACITY.DOUBLE_OCCUPANCY),
        JSON.stringify(record),
      ],
    );
    if (Number(result) === 1) return { ok: true, booking };
    return { ok: false, reason: "full", category: FULL_CODES[Number(result)] };
  } catch (error) {
    console.error("reserveHotelRooms:", error);
    return { ok: false, reason: "unavailable" };
  }
}

/** Backwards-compatible single-category wrapper. */
export async function reserveHotelRoom(
  data: Omit<
    SimpleHotelBooking,
    "id" | "status" | "createdAt" | "updatedAt" | "roomLines" | "roomCategory"
  > & { roomCategory: RoomCategory },
): Promise<HotelBookingResult> {
  const { roomCategory, roomCount, ...rest } = data;
  return reserveHotelRooms({ ...rest, roomLines: [{ roomCategory, roomCount }] });
}

/**
 * Set the availability status of a booking in Redis. CANCELLED releases the
 * room-night holds; CONFIRMED re-applies them. Returns false when the record
 * is not in the log or Redis is unavailable.
 */
export async function setHotelBookingRedisStatus(
  id: string,
  status: "CONFIRMED" | "CANCELLED",
): Promise<boolean> {
  const redis = getRedis();
  if (!redis || !id) return false;
  try {
    const script = redis.createScript<number>(SET_BOOKING_STATUS);
    const r = await script.exec([SERVICE_LOG], [id, status, new Date().toISOString()]);
    return Number(r) === 1;
  } catch (error) {
    console.error("setHotelBookingRedisStatus:", error);
    return false;
  }
}

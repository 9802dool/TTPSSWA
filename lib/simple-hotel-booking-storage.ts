import { getRedis } from "./redis";
import type { ServiceRequestRecord } from "./analytics-storage";

const SERVICE_LOG = "analytics:service_requests";

export const ROOM_CAPACITY = {
  PRESIDENTIAL_SUITE: 2,
  SINGLE_OCCUPANCY: 2,
  DOUBLE_OCCUPANCY: 4,
} as const;

export type RoomCategory = keyof typeof ROOM_CAPACITY;

export type SimpleHotelBooking = {
  id: string;
  guestName: string;
  serviceNumber: string;
  email: string;
  phone: string;
  roomCategory: RoomCategory;
  checkIn: string;
  checkOut: string;
  guests: number;
  meals: string[];
  specialRequests: string;
  status: "CONFIRMED";
  createdAt: string;
  updatedAt: string;
};

export type HotelBookingResult =
  | { ok: true; booking: SimpleHotelBooking }
  | { ok: false; reason: "full" | "unavailable" };

const RESERVE_IF_AVAILABLE = `
local rows = redis.call("LRANGE", KEYS[1], 0, 499)
local category = ARGV[1]
local requestedStart = ARGV[2]
local requestedEnd = ARGV[3]
local capacity = tonumber(ARGV[4])
local occupied = 0

for _, raw in ipairs(rows) do
  local decodedOk, row = pcall(cjson.decode, raw)
  if decodedOk and row and row.serviceType == "hotel_booking" and row.payload then
    local p = row.payload
    local status = p.status or "CONFIRMED"
    local checkIn = p.checkIn or p.checkInDate
    local checkOut = p.checkOut or p.checkOutDate

    if status ~= "CANCELLED" and checkIn and checkOut
      and checkIn < requestedEnd and checkOut > requestedStart then
      if p.roomCategory == category then
        occupied = occupied + 1
      elseif not p.roomCategory then
        if category == "PRESIDENTIAL_SUITE" then
          occupied = occupied + (tonumber(p.presidentialSuite or p.presidential or 0) or 0)
        elseif category == "SINGLE_OCCUPANCY" then
          occupied = occupied + (tonumber(p.fullBedRoom or p.fullBed or 0) or 0)
        elseif category == "DOUBLE_OCCUPANCY" then
          occupied = occupied + (tonumber(p.doubleBedRoom or p.doubleBed or 0) or 0)
        end
      end
    end
  end
end

if occupied >= capacity then
  return 0
end

redis.call("LPUSH", KEYS[1], ARGV[5])
redis.call("LTRIM", KEYS[1], 0, 499)
return 1
`;

export async function reserveHotelRoom(
  data: Omit<SimpleHotelBooking, "id" | "status" | "createdAt" | "updatedAt">,
): Promise<HotelBookingResult> {
  const redis = getRedis();
  if (!redis) return { ok: false, reason: "unavailable" };

  const now = new Date().toISOString();
  const booking: SimpleHotelBooking = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...data,
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
      // Retain aliases used by the existing admin hotel database.
      fullName: booking.guestName,
      checkInDate: booking.checkIn,
      checkOutDate: booking.checkOut,
      rooms: "1",
      presidentialSuite:
        booking.roomCategory === "PRESIDENTIAL_SUITE" ? "1" : "0",
      fullBedRoom: booking.roomCategory === "SINGLE_OCCUPANCY" ? "1" : "0",
      doubleBedRoom: booking.roomCategory === "DOUBLE_OCCUPANCY" ? "1" : "0",
    },
  };

  try {
    const script = redis.createScript<number>(RESERVE_IF_AVAILABLE);
    const reserved = await script.exec(
      [SERVICE_LOG],
      [
        booking.roomCategory,
        booking.checkIn,
        booking.checkOut,
        String(ROOM_CAPACITY[booking.roomCategory]),
        JSON.stringify(record),
      ],
    );
    return reserved === 1
      ? { ok: true, booking }
      : { ok: false, reason: "full" };
  } catch (error) {
    console.error("reserveHotelRoom:", error);
    return { ok: false, reason: "unavailable" };
  }
}

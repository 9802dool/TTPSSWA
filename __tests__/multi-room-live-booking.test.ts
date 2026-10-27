import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/simple-hotel-booking-storage", async (orig) => {
  const actual = await orig<typeof import("../lib/simple-hotel-booking-storage")>();
  return { ...actual, reserveHotelRooms: vi.fn() };
});
vi.mock("../lib/supabase/server", () => ({ isSupabaseConfigured: vi.fn(() => true) }));
vi.mock("../lib/supabase/applications", () => ({ createApplication: vi.fn() }));
vi.mock("../lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
  getClientIP: vi.fn(() => "127.0.0.1"),
  RATE_LIMITS: { hotelBooking: { windowMs: 60000, maxRequests: 5 } },
}));
vi.mock("../lib/spam-protection", () => ({
  checkHoneypot: vi.fn(() => false),
  verifyFormToken: vi.fn(() => ({ valid: true, skipCheck: true })),
}));
vi.mock("../lib/turnstile", () => ({
  isTurnstileConfigured: vi.fn(() => false),
  verifyTurnstileToken: vi.fn(() => Promise.resolve({ success: true })),
}));

import { POST } from "../app/api/hotel/book/route";
import { POST as legacyPOST } from "../app/api/hotel-booking/route";
import { reserveHotelRooms } from "../lib/simple-hotel-booking-storage";
import { createApplication } from "../lib/supabase/applications";
import { parseGuestMeals, parseRoomLines } from "../lib/hotel-booking-request";
import { calculatePeriodMetrics, type HotelBooking } from "../lib/hotel-performance-metrics";
import { parseRoomLines as parseStoredRoomLines } from "../lib/hotel-performance-data";

const req = (url: string, body: unknown) =>
  new Request(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

const threeRooms = [
  { roomCategory: "PRESIDENTIAL_SUITE", roomCount: 1 },
  { roomCategory: "SINGLE_OCCUPANCY", roomCount: 1 },
  { roomCategory: "DOUBLE_OCCUPANCY", roomCount: 1 },
];
const meals8 = Array.from({ length: 8 }, (_, guestIndex) => ({
  guestIndex,
  breakfast: guestIndex < 3,
  lunch: false,
  dinner: guestIndex < 2,
}));
const base = {
  guestName: "TEST Guest",
  email: "test@example.com",
  phone: "1-868-555-0000",
  checkIn: "2030-12-01",
  checkOut: "2030-12-03",
  guests: 8,
  isMember: false,
  rooms: threeRooms,
  guestMealSelections: meals8,
};

describe("POST /api/hotel/book (multi-room)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(reserveHotelRooms).mockImplementation(async (d) => ({
      ok: true,
      booking: {
        ...d,
        id: "b1",
        roomCategory: null,
        roomCount: 3,
        status: "CONFIRMED",
        createdAt: "",
        updatedAt: "",
      },
    }));
  });

  it("prices 1P+1S+1D for 8 guests with per-guest meals on the server", async () => {
    const res = await POST(req("http://x/api/hotel/book", { ...base, estimatedTotal: 1 }));
    const data = await res.json();
    expect(res.status).toBe(201);
    // (495 + 440 + 770) × 2 nights = 3410; meals (3×55 + 2×70) × 2 = 610
    expect(data.roomsSubtotal).toBe(3410);
    expect(data.mealsSubtotal).toBe(610);
    expect(data.estimatedTotal).toBe(4020);
    expect(vi.mocked(reserveHotelRooms).mock.calls[0][0].roomLines).toEqual(threeRooms);
    const saved = vi.mocked(createApplication).mock.calls[0][0].application_data as Record<string, unknown>;
    expect(saved.rooms).toEqual(threeRooms);
    expect(saved.roomCategory).toBeUndefined();
    expect(saved.roomCount).toBe(3);
    expect(saved.meals).toEqual({ Breakfast: 6, Lunch: 0, Dinner: 4 });
    expect(saved.estimatedTotal).toBe(4020);
  });

  it("applies member rates only when isMember is true", async () => {
    const res = await POST(req("http://x/api/hotel/book", { ...base, isMember: true }));
    expect((await res.json()).roomsSubtotal).toBe((440 + 385 + 715) * 2);
  });

  it("rejects more guests than the selected rooms hold", async () => {
    const res = await POST(
      req("http://x/api/hotel/book", { ...base, guests: 9, guestMealSelections: undefined }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).message).toContain("up to 8 guests");
  });

  it("returns 409 naming the full room type", async () => {
    vi.mocked(reserveHotelRooms).mockResolvedValue({ ok: false, reason: "full", category: "SINGLE_OCCUPANCY" });
    const res = await POST(req("http://x/api/hotel/book", base));
    expect(res.status).toBe(409);
    expect((await res.json()).message).toContain("Single Occupancy");
  });

  it("legacy /api/hotel-booking maps old fields onto the same atomic path", async () => {
    const res = await legacyPOST(
      req("http://x/api/hotel-booking", {
        fullName: "TEST Legacy",
        email: "t@example.com",
        phone: "1",
        checkInDate: "2030-12-01",
        checkOutDate: "2030-12-02",
        presidentialSuite: "1",
        fullBedRoom: "0",
        doubleBedRoom: "1",
        guests: "3",
        notes: "hi",
      }),
    );
    expect(res.status).toBe(201);
    expect(vi.mocked(reserveHotelRooms).mock.calls[0][0].roomLines).toEqual([
      { roomCategory: "PRESIDENTIAL_SUITE", roomCount: 1 },
      { roomCategory: "DOUBLE_OCCUPANCY", roomCount: 1 },
    ]);
  });
});

describe("request parsing bounds", () => {
  it("merges duplicate categories and enforces inventory", () => {
    expect(
      parseRoomLines({
        rooms: [
          { roomCategory: "DOUBLE_OCCUPANCY", roomCount: 2 },
          { roomCategory: "DOUBLE_OCCUPANCY", roomCount: 2 },
        ],
      }),
    ).toEqual([{ roomCategory: "DOUBLE_OCCUPANCY", roomCount: 4 }]);
    expect(
      typeof parseRoomLines({
        rooms: [
          { roomCategory: "PRESIDENTIAL_SUITE", roomCount: 2 },
          { roomCategory: "PRESIDENTIAL_SUITE", roomCount: 1 },
        ],
      }),
    ).toBe("string");
    expect(typeof parseRoomLines({ rooms: [{ roomCategory: "SINGLE_OCCUPANCY", roomCount: 1.5 }] })).toBe("string");
    expect(typeof parseRoomLines({ rooms: [] })).toBe("string");
    expect(typeof parseRoomLines({ rooms: [{ roomCategory: "VILLA", roomCount: 1 }] })).toBe("string");
    expect(parseRoomLines({ roomCategory: "SINGLE_OCCUPANCY", roomCount: 2 })).toEqual([
      { roomCategory: "SINGLE_OCCUPANCY", roomCount: 2 },
    ]);
  });

  it("requires exactly one unique, in-range meal entry per guest", () => {
    const sel = (i: number) => ({ guestIndex: i, breakfast: true, lunch: false, dinner: false });
    expect(typeof parseGuestMeals({ guestMealSelections: [sel(0), sel(1), sel(2)] }, 2)).toBe("string");
    expect(typeof parseGuestMeals({ guestMealSelections: [sel(0), sel(0)] }, 2)).toBe("string");
    expect(typeof parseGuestMeals({ guestMealSelections: [sel(0), sel(5)] }, 2)).toBe("string");
    expect(parseGuestMeals({ guestMealSelections: [sel(1), sel(0)] }, 2)).toHaveLength(2);
    // legacy all-guest flags
    const legacy = parseGuestMeals({ meals: { includeDinner: true } }, 3);
    expect(Array.isArray(legacy) && legacy.every((g) => g.dinner && !g.breakfast)).toBe(true);
  });
});

describe("dashboard metrics with multi-room bookings", () => {
  const booking: HotelBooking = {
    id: "a1",
    guestName: "TEST",
    email: "",
    phone: "",
    roomCategory: null,
    roomCount: 3,
    rooms: [
      { roomCategory: "PRESIDENTIAL_SUITE", roomCount: 1 },
      { roomCategory: "SINGLE_OCCUPANCY", roomCount: 1 },
      { roomCategory: "DOUBLE_OCCUPANCY", roomCount: 1 },
    ],
    checkIn: "2030-12-01",
    checkOut: "2030-12-03",
    guests: 8,
    meals: { Breakfast: 6, Lunch: 0, Dinner: 4 },
    specialRequests: null,
    isMember: false,
    status: "approved",
    submittedAt: "2030-12-01T12:00:00Z",
    isLegacy: false,
  };

  it("counts revenue, room-nights per type and meals once per booking", () => {
    const m = calculatePeriodMetrics([booking], "2030-12-01", "2031-01-01");
    expect(m.roomRevenue).toBe(3410);
    expect(m.mealRevenue).toBe(610);
    expect(m.roomNightsBooked).toBe(6);
    expect(m.occupancyByRoomType.PRESIDENTIAL_SUITE.booked).toBe(2);
    expect(m.occupancyByRoomType.SINGLE_OCCUPANCY.booked).toBe(2);
    expect(m.occupancyByRoomType.DOUBLE_OCCUPANCY.booked).toBe(2);
    expect(m.bookingRequestsReceived).toBe(1);
    expect(m.bookingRequestsConfirmed).toBe(1);
  });

  it("reads stored rooms arrays and legacy single-room rows", () => {
    expect(parseStoredRoomLines({ rooms: [{ roomCategory: "DOUBLE_OCCUPANCY", roomCount: 2 }] })).toEqual([
      { roomCategory: "DOUBLE_OCCUPANCY", roomCount: 2 },
    ]);
    expect(parseStoredRoomLines({ roomCategory: "SINGLE_OCCUPANCY", roomCount: 1, rooms: "1" })).toEqual([
      { roomCategory: "SINGLE_OCCUPANCY", roomCount: 1 },
    ]);
  });
});

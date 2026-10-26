import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../app/api/hotel/book/route";
import { NextRequest } from "next/server";

// Mock external dependencies
vi.mock("../lib/simple-hotel-booking-storage", () => ({
  reserveHotelRoom: vi.fn(),
  ROOM_CAPACITY: {
    PRESIDENTIAL_SUITE: 2,
    SINGLE_OCCUPANCY: 2,
    DOUBLE_OCCUPANCY: 4,
  },
}));

vi.mock("../lib/supabase/server", () => ({
  isSupabaseConfigured: vi.fn(() => false),
}));

vi.mock("../lib/supabase/applications", () => ({
  createApplication: vi.fn(),
}));

vi.mock("../lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
  getClientIP: vi.fn(() => "127.0.0.1"),
  RATE_LIMITS: {
    hotelBooking: { windowMs: 60000, maxRequests: 5 },
  },
}));

vi.mock("../lib/spam-protection", () => ({
  checkHoneypot: vi.fn(() => false),
  verifyFormToken: vi.fn(() => ({ valid: true, skipCheck: true })),
}));

vi.mock("../lib/turnstile", () => ({
  isTurnstileConfigured: vi.fn(() => false),
  verifyTurnstileToken: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(() => Promise.resolve({ data: { id: "test" } })),
    },
  })),
}));

import { reserveHotelRoom } from "../lib/simple-hotel-booking-storage";

describe("Hotel Booking API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest("http://localhost:3000/api/hotel/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  const validBooking = {
    guestName: "John Doe",
    email: "john@example.com",
    phone: "1-868-555-1234",
    roomCategory: "DOUBLE_OCCUPANCY",
    roomCount: 2,
    checkIn: "2026-12-01",
    checkOut: "2026-12-05",
    guests: 4,
    isMember: true,
    membershipNumber: "12345",
    meals: {
      includeBreakfast: true,
      includeLunch: false,
      includeDinner: true,
    },
    specialRequests: "Late check-in requested",
  };

  describe("Successful bookings", () => {
    it("should accept a valid member booking and calculate estimate", async () => {
      vi.mocked(reserveHotelRoom).mockResolvedValue({
        ok: true,
        booking: {
          id: "test-booking-123",
          guestName: "John Doe",
          email: "john@example.com",
          phone: "1-868-555-1234",
          roomCategory: "DOUBLE_OCCUPANCY",
          roomCount: 2,
          checkIn: "2026-12-01",
          checkOut: "2026-12-05",
          guests: 4,
          meals: ["Breakfast x16", "Dinner x8"],
          specialRequests: "Late check-in requested",
          status: "CONFIRMED",
          createdAt: "2026-10-26T12:00:00Z",
          updatedAt: "2026-10-26T12:00:00Z",
        },
      });

      const request = createRequest(validBooking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.booking).toBeDefined();
      expect(data.estimatedTotal).toBeDefined();
      // 2 rooms × 4 nights × 715 (member rate) + meals (4 guests × 4 nights: 16 breakfast + 16 dinner)
      expect(data.estimatedTotal).toBe(2 * 4 * 715 + 16 * 55 + 16 * 70);
    });

    it("should accept a valid non-member booking", async () => {
      vi.mocked(reserveHotelRoom).mockResolvedValue({
        ok: true,
        booking: {
          id: "test-booking-456",
          guestName: "Jane Smith",
          email: "jane@example.com",
          phone: "1-868-555-5678",
          roomCategory: "PRESIDENTIAL_SUITE",
          roomCount: 1,
          checkIn: "2026-12-10",
          checkOut: "2026-12-15",
          guests: 2,
          meals: [],
          specialRequests: "",
          status: "CONFIRMED",
          createdAt: "2026-10-26T12:00:00Z",
          updatedAt: "2026-10-26T12:00:00Z",
        },
      });

      const booking = {
        ...validBooking,
        guestName: "Jane Smith",
        email: "jane@example.com",
        roomCategory: "PRESIDENTIAL_SUITE",
        roomCount: 1,
        checkIn: "2026-12-10",
        checkOut: "2026-12-15",
        guests: 2,
        isMember: false,
        membershipNumber: "",
        meals: { includeBreakfast: false, includeLunch: false, includeDinner: false },
      };

      const request = createRequest(booking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.estimatedTotal).toBe(1 * 5 * 495); // non-member rate
    });
  });

  describe("Capacity validation", () => {
    it("should reject when guests exceed room capacity", async () => {
      const booking = {
        ...validBooking,
        roomCategory: "SINGLE_OCCUPANCY",
        roomCount: 1,
        guests: 3, // Single occupancy = 2 guests max per room
      };

      const request = createRequest(booking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain("accommodate up to");
    });

    it("should accept guests within capacity", async () => {
      vi.mocked(reserveHotelRoom).mockResolvedValue({
        ok: true,
        booking: {
          id: "test-booking-789",
          guestName: "John Doe",
          email: "john@example.com",
          phone: "1-868-555-1234",
          roomCategory: "DOUBLE_OCCUPANCY",
          roomCount: 2,
          checkIn: "2026-12-01",
          checkOut: "2026-12-05",
          guests: 8, // 2 rooms × 4 capacity = 8 max
          meals: [],
          specialRequests: "",
          status: "CONFIRMED",
          createdAt: "2026-10-26T12:00:00Z",
          updatedAt: "2026-10-26T12:00:00Z",
        },
      });

      const booking = {
        ...validBooking,
        roomCategory: "DOUBLE_OCCUPANCY",
        roomCount: 2,
        guests: 8,
        meals: { includeBreakfast: false, includeLunch: false, includeDinner: false },
      };

      const request = createRequest(booking);
      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it("should validate presidential suite capacity", async () => {
      const booking = {
        ...validBooking,
        roomCategory: "PRESIDENTIAL_SUITE",
        roomCount: 1,
        guests: 3, // Presidential = 2 guests max
      };

      const request = createRequest(booking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain("accommodate up to 2 guest");
    });

    it("should allow 2 guests in single occupancy", async () => {
      vi.mocked(reserveHotelRoom).mockResolvedValue({
        ok: true,
        booking: {
          id: "test-booking-single",
          guestName: "John Doe",
          email: "john@example.com",
          phone: "1-868-555-1234",
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 1,
          checkIn: "2026-12-01",
          checkOut: "2026-12-05",
          guests: 2, // Single occupancy = 2 guests max
          meals: [],
          specialRequests: "",
          status: "CONFIRMED",
          createdAt: "2026-10-26T12:00:00Z",
          updatedAt: "2026-10-26T12:00:00Z",
        },
      });

      const booking = {
        ...validBooking,
        roomCategory: "SINGLE_OCCUPANCY",
        roomCount: 1,
        guests: 2,
        meals: { includeBreakfast: false, includeLunch: false, includeDinner: false },
      };

      const request = createRequest(booking);
      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });

  describe("Input validation", () => {
    it("should reject missing required fields", async () => {
      const booking = { ...validBooking, guestName: "" };
      const request = createRequest(booking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain("required");
    });

    it("should reject invalid email", async () => {
      const booking = { ...validBooking, email: "not-an-email" };
      const request = createRequest(booking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain("valid email");
    });

    it("should reject invalid date format", async () => {
      const booking = { ...validBooking, checkIn: "01-12-2026" };
      const request = createRequest(booking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain("valid check-in");
    });

    it("should reject check-out before check-in", async () => {
      const booking = {
        ...validBooking,
        checkIn: "2026-12-10",
        checkOut: "2026-12-05",
      };
      const request = createRequest(booking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain("after check-in");
    });

    it("should reject invalid room category", async () => {
      const booking = { ...validBooking, roomCategory: "INVALID_ROOM" };
      const request = createRequest(booking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain("valid room category");
    });

    it("should reject invalid guest count", async () => {
      const booking = { ...validBooking, guests: 0 };
      const request = createRequest(booking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain("between 1 and 10");
    });
  });

  describe("Availability handling", () => {
    it("should return 409 when rooms are full", async () => {
      vi.mocked(reserveHotelRoom).mockResolvedValue({
        ok: false,
        reason: "full",
      });

      const request = createRequest(validBooking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toContain("not available");
    });

    it("should return 503 when storage is unavailable", async () => {
      vi.mocked(reserveHotelRoom).mockResolvedValue({
        ok: false,
        reason: "unavailable",
      });

      const request = createRequest(validBooking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.message).toContain("unavailable");
    });
  });

  describe("Estimate calculation", () => {
    it("should calculate estimate with all meals", async () => {
      vi.mocked(reserveHotelRoom).mockResolvedValue({
        ok: true,
        booking: {
          id: "test-booking-meals",
          guestName: "Test User",
          email: "test@example.com",
          phone: "1-868-555-0000",
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 2,
          checkIn: "2026-12-01",
          checkOut: "2026-12-04",
          guests: 2,
          meals: ["Breakfast x6", "Lunch x6", "Dinner x6"],
          specialRequests: "",
          status: "CONFIRMED",
          createdAt: "2026-10-26T12:00:00Z",
          updatedAt: "2026-10-26T12:00:00Z",
        },
      });

      const booking = {
        ...validBooking,
        roomCategory: "SINGLE_OCCUPANCY",
        roomCount: 2,
        checkIn: "2026-12-01",
        checkOut: "2026-12-04", // 3 nights
        guests: 2,
        isMember: false,
        meals: {
          includeBreakfast: true,
          includeLunch: true,
          includeDinner: true,
        },
      };

      const request = createRequest(booking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      // 2 rooms × 3 nights × 440 (non-member) + meals (2 guests × 3 nights = 6 of each)
      const expectedRooms = 2 * 3 * 440;
      const expectedMeals = 6 * 55 + 6 * 75 + 6 * 70;
      expect(data.estimatedTotal).toBe(expectedRooms + expectedMeals);
    });

    it("should calculate member vs non-member difference", async () => {
      const baseBooking = {
        ...validBooking,
        roomCategory: "DOUBLE_OCCUPANCY",
        roomCount: 1,
        checkIn: "2026-12-01",
        checkOut: "2026-12-03", // 2 nights
        guests: 2,
        meals: { includeBreakfast: false, includeLunch: false, includeDinner: false },
      };

      // Member booking
      vi.mocked(reserveHotelRoom).mockResolvedValue({
        ok: true,
        booking: {
          id: "member-booking",
          guestName: baseBooking.guestName,
          email: baseBooking.email,
          phone: baseBooking.phone,
          roomCategory: baseBooking.roomCategory as "DOUBLE_OCCUPANCY",
          roomCount: baseBooking.roomCount,
          checkIn: baseBooking.checkIn,
          checkOut: baseBooking.checkOut,
          guests: baseBooking.guests,
          meals: [],
          specialRequests: "",
          status: "CONFIRMED",
          createdAt: "2026-10-26T12:00:00Z",
          updatedAt: "2026-10-26T12:00:00Z",
        },
      });

      const memberRequest = createRequest({ ...baseBooking, isMember: true });
      const memberResponse = await POST(memberRequest);
      const memberData = await memberResponse.json();

      // Non-member booking
      vi.mocked(reserveHotelRoom).mockResolvedValue({
        ok: true,
        booking: {
          id: "non-member-booking",
          guestName: baseBooking.guestName,
          email: baseBooking.email,
          phone: baseBooking.phone,
          roomCategory: baseBooking.roomCategory as "DOUBLE_OCCUPANCY",
          roomCount: baseBooking.roomCount,
          checkIn: baseBooking.checkIn,
          checkOut: baseBooking.checkOut,
          guests: baseBooking.guests,
          meals: [],
          specialRequests: "",
          status: "CONFIRMED",
          createdAt: "2026-10-26T12:00:00Z",
          updatedAt: "2026-10-26T12:00:00Z",
        },
      });

      const nonMemberRequest = createRequest({
        ...baseBooking,
        isMember: false,
      });
      const nonMemberResponse = await POST(nonMemberRequest);
      const nonMemberData = await nonMemberResponse.json();

      expect(memberData.estimatedTotal).toBe(1 * 2 * 715); // Member rate
      expect(nonMemberData.estimatedTotal).toBe(1 * 2 * 770); // Non-member rate
      expect(nonMemberData.estimatedTotal).toBeGreaterThan(
        memberData.estimatedTotal,
      );
    });
  });
});

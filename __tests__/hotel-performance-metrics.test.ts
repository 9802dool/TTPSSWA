import { describe, it, expect } from "vitest";
import {
  calculatePeriodMetrics,
  calculateComparisonMetrics,
  calculateTrendData,
  generateCSV,
  getWeekRange,
  getMonthRange,
  getPreviousPeriod,
  getTrinidadToday,
  type HotelBooking,
} from "../lib/hotel-performance-metrics";

const createBooking = (overrides: Partial<HotelBooking> = {}): HotelBooking => ({
  id: "test-id",
  guestName: "Test Guest",
  email: "test@example.com",
  phone: "1234567890",
  roomCategory: "SINGLE_OCCUPANCY",
  roomCount: 1,
  checkIn: "2024-01-15",
  checkOut: "2024-01-17",
  guests: 2,
  meals: { Breakfast: 0, Lunch: 0, Dinner: 0 },
  specialRequests: null,
  isMember: false,
  status: "approved",
  submittedAt: "2024-01-10T00:00:00Z",
  isLegacy: false,
  ...overrides,
});

describe("hotel-performance-metrics", () => {
  describe("calculatePeriodMetrics", () => {
    it("should calculate basic metrics for a single booking", () => {
      const bookings = [
        createBooking({
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 1,
          isMember: false,
          meals: { Breakfast: 0, Lunch: 0, Dinner: 0 },
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        "2024-01-01",
        "2024-02-01"
      );

      expect(metrics.roomRevenue).toBe(440 * 1 * 2);
      expect(metrics.mealRevenue).toBe(0);
      expect(metrics.totalRevenue).toBe(880);
      expect(metrics.roomNightsBooked).toBe(2);
      expect(metrics.bookingRequestsReceived).toBe(1);
      expect(metrics.bookingRequestsConfirmed).toBe(1);
      expect(metrics.bookingRequestsCancelled).toBe(0);
    });

    it("should calculate member vs non-member revenue correctly", () => {
      const bookings = [
        createBooking({
          isMember: true,
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 1,
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
        }),
        createBooking({
          isMember: false,
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 1,
          checkIn: "2024-01-20",
          checkOut: "2024-01-22",
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        "2024-01-01",
        "2024-02-01"
      );

      expect(metrics.roomRevenue).toBe(385 * 2 + 440 * 2);
      expect(metrics.memberBookings).toBe(1);
      expect(metrics.nonMemberBookings).toBe(1);
      expect(metrics.memberSplit).toBe(50);
    });

    it("should calculate meal revenue prorated by nights in period", () => {
      const bookings = [
        createBooking({
          meals: { Breakfast: 3, Lunch: 3, Dinner: 3 },
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        "2024-01-01",
        "2024-02-01"
      );

      expect(metrics.mealRevenue).toBe((55 + 75 + 70) * 3);
    });

    it("should exclude cancelled bookings from revenue", () => {
      const bookings = [
        createBooking({
          status: "approved",
          roomCategory: "SINGLE_OCCUPANCY",
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
        }),
        createBooking({
          status: "cancelled",
          roomCategory: "SINGLE_OCCUPANCY",
          checkIn: "2024-01-20",
          checkOut: "2024-01-22",
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        "2024-01-01",
        "2024-02-01"
      );

      expect(metrics.roomRevenue).toBe(440 * 2);
      expect(metrics.bookingRequestsReceived).toBe(2);
      expect(metrics.bookingRequestsConfirmed).toBe(1);
      expect(metrics.bookingRequestsCancelled).toBe(1);
      expect(metrics.confirmationRate).toBe(50);
    });

    it("should include completed bookings in revenue", () => {
      const bookings = [
        createBooking({
          status: "completed",
          roomCategory: "SINGLE_OCCUPANCY",
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        "2024-01-01",
        "2024-02-01"
      );

      expect(metrics.roomRevenue).toBe(440 * 2);
      expect(metrics.bookingRequestsConfirmed).toBe(1);
    });

    it("should calculate occupancy rate correctly", () => {
      const bookings = [
        createBooking({
          roomCategory: "PRESIDENTIAL_SUITE",
          roomCount: 1,
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        "2024-01-15",
        "2024-01-17"
      );

      const totalRooms = 2 + 2 + 4;
      const totalAvailable = totalRooms * 2;
      expect(metrics.roomNightsBooked).toBe(2);
      expect(metrics.roomNightsAvailable).toBe(totalAvailable);
      expect(metrics.occupancyRate).toBeCloseTo((2 / totalAvailable) * 100, 1);
    });

    it("should calculate occupancy by room type", () => {
      const bookings = [
        createBooking({
          roomCategory: "PRESIDENTIAL_SUITE",
          roomCount: 1,
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
        }),
        createBooking({
          roomCategory: "DOUBLE_OCCUPANCY",
          roomCount: 2,
          checkIn: "2024-01-15",
          checkOut: "2024-01-16",
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        "2024-01-15",
        "2024-01-17"
      );

      expect(metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.booked).toBe(2);
      expect(metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.available).toBe(4);
      expect(metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.rate).toBe(50);

      expect(metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.booked).toBe(2);
      expect(metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.available).toBe(8);
      expect(metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.rate).toBe(25);

      expect(metrics.occupancyByRoomType.SINGLE_OCCUPANCY.booked).toBe(0);
      expect(metrics.occupancyByRoomType.SINGLE_OCCUPANCY.available).toBe(4);
      expect(metrics.occupancyByRoomType.SINGLE_OCCUPANCY.rate).toBe(0);
    });

    it("should calculate average length of stay", () => {
      const bookings = [
        createBooking({
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
        }),
        createBooking({
          checkIn: "2024-01-20",
          checkOut: "2024-01-24",
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        "2024-01-01",
        "2024-02-01"
      );

      expect(metrics.averageLengthOfStay).toBe((2 + 4) / 2);
    });

    it("should calculate average lead time", () => {
      const bookings = [
        createBooking({
          submittedAt: "2024-01-10T00:00:00Z",
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
        }),
        createBooking({
          submittedAt: "2024-01-15T00:00:00Z",
          checkIn: "2024-01-25",
          checkOut: "2024-01-27",
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        "2024-01-01",
        "2024-02-01"
      );

      expect(metrics.averageLeadTime).toBeCloseTo((5 + 10) / 2, 0);
    });

    it("should handle bookings spanning period boundaries", () => {
      const bookings = [
        createBooking({
          checkIn: "2024-01-30",
          checkOut: "2024-02-02",
          roomCount: 1,
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        "2024-01-01",
        "2024-02-01"
      );

      expect(metrics.roomNightsBooked).toBe(2);
    });

    it("should skip legacy bookings", () => {
      const bookings = [
        createBooking({
          isLegacy: true,
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
        }),
        createBooking({
          isLegacy: false,
          checkIn: "2024-01-20",
          checkOut: "2024-01-22",
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        "2024-01-01",
        "2024-02-01"
      );

      expect(metrics.skippedLegacyBookings).toBe(1);
      expect(metrics.bookingRequestsReceived).toBe(1);
    });
  });

  describe("calculateComparisonMetrics", () => {
    it("should calculate comparison percentages correctly", () => {
      const bookings = [
        createBooking({
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
          roomCategory: "SINGLE_OCCUPANCY",
          submittedAt: "2024-01-10T00:00:00Z",
        }),
        createBooking({
          checkIn: "2023-12-15",
          checkOut: "2023-12-17",
          roomCategory: "SINGLE_OCCUPANCY",
          submittedAt: "2023-12-10T00:00:00Z",
        }),
      ];

      const metrics = calculateComparisonMetrics(
        bookings,
        "2024-01-01",
        "2024-02-01",
        false
      );

      expect(metrics.comparison.roomRevenue).toBe(0);
      expect(metrics.comparison.totalRevenue).toBe(0);
    });

    it("should show increase when current period has more revenue", () => {
      const bookings = [
        createBooking({
          checkIn: "2024-02-15",
          checkOut: "2024-02-17",
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 2,
          submittedAt: "2024-02-10T00:00:00Z",
        }),
        createBooking({
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 1,
          submittedAt: "2024-01-10T00:00:00Z",
        }),
      ];

      const metrics = calculateComparisonMetrics(
        bookings,
        "2024-02-01",
        "2024-03-01",
        false
      );

      expect(metrics.comparison.roomRevenue).toBe(100);
    });
  });

  describe("calculateTrendData", () => {
    it("should generate trend data for 12 weeks", () => {
      const bookings = [
        createBooking({
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
        }),
      ];

      const trendData = calculateTrendData(bookings, true, 12);

      expect(trendData).toHaveLength(12);
      expect(trendData[0]).toHaveProperty("period");
      expect(trendData[0]).toHaveProperty("roomRevenue");
      expect(trendData[0]).toHaveProperty("mealRevenue");
      expect(trendData[0]).toHaveProperty("totalRevenue");
      expect(trendData[0]).toHaveProperty("occupancyRate");
      expect(trendData[0]).toHaveProperty("confirmationRate");
    });

    it("should generate trend data for 12 months", () => {
      const bookings = [
        createBooking({
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
        }),
      ];

      const trendData = calculateTrendData(bookings, false, 12);

      expect(trendData).toHaveLength(12);
    });
  });

  describe("generateCSV", () => {
    it("should generate valid CSV output", () => {
      const bookings = [
        createBooking({
          checkIn: "2024-01-15",
          checkOut: "2024-01-17",
          roomCategory: "SINGLE_OCCUPANCY",
        }),
      ];

      const metrics = calculateComparisonMetrics(
        bookings,
        "2024-01-01",
        "2024-02-01",
        false
      );

      const trendData = calculateTrendData(bookings, false, 12);
      const csv = generateCSV(metrics, trendData, "January 2024");

      expect(csv).toContain("TTPSSWA Hotel Performance Report");
      expect(csv).toContain("Period: January 2024");
      expect(csv).toContain("SUMMARY METRICS");
      expect(csv).toContain("Room Revenue (TTD)");
      expect(csv).toContain("OCCUPANCY BY ROOM TYPE");
      expect(csv).toContain("TREND DATA");
    });
  });

  describe("date range utilities", () => {
    it("should get week range correctly", () => {
      const { start, end } = getWeekRange("2024-01-15");

      const startDate = new Date(start + "T04:00:00Z");
      expect(startDate.getUTCDay()).toBe(1); // Monday
      expect(start).toBe("2024-01-15");
      expect(end).toBe("2024-01-22");
      
      const startMs = new Date(start + "T04:00:00Z").getTime();
      const endMs = new Date(end + "T04:00:00Z").getTime();
      const diffDays = (endMs - startMs) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(7);
    });

    it("should get month range correctly", () => {
      const { start, end } = getMonthRange("2024-01-15");

      expect(start.endsWith("-01")).toBe(true);
      expect(end.startsWith("2024-02-")).toBe(true);
      expect(end.endsWith("-01")).toBe(true);
    });

    it("should get previous period correctly", () => {
      const { start: prevStart, end: prevEnd } = getPreviousPeriod("2024-02-01", "2024-03-01", false);

      expect(prevStart).toBe("2024-01-01");
      expect(prevEnd).toBe("2024-02-01");
    });

    it("previous month of March is all of February", () => {
      expect(getPreviousPeriod("2024-03-01", "2024-04-01", false)).toEqual({ start: "2024-02-01", end: "2024-03-01" });
      expect(getPreviousPeriod("2024-01-01", "2024-02-01", false)).toEqual({ start: "2023-12-01", end: "2024-01-01" });
    });

    it("on a Monday the previous week is the last full Mon-Sun week", () => {
      const cur = getWeekRange("2026-11-02"); // Monday
      expect(cur.start).toBe("2026-11-02");
      expect(getPreviousPeriod(cur.start, cur.end, true)).toEqual({ start: "2026-10-26", end: "2026-11-02" });
      expect(getWeekRange("2026-11-01").start).toBe("2026-10-26"); // Sunday belongs to the week before
    });
  });
});

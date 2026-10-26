import { describe, it, expect } from "vitest";
import {
  calculatePeriodMetrics,
  calculateComparisonMetrics,
  calculateTrendData,
  generateCSV,
  getWeekRange,
  getMonthRange,
  getPreviousPeriod,
  type HotelBooking,
} from "../lib/hotel-performance-metrics";

const createBooking = (overrides: Partial<HotelBooking> = {}): HotelBooking => ({
  id: "test-id",
  guestName: "Test Guest",
  serviceNumber: null,
  email: "test@example.com",
  phone: "1234567890",
  roomCategory: "SINGLE_OCCUPANCY",
  roomCount: 1,
  checkIn: new Date("2024-01-15T00:00:00Z"),
  checkOut: new Date("2024-01-17T00:00:00Z"),
  guests: 2,
  meals: [],
  specialRequests: null,
  status: "CONFIRMED",
  createdAt: new Date("2024-01-10T00:00:00Z"),
  updatedAt: new Date("2024-01-10T00:00:00Z"),
  ...overrides,
});

describe("hotel-performance-metrics", () => {
  describe("calculatePeriodMetrics", () => {
    it("should calculate basic metrics for a single booking", () => {
      const bookings = [
        createBooking({
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 1,
          serviceNumber: null,
          meals: [],
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        new Date("2024-01-01"),
        new Date("2024-02-01")
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
          serviceNumber: "12345",
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 1,
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
        }),
        createBooking({
          serviceNumber: null,
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 1,
          checkIn: new Date("2024-01-20"),
          checkOut: new Date("2024-01-22"),
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        new Date("2024-01-01"),
        new Date("2024-02-01")
      );

      expect(metrics.roomRevenue).toBe(385 * 2 + 440 * 2);
      expect(metrics.memberBookings).toBe(1);
      expect(metrics.nonMemberBookings).toBe(1);
      expect(metrics.memberSplit).toBe(50);
    });

    it("should calculate meal revenue", () => {
      const bookings = [
        createBooking({
          meals: ["Breakfast", "Lunch", "Dinner"],
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        new Date("2024-01-01"),
        new Date("2024-02-01")
      );

      expect(metrics.mealRevenue).toBe(55 + 75 + 70);
    });

    it("should exclude cancelled bookings from revenue", () => {
      const bookings = [
        createBooking({
          status: "CONFIRMED",
          roomCategory: "SINGLE_OCCUPANCY",
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
        }),
        createBooking({
          status: "CANCELLED",
          roomCategory: "SINGLE_OCCUPANCY",
          checkIn: new Date("2024-01-20"),
          checkOut: new Date("2024-01-22"),
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        new Date("2024-01-01"),
        new Date("2024-02-01")
      );

      expect(metrics.roomRevenue).toBe(440 * 2);
      expect(metrics.bookingRequestsReceived).toBe(2);
      expect(metrics.bookingRequestsConfirmed).toBe(1);
      expect(metrics.bookingRequestsCancelled).toBe(1);
      expect(metrics.confirmationRate).toBe(50);
    });

    it("should include checked out bookings in revenue", () => {
      const bookings = [
        createBooking({
          status: "CHECKED_OUT",
          roomCategory: "SINGLE_OCCUPANCY",
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        new Date("2024-01-01"),
        new Date("2024-02-01")
      );

      expect(metrics.roomRevenue).toBe(440 * 2);
      expect(metrics.bookingRequestsConfirmed).toBe(1);
    });

    it("should calculate occupancy rate correctly", () => {
      const bookings = [
        createBooking({
          roomCategory: "PRESIDENTIAL_SUITE",
          roomCount: 1,
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        new Date("2024-01-15"),
        new Date("2024-01-17")
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
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
        }),
        createBooking({
          roomCategory: "DOUBLE_OCCUPANCY",
          roomCount: 2,
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-16"),
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        new Date("2024-01-15"),
        new Date("2024-01-17")
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
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
        }),
        createBooking({
          checkIn: new Date("2024-01-20"),
          checkOut: new Date("2024-01-24"),
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        new Date("2024-01-01"),
        new Date("2024-02-01")
      );

      expect(metrics.averageLengthOfStay).toBe((2 + 4) / 2);
    });

    it("should calculate average lead time", () => {
      const bookings = [
        createBooking({
          createdAt: new Date("2024-01-10"),
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
        }),
        createBooking({
          createdAt: new Date("2024-01-15"),
          checkIn: new Date("2024-01-25"),
          checkOut: new Date("2024-01-27"),
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        new Date("2024-01-01"),
        new Date("2024-02-01")
      );

      expect(metrics.averageLeadTime).toBe((5 + 10) / 2);
    });

    it("should handle bookings spanning period boundaries", () => {
      const bookings = [
        createBooking({
          checkIn: new Date("2024-01-30"),
          checkOut: new Date("2024-02-02"),
          roomCount: 1,
        }),
      ];

      const metrics = calculatePeriodMetrics(
        bookings,
        new Date("2024-01-01"),
        new Date("2024-02-01")
      );

      expect(metrics.roomNightsBooked).toBe(2);
    });
  });

  describe("calculateComparisonMetrics", () => {
    it("should calculate comparison percentages correctly", () => {
      const bookings = [
        createBooking({
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
          roomCategory: "SINGLE_OCCUPANCY",
          createdAt: new Date("2024-01-10"),
        }),
        createBooking({
          checkIn: new Date("2023-12-15"),
          checkOut: new Date("2023-12-17"),
          roomCategory: "SINGLE_OCCUPANCY",
          createdAt: new Date("2023-12-10"),
        }),
      ];

      const metrics = calculateComparisonMetrics(
        bookings,
        new Date("2024-01-01"),
        new Date("2024-02-01"),
        false
      );

      expect(metrics.comparison.roomRevenue).toBe(0);
      expect(metrics.comparison.totalRevenue).toBe(0);
    });

    it("should show increase when current period has more revenue", () => {
      const bookings = [
        createBooking({
          checkIn: new Date("2024-02-15"),
          checkOut: new Date("2024-02-17"),
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 2,
          createdAt: new Date("2024-02-10"),
        }),
        createBooking({
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
          roomCategory: "SINGLE_OCCUPANCY",
          roomCount: 1,
          createdAt: new Date("2024-01-10"),
        }),
      ];

      const metrics = calculateComparisonMetrics(
        bookings,
        new Date("2024-02-01"),
        new Date("2024-03-01"),
        false
      );

      expect(metrics.comparison.roomRevenue).toBe(100);
    });
  });

  describe("calculateTrendData", () => {
    it("should generate trend data for 12 weeks", () => {
      const bookings = [
        createBooking({
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
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
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
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
          checkIn: new Date("2024-01-15"),
          checkOut: new Date("2024-01-17"),
          roomCategory: "SINGLE_OCCUPANCY",
        }),
      ];

      const metrics = calculateComparisonMetrics(
        bookings,
        new Date("2024-01-01"),
        new Date("2024-02-01"),
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
      const date = new Date("2024-01-15");
      const { start, end } = getWeekRange(date);

      expect(start.getDay()).toBe(0);
      const diffMs = end.getTime() - start.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(7);
    });

    it("should get month range correctly", () => {
      const date = new Date("2024-01-15");
      const { start, end } = getMonthRange(date);

      expect(start.getDate()).toBe(1);
      expect(start.getMonth()).toBe(0);
      expect(end.getDate()).toBe(1);
      expect(end.getMonth()).toBe(1);
    });

    it("should get previous period correctly", () => {
      const start = new Date("2024-02-01");
      const end = new Date("2024-03-01");
      const { start: prevStart, end: prevEnd } = getPreviousPeriod(start, end, false);

      expect(prevStart.getMonth()).toBe(0);
      expect(prevEnd.getMonth()).toBe(1);
      expect(prevEnd.getDate()).toBe(1);
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  HOTEL_RATES,
  MEAL_PRICES,
  ROOM_CAPACITIES,
  calculateRoomTotal,
  calculateMealsTotal,
  calculateBookingTotal,
  calculateNights,
  getTrinidadLocalDate,
  formatTTD,
} from "../lib/hotel-pricing";

describe("Hotel Pricing", () => {
  describe("calculateRoomTotal", () => {
    it("should calculate member rates correctly", () => {
      expect(calculateRoomTotal("PRESIDENTIAL_SUITE", 1, 3, true)).toBe(
        440 * 1 * 3,
      );
      expect(calculateRoomTotal("SINGLE_OCCUPANCY", 2, 5, true)).toBe(
        385 * 2 * 5,
      );
      expect(calculateRoomTotal("DOUBLE_OCCUPANCY", 1, 2, true)).toBe(
        715 * 1 * 2,
      );
    });

    it("should calculate non-member rates correctly", () => {
      expect(calculateRoomTotal("PRESIDENTIAL_SUITE", 1, 3, false)).toBe(
        495 * 1 * 3,
      );
      expect(calculateRoomTotal("SINGLE_OCCUPANCY", 2, 5, false)).toBe(
        440 * 2 * 5,
      );
      expect(calculateRoomTotal("DOUBLE_OCCUPANCY", 1, 2, false)).toBe(
        770 * 1 * 2,
      );
    });

    it("should handle multiple rooms and nights", () => {
      expect(calculateRoomTotal("DOUBLE_OCCUPANCY", 4, 7, true)).toBe(
        715 * 4 * 7,
      );
      expect(calculateRoomTotal("PRESIDENTIAL_SUITE", 2, 10, false)).toBe(
        495 * 2 * 10,
      );
    });
  });

  describe("calculateMealsTotal", () => {
    it("should calculate meal costs correctly", () => {
      expect(
        calculateMealsTotal({ Breakfast: 4, Lunch: 0, Dinner: 2 }),
      ).toBe(55 * 4 + 70 * 2);

      expect(
        calculateMealsTotal({ Breakfast: 10, Lunch: 10, Dinner: 10 }),
      ).toBe(55 * 10 + 75 * 10 + 70 * 10);

      expect(
        calculateMealsTotal({ Breakfast: 0, Lunch: 0, Dinner: 0 }),
      ).toBe(0);
    });

    it("should handle single meal selections", () => {
      expect(
        calculateMealsTotal({ Breakfast: 2, Lunch: 0, Dinner: 0 }),
      ).toBe(55 * 2);
      expect(
        calculateMealsTotal({ Breakfast: 0, Lunch: 3, Dinner: 0 }),
      ).toBe(75 * 3);
      expect(
        calculateMealsTotal({ Breakfast: 0, Lunch: 0, Dinner: 5 }),
      ).toBe(70 * 5);
    });
  });

  describe("calculateBookingTotal", () => {
    it("should calculate complete booking totals for members", () => {
      const result = calculateBookingTotal({
        roomCategory: "DOUBLE_OCCUPANCY",
        roomCount: 2,
        nights: 3,
        isMember: true,
        meals: { Breakfast: 6, Lunch: 6, Dinner: 6 },
      });

      expect(result.roomsSubtotal).toBe(715 * 2 * 3);
      expect(result.mealsSubtotal).toBe((55 + 75 + 70) * 6);
      expect(result.total).toBe(715 * 2 * 3 + (55 + 75 + 70) * 6);
    });

    it("should calculate complete booking totals for non-members", () => {
      const result = calculateBookingTotal({
        roomCategory: "PRESIDENTIAL_SUITE",
        roomCount: 1,
        nights: 5,
        isMember: false,
        meals: { Breakfast: 10, Lunch: 0, Dinner: 5 },
      });

      expect(result.roomsSubtotal).toBe(495 * 1 * 5);
      expect(result.mealsSubtotal).toBe(55 * 10 + 70 * 5);
      expect(result.total).toBe(495 * 1 * 5 + 55 * 10 + 70 * 5);
    });

    it("should handle bookings without meals", () => {
      const result = calculateBookingTotal({
        roomCategory: "SINGLE_OCCUPANCY",
        roomCount: 2,
        nights: 2,
        isMember: true,
        meals: { Breakfast: 0, Lunch: 0, Dinner: 0 },
      });

      expect(result.roomsSubtotal).toBe(385 * 2 * 2);
      expect(result.mealsSubtotal).toBe(0);
      expect(result.total).toBe(385 * 2 * 2);
    });
  });

  describe("calculateNights", () => {
    it("should calculate nights correctly", () => {
      expect(calculateNights("2026-01-01", "2026-01-02")).toBe(1);
      expect(calculateNights("2026-01-01", "2026-01-08")).toBe(7);
      expect(calculateNights("2026-03-15", "2026-03-20")).toBe(5);
    });

    it("should handle month boundaries", () => {
      expect(calculateNights("2026-01-30", "2026-02-03")).toBe(4);
      expect(calculateNights("2026-02-28", "2026-03-05")).toBe(5);
    });

    it("should return 0 for same dates", () => {
      expect(calculateNights("2026-01-01", "2026-01-01")).toBe(0);
    });

    it("should return 0 for empty dates", () => {
      expect(calculateNights("", "")).toBe(0);
      expect(calculateNights("2026-01-01", "")).toBe(0);
      expect(calculateNights("", "2026-01-01")).toBe(0);
    });
  });

  describe("getTrinidadLocalDate", () => {
    it("should return a date in YYYY-MM-DD format", () => {
      const date = getTrinidadLocalDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should return a valid date", () => {
      const date = getTrinidadLocalDate();
      const parsed = new Date(date);
      expect(parsed.toString()).not.toBe("Invalid Date");
    });
  });

  describe("formatTTD", () => {
    it("should format TTD amounts correctly", () => {
      expect(formatTTD(440)).toBe("$440");
      expect(formatTTD(1500)).toBe("$1,500");
      expect(formatTTD(10000)).toBe("$10,000");
    });

    it("should handle zero and small amounts", () => {
      expect(formatTTD(0)).toBe("$0");
      expect(formatTTD(55)).toBe("$55");
    });
  });

  describe("Pricing Configuration", () => {
    it("should have correct member rates", () => {
      expect(HOTEL_RATES.member.PRESIDENTIAL_SUITE).toBe(440);
      expect(HOTEL_RATES.member.SINGLE_OCCUPANCY).toBe(385);
      expect(HOTEL_RATES.member.DOUBLE_OCCUPANCY).toBe(715);
    });

    it("should have correct non-member rates", () => {
      expect(HOTEL_RATES.nonMember.PRESIDENTIAL_SUITE).toBe(495);
      expect(HOTEL_RATES.nonMember.SINGLE_OCCUPANCY).toBe(440);
      expect(HOTEL_RATES.nonMember.DOUBLE_OCCUPANCY).toBe(770);
    });

    it("should have correct meal prices", () => {
      expect(MEAL_PRICES.Breakfast).toBe(55);
      expect(MEAL_PRICES.Lunch).toBe(75);
      expect(MEAL_PRICES.Dinner).toBe(70);
    });

    it("should have correct room capacities", () => {
      expect(ROOM_CAPACITIES.PRESIDENTIAL_SUITE).toBe(2);
      expect(ROOM_CAPACITIES.SINGLE_OCCUPANCY).toBe(1);
      expect(ROOM_CAPACITIES.DOUBLE_OCCUPANCY).toBe(2);
    });
  });
});

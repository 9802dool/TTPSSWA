/**
 * Multi-room booking tests
 * Tests for multi-room hotel bookings with per-guest meal selections
 */

/// <reference types="vitest/globals" />

import {
  calculateMultiRoomBookingTotal,
  calculateMealsFromGuestSelections,
  aggregateMealCounts,
  calculateTotalCapacity,
  formatRoomCategory,
  MEAL_PRICES,
  type RoomCategory,
  type GuestMealSelection,
} from "@/lib/hotel-pricing";


describe("Multi-room pricing", () => {
  const nights = 3;

  test("calculates pricing for multiple room types", () => {
    const rooms = [
      { roomCategory: "PRESIDENTIAL_SUITE" as RoomCategory, roomCount: 1 },
      { roomCategory: "DOUBLE_OCCUPANCY" as RoomCategory, roomCount: 2 },
    ];

    const result = calculateMultiRoomBookingTotal({
      rooms,
      nights,
      isMember: false,
    });

    expect(result.roomLineItems).toHaveLength(2);
    expect(result.roomLineItems[0].roomCategory).toBe("PRESIDENTIAL_SUITE");
    expect(result.roomLineItems[0].roomCount).toBe(1);
    expect(result.roomLineItems[0].subtotal).toBe(495 * 1 * 3); // Non-member rate

    expect(result.roomLineItems[1].roomCategory).toBe("DOUBLE_OCCUPANCY");
    expect(result.roomLineItems[1].roomCount).toBe(2);
    expect(result.roomLineItems[1].subtotal).toBe(770 * 2 * 3);

    expect(result.roomsSubtotal).toBe(495 * 3 + 770 * 2 * 3);
    expect(result.total).toBe(result.roomsSubtotal);
  });

  test("calculates member rates correctly", () => {
    const rooms = [
      { roomCategory: "PRESIDENTIAL_SUITE" as RoomCategory, roomCount: 1 },
    ];

    const result = calculateMultiRoomBookingTotal({
      rooms,
      nights,
      isMember: true,
    });

    expect(result.roomLineItems[0].subtotal).toBe(440 * 1 * 3); // Member rate
  });

  test("calculates total capacity for multiple rooms", () => {
    const rooms = [
      { roomCategory: "PRESIDENTIAL_SUITE" as RoomCategory, roomCount: 1 }, // 2 capacity
      { roomCategory: "SINGLE_OCCUPANCY" as RoomCategory, roomCount: 1 }, // 2 capacity
      { roomCategory: "DOUBLE_OCCUPANCY" as RoomCategory, roomCount: 1 }, // 4 capacity
    ];

    const capacity = calculateTotalCapacity(rooms);
    expect(capacity).toBe(8);
  });
});

describe("Per-guest meal selections", () => {
  const nights = 2;

  test("calculates meals from per-guest selections", () => {
    const selections: GuestMealSelection[] = [
      { guestIndex: 0, breakfast: true, lunch: true, dinner: false },
      { guestIndex: 1, breakfast: true, lunch: false, dinner: true },
      { guestIndex: 2, breakfast: false, lunch: false, dinner: false },
    ];

    const breakdown = calculateMealsFromGuestSelections(selections, nights);

    expect(breakdown.breakfast.guestCount).toBe(2);
    expect(breakdown.breakfast.totalMeals).toBe(4); // 2 guests × 2 nights
    expect(breakdown.breakfast.subtotal).toBe(4 * MEAL_PRICES.Breakfast);

    expect(breakdown.lunch.guestCount).toBe(1);
    expect(breakdown.lunch.totalMeals).toBe(2); // 1 guest × 2 nights
    expect(breakdown.lunch.subtotal).toBe(2 * MEAL_PRICES.Lunch);

    expect(breakdown.dinner.guestCount).toBe(1);
    expect(breakdown.dinner.totalMeals).toBe(2);
    expect(breakdown.dinner.subtotal).toBe(2 * MEAL_PRICES.Dinner);

    expect(breakdown.total).toBe(
      4 * MEAL_PRICES.Breakfast + 2 * MEAL_PRICES.Lunch + 2 * MEAL_PRICES.Dinner
    );
  });

  test("handles no meal selections", () => {
    const selections: GuestMealSelection[] = [
      { guestIndex: 0, breakfast: false, lunch: false, dinner: false },
    ];

    const breakdown = calculateMealsFromGuestSelections(selections, nights);

    expect(breakdown.breakfast.guestCount).toBe(0);
    expect(breakdown.lunch.guestCount).toBe(0);
    expect(breakdown.dinner.guestCount).toBe(0);
    expect(breakdown.total).toBe(0);
  });

  test("aggregates meal counts from per-guest selections", () => {
    const selections: GuestMealSelection[] = [
      { guestIndex: 0, breakfast: true, lunch: true, dinner: true },
      { guestIndex: 1, breakfast: true, lunch: false, dinner: true },
    ];

    const aggregated = aggregateMealCounts(selections, 3);

    expect(aggregated.Breakfast).toBe(6); // 2 guests × 3 nights
    expect(aggregated.Lunch).toBe(3); // 1 guest × 3 nights
    expect(aggregated.Dinner).toBe(6); // 2 guests × 3 nights
  });
});

describe("Multi-room booking with meals", () => {
  const nights = 2;

  test("calculates complete booking with rooms and per-guest meals", () => {
    const rooms = [
      { roomCategory: "PRESIDENTIAL_SUITE" as RoomCategory, roomCount: 1 },
      { roomCategory: "DOUBLE_OCCUPANCY" as RoomCategory, roomCount: 1 },
    ];

    const guestMealSelections: GuestMealSelection[] = [
      { guestIndex: 0, breakfast: true, lunch: true, dinner: true },
      { guestIndex: 1, breakfast: true, lunch: true, dinner: true },
      { guestIndex: 2, breakfast: true, lunch: false, dinner: false },
    ];

    const result = calculateMultiRoomBookingTotal({
      rooms,
      nights,
      isMember: false,
      guestMealSelections,
    });

    expect(result.roomLineItems).toHaveLength(2);
    expect(result.mealBreakdown).toBeDefined();
    expect(result.mealBreakdown?.breakfast.guestCount).toBe(3);
    expect(result.mealBreakdown?.lunch.guestCount).toBe(2);
    expect(result.mealBreakdown?.dinner.guestCount).toBe(2);

    const expectedRoomTotal = 495 * nights + 770 * nights;
    const expectedMealTotal =
      3 * nights * MEAL_PRICES.Breakfast +
      2 * nights * MEAL_PRICES.Lunch +
      2 * nights * MEAL_PRICES.Dinner;

    expect(result.roomsSubtotal).toBe(expectedRoomTotal);
    expect(result.mealsSubtotal).toBe(expectedMealTotal);
    expect(result.total).toBe(expectedRoomTotal + expectedMealTotal);
  });

  test("handles legacy aggregate meal counts", () => {
    const rooms = [
      { roomCategory: "DOUBLE_OCCUPANCY" as RoomCategory, roomCount: 1 },
    ];

    const result = calculateMultiRoomBookingTotal({
      rooms,
      nights,
      isMember: false,
      meals: {
        Breakfast: 10,
        Lunch: 5,
        Dinner: 8,
      },
    });

    const expectedMealTotal =
      10 * MEAL_PRICES.Breakfast +
      5 * MEAL_PRICES.Lunch +
      8 * MEAL_PRICES.Dinner;

    expect(result.mealsSubtotal).toBe(expectedMealTotal);
    expect(result.mealBreakdown).toBeUndefined(); // Legacy format doesn't have breakdown
  });
});

describe("Room category formatting", () => {
  test("formats room categories correctly", () => {
    expect(formatRoomCategory("PRESIDENTIAL_SUITE")).toBe("Presidential Suite");
    expect(formatRoomCategory("SINGLE_OCCUPANCY")).toBe("Single Occupancy");
    expect(formatRoomCategory("DOUBLE_OCCUPANCY")).toBe("Double Occupancy");
  });
});

describe("Backward compatibility", () => {
  test("handles legacy single-room format", () => {
    const rooms = [
      { roomCategory: "DOUBLE_OCCUPANCY" as RoomCategory, roomCount: 1 },
    ];

    const result = calculateMultiRoomBookingTotal({
      rooms,
      nights: 2,
      isMember: false,
      meals: {
        Breakfast: 4,
        Lunch: 0,
        Dinner: 0,
      },
    });

    expect(result.roomLineItems).toHaveLength(1);
    expect(result.total).toBeGreaterThan(0);
  });

  test("handles booking with no meals", () => {
    const rooms = [
      { roomCategory: "SINGLE_OCCUPANCY" as RoomCategory, roomCount: 1 },
    ];

    const result = calculateMultiRoomBookingTotal({
      rooms,
      nights: 1,
      isMember: false,
    });

    expect(result.mealsSubtotal).toBe(0);
    expect(result.total).toBe(result.roomsSubtotal);
  });
});

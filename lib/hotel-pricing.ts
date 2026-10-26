/**
 * Noel Chase Hotel & Conference Centre - Tobago
 * Room rates and meal pricing configuration
 */

export const HOTEL_RATES = {
  member: {
    PRESIDENTIAL_SUITE: 440,
    SINGLE_OCCUPANCY: 385,
    DOUBLE_OCCUPANCY: 715,
  },
  nonMember: {
    PRESIDENTIAL_SUITE: 495,
    SINGLE_OCCUPANCY: 440,
    DOUBLE_OCCUPANCY: 770,
  },
} as const;

export const MEAL_PRICES = {
  Breakfast: 55,
  Lunch: 75,
  Dinner: 70,
} as const;

export type RoomCategory = keyof typeof HOTEL_RATES.member;
export type MealType = keyof typeof MEAL_PRICES;

/**
 * Room capacities (maximum guests per room type)
 */
export const ROOM_CAPACITIES = {
  PRESIDENTIAL_SUITE: 2,
  SINGLE_OCCUPANCY: 2,
  DOUBLE_OCCUPANCY: 4,
} as const;

/**
 * Check-in and check-out times
 */
export const CHECK_IN_TIME = "3:00 PM";
export const CHECK_OUT_TIME = "12:00 PM";

/**
 * Hotel contact information
 */
export const HOTEL_CONTACT = {
  phone: "1 (868) 235-5260",
  whatsapp: "1 (868) 792-6226",
} as const;

/**
 * Calculate room total for given number of nights
 */
export function calculateRoomTotal(
  roomCategory: RoomCategory,
  roomCount: number,
  nights: number,
  isMember: boolean,
): number {
  const rateType = isMember ? HOTEL_RATES.member : HOTEL_RATES.nonMember;
  const rate = rateType[roomCategory];
  return rate * roomCount * nights;
}

/**
 * Calculate meals total
 */
export function calculateMealsTotal(meals: {
  Breakfast: number;
  Lunch: number;
  Dinner: number;
}): number {
  return (
    meals.Breakfast * MEAL_PRICES.Breakfast +
    meals.Lunch * MEAL_PRICES.Lunch +
    meals.Dinner * MEAL_PRICES.Dinner
  );
}

/**
 * Calculate total booking estimate
 */
export function calculateBookingTotal(params: {
  roomCategory: RoomCategory;
  roomCount: number;
  nights: number;
  isMember: boolean;
  meals: {
    Breakfast: number;
    Lunch: number;
    Dinner: number;
  };
}): {
  roomsSubtotal: number;
  mealsSubtotal: number;
  total: number;
} {
  const roomsSubtotal = calculateRoomTotal(
    params.roomCategory,
    params.roomCount,
    params.nights,
    params.isMember,
  );
  const mealsSubtotal = calculateMealsTotal(params.meals);
  const total = roomsSubtotal + mealsSubtotal;

  return {
    roomsSubtotal,
    mealsSubtotal,
    total,
  };
}

/**
 * Calculate number of nights between two dates (check-out is exclusive)
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Get today's date in Trinidad local time (America/Port_of_Spain)
 * Returns YYYY-MM-DD format
 */
export function getTrinidadLocalDate(): string {
  const now = new Date();
  // Convert to Trinidad time (UTC-4, no DST)
  const trinidadTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Port_of_Spain" })
  );
  
  const year = trinidadTime.getFullYear();
  const month = String(trinidadTime.getMonth() + 1).padStart(2, "0");
  const day = String(trinidadTime.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

/**
 * Format currency in TTD
 */
export function formatTTD(amount: number): string {
  return `$${amount.toLocaleString("en-TT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

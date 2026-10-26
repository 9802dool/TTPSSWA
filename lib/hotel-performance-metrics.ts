/**
 * Hotel Performance Metrics
 * Pure calculation functions for executive reporting
 * All dates in America/Port_of_Spain timezone (UTC-4, no DST)
 * Data source: Supabase public.applications where application_type='hotel_booking'
 */

import { HOTEL_RATES, MEAL_PRICES, calculateNights } from "./hotel-pricing";

export type ApplicationStatus = "submitted" | "under_review" | "approved" | "rejected" | "completed" | "cancelled";
export type RoomCategory = "PRESIDENTIAL_SUITE" | "SINGLE_OCCUPANCY" | "DOUBLE_OCCUPANCY";

export interface HotelBooking {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  roomCategory: RoomCategory | null;
  roomCount: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  meals: { Breakfast: number; Lunch: number; Dinner: number };
  specialRequests: string | null;
  isMember: boolean;
  status: ApplicationStatus;
  submittedAt: string;
  isLegacy: boolean;
}

export interface PeriodMetrics {
  roomRevenue: number;
  mealRevenue: number;
  totalRevenue: number;
  occupancyRate: number;
  roomNightsBooked: number;
  roomNightsAvailable: number;
  occupancyByRoomType: {
    PRESIDENTIAL_SUITE: { booked: number; available: number; rate: number };
    SINGLE_OCCUPANCY: { booked: number; available: number; rate: number };
    DOUBLE_OCCUPANCY: { booked: number; available: number; rate: number };
  };
  bookingRequestsReceived: number;
  bookingRequestsConfirmed: number;
  bookingRequestsCancelled: number;
  confirmationRate: number;
  memberBookings: number;
  nonMemberBookings: number;
  memberSplit: number;
  averageLengthOfStay: number;
  averageLeadTime: number;
  skippedLegacyBookings: number;
}

export interface ComparisonMetrics extends PeriodMetrics {
  comparison: {
    roomRevenue: number;
    mealRevenue: number;
    totalRevenue: number;
    occupancyRate: number;
    confirmationRate: number;
    memberSplit: number;
    averageLengthOfStay: number;
    averageLeadTime: number;
  };
}

export interface TrendDataPoint {
  period: string;
  roomRevenue: number;
  mealRevenue: number;
  totalRevenue: number;
  occupancyRate: number;
  confirmationRate: number;
}

const ROOM_INVENTORY = {
  PRESIDENTIAL_SUITE: 2,
  SINGLE_OCCUPANCY: 2,
  DOUBLE_OCCUPANCY: 4,
} as const;

/**
 * Trinidad is UTC-4 all year (no DST).
 * Returns YYYY-MM-DD in Trinidad time for a UTC Date.
 */
function toTrinidadDateString(utcDate: Date): string {
  const MS_OFFSET = 4 * 60 * 60 * 1000;
  const trinidadMs = utcDate.getTime() - MS_OFFSET;
  const trinidadDate = new Date(trinidadMs);
  return trinidadDate.toISOString().split("T")[0];
}

/**
 * Parse YYYY-MM-DD string to Trinidad midnight as UTC instant.
 * Trinidad midnight = 04:00 UTC
 */
function trinidadDateToUTC(yyyymmdd: string): Date {
  const MS_OFFSET = 4 * 60 * 60 * 1000;
  const parts = yyyymmdd.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const localMidnight = Date.UTC(year, month, day, 0, 0, 0, 0);
  return new Date(localMidnight + MS_OFFSET);
}

export function getTrinidadToday(): string {
  return toTrinidadDateString(new Date());
}

export function getWeekRange(yyyymmdd: string): { start: string; end: string } {
  const date = trinidadDateToUTC(yyyymmdd);
  const dayOfWeek = date.getUTCDay();
  const daysToSunday = dayOfWeek === 0 ? 0 : dayOfWeek;
  const sunday = new Date(date.getTime() - daysToSunday * 86400000);
  const nextSunday = new Date(sunday.getTime() + 7 * 86400000);
  return {
    start: toTrinidadDateString(sunday),
    end: toTrinidadDateString(nextSunday),
  };
}

export function getMonthRange(yyyymmdd: string): { start: string; end: string } {
  const date = trinidadDateToUTC(yyyymmdd);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1, 4, 0, 0));
  const nextMonth = new Date(Date.UTC(year, month + 1, 1, 4, 0, 0));
  return {
    start: toTrinidadDateString(firstDay),
    end: toTrinidadDateString(nextMonth),
  };
}

export function getPreviousPeriod(
  start: string,
  end: string,
  isWeekly: boolean
): { start: string; end: string } {
  const startDate = trinidadDateToUTC(start);
  const endDate = trinidadDateToUTC(end);
  const duration = endDate.getTime() - startDate.getTime();
  const prevEnd = startDate;
  const prevStart = new Date(startDate.getTime() - duration);
  return {
    start: toTrinidadDateString(prevStart),
    end: toTrinidadDateString(prevEnd),
  };
}

function isInPeriod(dateYYYYMMDD: string, start: string, end: string): boolean {
  return dateYYYYMMDD >= start && dateYYYYMMDD < end;
}

function isConfirmedOrCompleted(status: ApplicationStatus): boolean {
  return status === "approved" || status === "completed";
}

function calculateRoomRevenue(
  booking: HotelBooking,
  nights: number
): number {
  const rates = booking.isMember ? HOTEL_RATES.member : HOTEL_RATES.nonMember;
  if (!booking.roomCategory) return 0;
  const rate = rates[booking.roomCategory];
  return rate * booking.roomCount * nights;
}

function calculateMealRevenue(booking: HotelBooking, nightsInPeriod: number, totalNights: number): number {
  if (totalNights === 0) return 0;
  const prorateRatio = nightsInPeriod / totalNights;
  
  let total = 0;
  total += booking.meals.Breakfast * MEAL_PRICES.Breakfast;
  total += booking.meals.Lunch * MEAL_PRICES.Lunch;
  total += booking.meals.Dinner * MEAL_PRICES.Dinner;
  
  return total * prorateRatio;
}

function countRoomNights(
  bookings: HotelBooking[],
  start: string,
  end: string,
  roomCategory?: RoomCategory
): number {
  let total = 0;
  for (const booking of bookings) {
    if (roomCategory && booking.roomCategory !== roomCategory) continue;
    if (!isConfirmedOrCompleted(booking.status)) continue;
    if (!booking.roomCategory) continue;
    
    const checkIn = booking.checkIn >= start ? booking.checkIn : start;
    const checkOut = booking.checkOut <= end ? booking.checkOut : end;
    
    if (checkIn < checkOut) {
      const nights = calculateNights(checkIn, checkOut);
      total += nights * booking.roomCount;
    }
  }
  return total;
}

function calculateAvailableRoomNights(
  start: string,
  end: string,
  roomCategory?: RoomCategory
): number {
  const days = calculateNights(start, end);
  
  if (roomCategory) {
    return days * ROOM_INVENTORY[roomCategory];
  }
  
  return days * (
    ROOM_INVENTORY.PRESIDENTIAL_SUITE +
    ROOM_INVENTORY.SINGLE_OCCUPANCY +
    ROOM_INVENTORY.DOUBLE_OCCUPANCY
  );
}

export function calculatePeriodMetrics(
  bookings: HotelBooking[],
  periodStart: string,
  periodEnd: string
): PeriodMetrics {
  const periodBookings = bookings.filter(
    (b) => {
      const checkInInPeriod = isInPeriod(b.checkIn, periodStart, periodEnd);
      const spansIntoPeriod = b.checkIn < periodStart && b.checkOut > periodStart;
      return checkInInPeriod || spansIntoPeriod;
    }
  );

  const confirmedOrCompleted = periodBookings.filter((b) => isConfirmedOrCompleted(b.status) && !b.isLegacy);

  let roomRevenue = 0;
  let mealRevenue = 0;

  for (const booking of confirmedOrCompleted) {
    const checkIn = booking.checkIn >= periodStart ? booking.checkIn : periodStart;
    const checkOut = booking.checkOut <= periodEnd ? booking.checkOut : periodEnd;
    
    if (checkIn < checkOut) {
      const nightsInPeriod = calculateNights(checkIn, checkOut);
      const totalNights = calculateNights(booking.checkIn, booking.checkOut);
      
      roomRevenue += calculateRoomRevenue(booking, nightsInPeriod);
      mealRevenue += calculateMealRevenue(booking, nightsInPeriod, totalNights);
    }
  }

  const roomNightsBooked = countRoomNights(periodBookings, periodStart, periodEnd);
  const roomNightsAvailable = calculateAvailableRoomNights(periodStart, periodEnd);
  const occupancyRate = roomNightsAvailable > 0
    ? (roomNightsBooked / roomNightsAvailable) * 100
    : 0;

  const occupancyByRoomType = {
    PRESIDENTIAL_SUITE: {
      booked: countRoomNights(periodBookings, periodStart, periodEnd, "PRESIDENTIAL_SUITE"),
      available: calculateAvailableRoomNights(periodStart, periodEnd, "PRESIDENTIAL_SUITE"),
      rate: 0,
    },
    SINGLE_OCCUPANCY: {
      booked: countRoomNights(periodBookings, periodStart, periodEnd, "SINGLE_OCCUPANCY"),
      available: calculateAvailableRoomNights(periodStart, periodEnd, "SINGLE_OCCUPANCY"),
      rate: 0,
    },
    DOUBLE_OCCUPANCY: {
      booked: countRoomNights(periodBookings, periodStart, periodEnd, "DOUBLE_OCCUPANCY"),
      available: calculateAvailableRoomNights(periodStart, periodEnd, "DOUBLE_OCCUPANCY"),
      rate: 0,
    },
  };

  occupancyByRoomType.PRESIDENTIAL_SUITE.rate = occupancyByRoomType.PRESIDENTIAL_SUITE.available > 0
    ? (occupancyByRoomType.PRESIDENTIAL_SUITE.booked / occupancyByRoomType.PRESIDENTIAL_SUITE.available) * 100
    : 0;
  occupancyByRoomType.SINGLE_OCCUPANCY.rate = occupancyByRoomType.SINGLE_OCCUPANCY.available > 0
    ? (occupancyByRoomType.SINGLE_OCCUPANCY.booked / occupancyByRoomType.SINGLE_OCCUPANCY.available) * 100
    : 0;
  occupancyByRoomType.DOUBLE_OCCUPANCY.rate = occupancyByRoomType.DOUBLE_OCCUPANCY.available > 0
    ? (occupancyByRoomType.DOUBLE_OCCUPANCY.booked / occupancyByRoomType.DOUBLE_OCCUPANCY.available) * 100
    : 0;

  const requestsInPeriod = periodBookings.filter((b) =>
    isInPeriod(b.submittedAt.split("T")[0], periodStart, periodEnd) && !b.isLegacy
  );
  
  const bookingRequestsReceived = requestsInPeriod.length;
  
  const bookingRequestsConfirmed = requestsInPeriod.filter(
    (b) => isConfirmedOrCompleted(b.status)
  ).length;
  
  const bookingRequestsCancelled = requestsInPeriod.filter(
    (b) => b.status === "cancelled" || b.status === "rejected"
  ).length;
  
  const confirmationRate = bookingRequestsReceived > 0
    ? (bookingRequestsConfirmed / bookingRequestsReceived) * 100
    : 0;

  const memberBookings = confirmedOrCompleted.filter((b) => b.isMember).length;
  const nonMemberBookings = confirmedOrCompleted.filter((b) => !b.isMember).length;
  const memberSplit = confirmedOrCompleted.length > 0
    ? (memberBookings / confirmedOrCompleted.length) * 100
    : 0;

  const totalLengthOfStay = confirmedOrCompleted.reduce((sum, b) => {
    const nights = calculateNights(b.checkIn, b.checkOut);
    return sum + nights;
  }, 0);
  const averageLengthOfStay = confirmedOrCompleted.length > 0
    ? totalLengthOfStay / confirmedOrCompleted.length
    : 0;

  const totalLeadTime = confirmedOrCompleted.reduce((sum, b) => {
    const submittedDate = new Date(b.submittedAt);
    const checkInDate = trinidadDateToUTC(b.checkIn);
    const leadTimeMs = checkInDate.getTime() - submittedDate.getTime();
    const leadTimeDays = leadTimeMs / (24 * 60 * 60 * 1000);
    return sum + Math.max(0, leadTimeDays);
  }, 0);
  const averageLeadTime = confirmedOrCompleted.length > 0
    ? totalLeadTime / confirmedOrCompleted.length
    : 0;

  const skippedLegacyBookings = periodBookings.filter((b) => b.isLegacy).length;

  return {
    roomRevenue,
    mealRevenue,
    totalRevenue: roomRevenue + mealRevenue,
    occupancyRate,
    roomNightsBooked,
    roomNightsAvailable,
    occupancyByRoomType,
    bookingRequestsReceived,
    bookingRequestsConfirmed,
    bookingRequestsCancelled,
    confirmationRate,
    memberBookings,
    nonMemberBookings,
    memberSplit,
    averageLengthOfStay,
    averageLeadTime,
    skippedLegacyBookings,
  };
}

export function calculateComparisonMetrics(
  bookings: HotelBooking[],
  periodStart: string,
  periodEnd: string,
  isWeekly: boolean
): ComparisonMetrics {
  const currentMetrics = calculatePeriodMetrics(bookings, periodStart, periodEnd);
  const { start: prevStart, end: prevEnd } = getPreviousPeriod(periodStart, periodEnd, isWeekly);
  const previousMetrics = calculatePeriodMetrics(bookings, prevStart, prevEnd);

  return {
    ...currentMetrics,
    comparison: {
      roomRevenue: previousMetrics.roomRevenue > 0
        ? ((currentMetrics.roomRevenue - previousMetrics.roomRevenue) / previousMetrics.roomRevenue) * 100
        : 0,
      mealRevenue: previousMetrics.mealRevenue > 0
        ? ((currentMetrics.mealRevenue - previousMetrics.mealRevenue) / previousMetrics.mealRevenue) * 100
        : 0,
      totalRevenue: previousMetrics.totalRevenue > 0
        ? ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) / previousMetrics.totalRevenue) * 100
        : 0,
      occupancyRate: currentMetrics.occupancyRate - previousMetrics.occupancyRate,
      confirmationRate: currentMetrics.confirmationRate - previousMetrics.confirmationRate,
      memberSplit: currentMetrics.memberSplit - previousMetrics.memberSplit,
      averageLengthOfStay: previousMetrics.averageLengthOfStay > 0
        ? ((currentMetrics.averageLengthOfStay - previousMetrics.averageLengthOfStay) / previousMetrics.averageLengthOfStay) * 100
        : 0,
      averageLeadTime: previousMetrics.averageLeadTime > 0
        ? ((currentMetrics.averageLeadTime - previousMetrics.averageLeadTime) / previousMetrics.averageLeadTime) * 100
        : 0,
    },
  };
}

export function calculateTrendData(
  bookings: HotelBooking[],
  isWeekly: boolean,
  periods: number = 12
): TrendDataPoint[] {
  const result: TrendDataPoint[] = [];
  const today = getTrinidadToday();
  
  for (let i = periods - 1; i >= 0; i--) {
    let periodStart: string;
    let periodEnd: string;
    let label: string;
    
    if (isWeekly) {
      const targetDate = trinidadDateToUTC(today);
      targetDate.setUTCDate(targetDate.getUTCDate() - (i * 7));
      const targetDateStr = toTrinidadDateString(targetDate);
      const range = getWeekRange(targetDateStr);
      periodStart = range.start;
      periodEnd = range.end;
      const [, m, d] = periodStart.split("-");
      label = `${parseInt(m, 10)}/${parseInt(d, 10)}`;
    } else {
      const targetDate = trinidadDateToUTC(today);
      targetDate.setUTCMonth(targetDate.getUTCMonth() - i);
      const targetDateStr = toTrinidadDateString(targetDate);
      const range = getMonthRange(targetDateStr);
      periodStart = range.start;
      periodEnd = range.end;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const [year, month] = periodStart.split("-");
      label = `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    }
    
    const metrics = calculatePeriodMetrics(bookings, periodStart, periodEnd);
    
    result.push({
      period: label,
      roomRevenue: metrics.roomRevenue,
      mealRevenue: metrics.mealRevenue,
      totalRevenue: metrics.totalRevenue,
      occupancyRate: metrics.occupancyRate,
      confirmationRate: metrics.confirmationRate,
    });
  }
  
  return result;
}

export function generateCSV(
  metrics: ComparisonMetrics,
  trendData: TrendDataPoint[],
  periodLabel: string
): string {
  const rows: string[] = [];
  
  rows.push("TTPSSWA Hotel Performance Report");
  rows.push(`Period: ${periodLabel}`);
  rows.push("");
  
  if (metrics.skippedLegacyBookings > 0) {
    rows.push(`Note: ${metrics.skippedLegacyBookings} legacy booking(s) were skipped (pre-Oct 26 data)`);
    rows.push("");
  }
  
  rows.push("SUMMARY METRICS");
  rows.push("Metric,Current Period,Change vs Previous (%)");
  rows.push(`Room Revenue (TTD),${metrics.roomRevenue.toFixed(2)},${metrics.comparison.roomRevenue.toFixed(1)}%`);
  rows.push(`Meal Revenue (TTD),${metrics.mealRevenue.toFixed(2)},${metrics.comparison.mealRevenue.toFixed(1)}%`);
  rows.push(`Total Revenue (TTD),${metrics.totalRevenue.toFixed(2)},${metrics.comparison.totalRevenue.toFixed(1)}%`);
  rows.push(`Occupancy Rate,${metrics.occupancyRate.toFixed(1)}%,${metrics.comparison.occupancyRate > 0 ? '+' : ''}${metrics.comparison.occupancyRate.toFixed(1)}pp`);
  rows.push(`Confirmation Rate,${metrics.confirmationRate.toFixed(1)}%,${metrics.comparison.confirmationRate > 0 ? '+' : ''}${metrics.comparison.confirmationRate.toFixed(1)}pp`);
  rows.push(`Member Split,${metrics.memberSplit.toFixed(1)}%,${metrics.comparison.memberSplit > 0 ? '+' : ''}${metrics.comparison.memberSplit.toFixed(1)}pp`);
  rows.push(`Average Length of Stay,${metrics.averageLengthOfStay.toFixed(1)} nights,${metrics.comparison.averageLengthOfStay.toFixed(1)}%`);
  rows.push(`Average Lead Time,${metrics.averageLeadTime.toFixed(1)} days,${metrics.comparison.averageLeadTime.toFixed(1)}%`);
  rows.push("");
  
  rows.push("OCCUPANCY BY ROOM TYPE");
  rows.push("Room Type,Nights Booked,Nights Available,Occupancy Rate");
  rows.push(`Presidential Suite,${metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.booked},${metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.available},${metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.rate.toFixed(1)}%`);
  rows.push(`Single Occupancy,${metrics.occupancyByRoomType.SINGLE_OCCUPANCY.booked},${metrics.occupancyByRoomType.SINGLE_OCCUPANCY.available},${metrics.occupancyByRoomType.SINGLE_OCCUPANCY.rate.toFixed(1)}%`);
  rows.push(`Double Occupancy,${metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.booked},${metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.available},${metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.rate.toFixed(1)}%`);
  rows.push("");
  
  rows.push("BOOKING ACTIVITY");
  rows.push("Metric,Count");
  rows.push(`Requests Received,${metrics.bookingRequestsReceived}`);
  rows.push(`Requests Confirmed,${metrics.bookingRequestsConfirmed}`);
  rows.push(`Requests Cancelled,${metrics.bookingRequestsCancelled}`);
  rows.push(`Member Bookings,${metrics.memberBookings}`);
  rows.push(`Non-Member Bookings,${metrics.nonMemberBookings}`);
  rows.push("");
  
  rows.push("TREND DATA");
  rows.push("Period,Room Revenue,Meal Revenue,Total Revenue,Occupancy Rate,Confirmation Rate");
  for (const point of trendData) {
    rows.push(
      `${point.period},${point.roomRevenue.toFixed(2)},${point.mealRevenue.toFixed(2)},${point.totalRevenue.toFixed(2)},${point.occupancyRate.toFixed(1)}%,${point.confirmationRate.toFixed(1)}%`
    );
  }
  
  return rows.join("\n");
}

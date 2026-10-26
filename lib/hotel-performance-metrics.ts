/**
 * Hotel Performance Metrics
 * Pure calculation functions for executive reporting
 * All dates in America/Port_of_Spain timezone
 */

import { HOTEL_RATES, MEAL_PRICES, calculateNights } from "./hotel-pricing";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_OUT";
export type RoomCategory = "PRESIDENTIAL_SUITE" | "SINGLE_OCCUPANCY" | "DOUBLE_OCCUPANCY";

export interface HotelBooking {
  id: string;
  guestName: string;
  serviceNumber: string | null;
  email: string;
  phone: string;
  roomCategory: RoomCategory;
  roomCount: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  meals: string[];
  specialRequests: string | null;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
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

function getTrinidadDate(date: Date): Date {
  const trinidadTime = new Date(
    date.toLocaleString("en-US", { timeZone: "America/Port_of_Spain" })
  );
  return trinidadTime;
}

export function getTrinidadToday(): Date {
  return getTrinidadDate(new Date());
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const trinidad = getTrinidadDate(date);
  const day = trinidad.getDay();
  const diff = trinidad.getDate() - day;
  const start = new Date(trinidad.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  const trinidad = getTrinidadDate(date);
  const start = new Date(trinidad.getFullYear(), trinidad.getMonth(), 1);
  const end = new Date(trinidad.getFullYear(), trinidad.getMonth() + 1, 1);
  return { start, end };
}

export function getPreviousPeriod(
  start: Date,
  end: Date,
  isWeekly: boolean
): { start: Date; end: Date } {
  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start);
  const prevStart = new Date(start.getTime() - duration);
  return { start: prevStart, end: prevEnd };
}

function isMember(booking: HotelBooking): boolean {
  return booking.serviceNumber != null && booking.serviceNumber.trim() !== "";
}

function isInPeriod(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end;
}

function calculateRoomRevenue(
  booking: HotelBooking,
  nights: number
): number {
  const member = isMember(booking);
  const rates = member ? HOTEL_RATES.member : HOTEL_RATES.nonMember;
  const rate = rates[booking.roomCategory];
  return rate * booking.roomCount * nights;
}

function calculateMealRevenue(booking: HotelBooking): number {
  let total = 0;
  for (const meal of booking.meals) {
    const mealName = meal as keyof typeof MEAL_PRICES;
    if (MEAL_PRICES[mealName]) {
      total += MEAL_PRICES[mealName];
    }
  }
  return total;
}

function countRoomNights(
  bookings: HotelBooking[],
  start: Date,
  end: Date,
  roomCategory?: RoomCategory
): number {
  let total = 0;
  for (const booking of bookings) {
    if (roomCategory && booking.roomCategory !== roomCategory) continue;
    if (booking.status !== "CONFIRMED" && booking.status !== "CHECKED_OUT") continue;
    
    const checkIn = booking.checkIn >= start ? booking.checkIn : start;
    const checkOut = booking.checkOut <= end ? booking.checkOut : end;
    
    if (checkIn < checkOut) {
      const nights = calculateNights(
        checkIn.toISOString().split("T")[0],
        checkOut.toISOString().split("T")[0]
      );
      total += nights * booking.roomCount;
    }
  }
  return total;
}

function calculateAvailableRoomNights(
  start: Date,
  end: Date,
  roomCategory?: RoomCategory
): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((end.getTime() - start.getTime()) / msPerDay);
  
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
  periodStart: Date,
  periodEnd: Date
): PeriodMetrics {
  const periodBookings = bookings.filter(
    (b) => isInPeriod(b.checkIn, periodStart, periodEnd) || 
           (b.checkIn < periodStart && b.checkOut > periodStart)
  );

  const confirmedOrCheckedOut = periodBookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "CHECKED_OUT"
  );

  let roomRevenue = 0;
  let mealRevenue = 0;
  let totalNights = 0;

  for (const booking of confirmedOrCheckedOut) {
    const checkIn = booking.checkIn >= periodStart ? booking.checkIn : periodStart;
    const checkOut = booking.checkOut <= periodEnd ? booking.checkOut : periodEnd;
    
    if (checkIn < checkOut) {
      const nights = calculateNights(
        checkIn.toISOString().split("T")[0],
        checkOut.toISOString().split("T")[0]
      );
      roomRevenue += calculateRoomRevenue(booking, nights);
      mealRevenue += calculateMealRevenue(booking);
      totalNights += nights;
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

  const bookingRequestsReceived = periodBookings.filter((b) =>
    isInPeriod(b.createdAt, periodStart, periodEnd)
  ).length;
  
  const requestsInPeriod = periodBookings.filter((b) =>
    isInPeriod(b.createdAt, periodStart, periodEnd)
  );
  
  const bookingRequestsConfirmed = requestsInPeriod.filter(
    (b) => b.status === "CONFIRMED" || b.status === "CHECKED_OUT"
  ).length;
  
  const bookingRequestsCancelled = requestsInPeriod.filter(
    (b) => b.status === "CANCELLED"
  ).length;
  
  const confirmationRate = bookingRequestsReceived > 0
    ? (bookingRequestsConfirmed / bookingRequestsReceived) * 100
    : 0;

  const memberBookings = confirmedOrCheckedOut.filter(isMember).length;
  const nonMemberBookings = confirmedOrCheckedOut.filter((b) => !isMember(b)).length;
  const memberSplit = confirmedOrCheckedOut.length > 0
    ? (memberBookings / confirmedOrCheckedOut.length) * 100
    : 0;

  const totalLengthOfStay = confirmedOrCheckedOut.reduce((sum, b) => {
    const nights = calculateNights(
      b.checkIn.toISOString().split("T")[0],
      b.checkOut.toISOString().split("T")[0]
    );
    return sum + nights;
  }, 0);
  const averageLengthOfStay = confirmedOrCheckedOut.length > 0
    ? totalLengthOfStay / confirmedOrCheckedOut.length
    : 0;

  const totalLeadTime = confirmedOrCheckedOut.reduce((sum, b) => {
    const leadTimeMs = b.checkIn.getTime() - b.createdAt.getTime();
    const leadTimeDays = leadTimeMs / (24 * 60 * 60 * 1000);
    return sum + leadTimeDays;
  }, 0);
  const averageLeadTime = confirmedOrCheckedOut.length > 0
    ? totalLeadTime / confirmedOrCheckedOut.length
    : 0;

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
  };
}

export function calculateComparisonMetrics(
  bookings: HotelBooking[],
  periodStart: Date,
  periodEnd: Date,
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
    let periodStart: Date;
    let periodEnd: Date;
    let label: string;
    
    if (isWeekly) {
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() - (i * 7));
      const range = getWeekRange(weekDate);
      periodStart = range.start;
      periodEnd = range.end;
      label = `${periodStart.getMonth() + 1}/${periodStart.getDate()}`;
    } else {
      periodStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      periodEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      label = `${monthNames[periodStart.getMonth()]} ${periodStart.getFullYear()}`;
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

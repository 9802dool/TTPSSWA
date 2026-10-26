/**
 * Hotel Performance Data Loading
 * Converts Supabase applications to HotelBooking format for metrics
 */

import { getApplications } from "./supabase/applications";
import type { Application } from "./supabase/types";
import type { HotelBooking, RoomCategory } from "./hotel-performance-metrics";

function parseRoomCategory(data: Record<string, unknown>): RoomCategory | null {
  const rc = data.roomCategory;
  if (rc === "PRESIDENTIAL_SUITE" || rc === "SINGLE_OCCUPANCY" || rc === "DOUBLE_OCCUPANCY") {
    return rc;
  }
  return null;
}

function parseRoomCount(data: Record<string, unknown>): number {
  const rc = Number(data.roomCount ?? data.rooms ?? 1);
  return Number.isFinite(rc) && rc > 0 ? Math.floor(rc) : 1;
}

function parseCheckIn(data: Record<string, unknown>): string | null {
  const ci = data.checkIn ?? data.checkInDate;
  return typeof ci === "string" ? ci : null;
}

function parseCheckOut(data: Record<string, unknown>): string | null {
  const co = data.checkOut ?? data.checkOutDate;
  return typeof co === "string" ? co : null;
}

function parseMeals(data: Record<string, unknown>): { Breakfast: number; Lunch: number; Dinner: number } {
  const meals = { Breakfast: 0, Lunch: 0, Dinner: 0 };
  
  const mealsData = data.meals;
  if (typeof mealsData === "object" && mealsData !== null) {
    const m = mealsData as Record<string, unknown>;
    
    if (typeof m.Breakfast === "number") {
      meals.Breakfast = Math.max(0, Math.floor(m.Breakfast));
    }
    if (typeof m.Lunch === "number") {
      meals.Lunch = Math.max(0, Math.floor(m.Lunch));
    }
    if (typeof m.Dinner === "number") {
      meals.Dinner = Math.max(0, Math.floor(m.Dinner));
    }
  }
  
  if (Array.isArray(mealsData)) {
    for (const item of mealsData) {
      if (typeof item === "string") {
        const breakfastMatch = item.match(/Breakfast\s+x?\s*(\d+)/i);
        if (breakfastMatch) {
          meals.Breakfast += parseInt(breakfastMatch[1], 10);
        }
        
        const lunchMatch = item.match(/Lunch\s+x?\s*(\d+)/i);
        if (lunchMatch) {
          meals.Lunch += parseInt(lunchMatch[1], 10);
        }
        
        const dinnerMatch = item.match(/Dinner\s+x?\s*(\d+)/i);
        if (dinnerMatch) {
          meals.Dinner += parseInt(dinnerMatch[1], 10);
        }
      }
    }
  }
  
  return meals;
}

function isLegacyFormat(data: Record<string, unknown>): boolean {
  const hasNewFields = "roomCategory" in data && "roomCount" in data && "checkIn" in data;
  const hasLegacyFields = "presidentialSuite" in data || "fullBedRoom" in data || "doubleBedRoom" in data;
  return !hasNewFields && hasLegacyFields;
}

function isMember(data: Record<string, unknown>): boolean {
  if (typeof data.isMember === "boolean") {
    return data.isMember;
  }
  const serviceNumber = data.serviceNumber;
  return typeof serviceNumber === "string" && serviceNumber.trim().length > 0;
}

export async function loadHotelBookings(): Promise<{ bookings: HotelBooking[]; skipped: number }> {
  const applications = await getApplications({ type: "hotel_booking" });
  
  const bookings: HotelBooking[] = [];
  let skipped = 0;
  
  for (const app of applications) {
    const data = app.application_data as Record<string, unknown>;
    
    const isLegacy = isLegacyFormat(data);
    if (isLegacy) {
      skipped++;
      continue;
    }
    
    const roomCategory = parseRoomCategory(data);
    const checkIn = parseCheckIn(data);
    const checkOut = parseCheckOut(data);
    
    if (!roomCategory || !checkIn || !checkOut) {
      skipped++;
      continue;
    }
    
    const booking: HotelBooking = {
      id: app.id,
      guestName: String(data.guestName ?? data.fullName ?? ""),
      email: String(data.email ?? ""),
      phone: String(data.phone ?? ""),
      roomCategory,
      roomCount: parseRoomCount(data),
      checkIn,
      checkOut,
      guests: Math.max(1, Math.floor(Number(data.guests ?? 1))),
      meals: parseMeals(data),
      specialRequests: typeof data.specialRequests === "string" ? data.specialRequests : null,
      isMember: isMember(data),
      status: app.status,
      submittedAt: app.submitted_at,
      isLegacy: false,
    };
    
    bookings.push(booking);
  }
  
  return { bookings, skipped };
}

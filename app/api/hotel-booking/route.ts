import { NextResponse } from "next/server";
import { POST as bookHotel } from "@/app/api/hotel/book/route";

export const runtime = "nodejs";

/**
 * Legacy endpoint (older HotelReservationForm payloads). It maps the old
 * field names onto /api/hotel/book so every booking goes through the same
 * validation, server-side pricing and atomic per-room-type reservation.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const count = (v: unknown) => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : NaN;
  };

  let rooms: unknown = body.rooms;
  if (!Array.isArray(rooms) && body.roomCategory === undefined) {
    rooms = [
      { roomCategory: "PRESIDENTIAL_SUITE", roomCount: count(body.presidentialSuite) },
      { roomCategory: "SINGLE_OCCUPANCY", roomCount: count(body.fullBedRoom) },
      { roomCategory: "DOUBLE_OCCUPANCY", roomCount: count(body.doubleBedRoom) },
    ].filter((r) => r.roomCount !== 0);
  }

  const notes = [str(body.specialRequests) ?? str(body.notes), body.children ? `Children: ${String(body.children)}` : ""]
    .filter(Boolean)
    .join("\n");

  const mapped: Record<string, unknown> = {
    guestName: str(body.guestName) ?? str(body.fullName),
    email: body.email,
    phone: body.phone,
    checkIn: str(body.checkIn) ?? str(body.checkInDate),
    checkOut: str(body.checkOut) ?? str(body.checkOutDate),
    guests: Number(body.guests),
    isMember: body.isMember === true,
    membershipNumber: body.membershipNumber,
    specialRequests: notes,
    meals: body.meals,
    guestMealSelections: body.guestMealSelections,
    turnstileToken: body.turnstileToken,
    website: body.website,
    formToken: body.formToken,
    ...(Array.isArray(rooms)
      ? { rooms }
      : { roomCategory: body.roomCategory, roomCount: body.roomCount }),
  };

  const headers = new Headers(request.headers);
  headers.set("content-type", "application/json");
  const res = await bookHotel(
    new Request(new URL("/api/hotel/book", request.url), {
      method: "POST",
      headers,
      body: JSON.stringify(mapped),
    }),
  );
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  // Legacy clients read `error` on failure.
  return NextResponse.json(
    res.ok ? { ok: true, ...data } : { error: data.message ?? "Booking failed.", ...data },
    { status: res.status },
  );
}

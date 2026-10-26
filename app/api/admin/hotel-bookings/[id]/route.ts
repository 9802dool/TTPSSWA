import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession, hasRole } from "@/lib/admin-auth";
import {
  getHotelBookingMeta,
  mergeHotelBookingMeta,
  type HotelBookingMeta,
} from "@/lib/hotel-booking-meta";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const runtime = "nodejs";

type Body = { action?: string; repliedEmailNote?: string; bookingStatus?: string };

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  
  // Require at least staff role
  if (!hasRole(session, "staff")) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }

  const params = await Promise.resolve(context.params);
  const id = decodeURIComponent(params.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const action = String(body.action ?? "").trim();
  if (action === "confirm") {
    const ok = await mergeHotelBookingMeta(id, {
      confirmed: true,
      confirmedAt: new Date().toISOString(),
    });
    if (!ok) {
      return NextResponse.json(
        { error: "Could not save status (storage unavailable)." },
        { status: 503 },
      );
    }
  } else if (action === "replied") {
    const note =
      typeof body.repliedEmailNote === "string"
        ? body.repliedEmailNote.trim().slice(0, 4000)
        : "";
    const ok = await mergeHotelBookingMeta(id, {
      repliedEmailAt: new Date().toISOString(),
      repliedEmailNote: note || undefined,
    });
    if (!ok) {
      return NextResponse.json(
        { error: "Could not save status (storage unavailable)." },
        { status: 503 },
      );
    }
  } else if (action === "update_status") {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 },
      );
    }
    
    const status = String(body.bookingStatus ?? "").trim().toUpperCase();
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "CHECKED_OUT"];
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    
    try {
      await prisma.hotelBooking.update({
        where: { id },
        data: { status: status as "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_OUT" },
      });
    } catch (err) {
      console.error("Error updating booking status:", err);
      return NextResponse.json(
        { error: "Could not update booking status." },
        { status: 500 },
      );
    }
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const meta = (await getHotelBookingMeta(id)) ?? ({} as HotelBookingMeta);
  return NextResponse.json({ ok: true, meta });
}

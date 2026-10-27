import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession, hasRole } from "@/lib/admin-auth";
import {
  getHotelBookingMeta,
  mergeHotelBookingMeta,
  type HotelBookingMeta,
} from "@/lib/hotel-booking-meta";
import { updateApplicationStatus } from "@/lib/supabase/applications";
import { findHotelApplication } from "@/lib/hotel-performance-data";
import { setHotelBookingRedisStatus } from "@/lib/simple-hotel-booking-storage";
import type { ApplicationStatus } from "@/lib/supabase/types";

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
    const statusInput = String(body.bookingStatus ?? "").trim().toLowerCase();
    const statusMap: Record<string, ApplicationStatus> = {
      submitted: "submitted",
      approved: "approved",
      completed: "completed",
      pending: "submitted",
      request: "submitted",
      confirmed: "approved",
      "checked out": "completed",
      cancelled: "cancelled",
    };
    
    const newStatus = statusMap[statusInput];
    if (!newStatus) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    
    const application = await findHotelApplication(id);
    // Keep the Redis availability hold in step with the status: cancelling
    // releases the room-nights, any other status keeps (or re-applies) them.
    // Supabase's prismaBookingId is the Redis id when the page id is a UUID.
    const redisId = application?.bookingId ?? id;
    const redisUpdated = await setHotelBookingRedisStatus(
      redisId,
      newStatus === "cancelled" ? "CANCELLED" : "CONFIRMED",
    );

    if (!application) {
      if (redisUpdated) {
        const meta = (await getHotelBookingMeta(id)) ?? ({} as HotelBookingMeta);
        return NextResponse.json({ ok: true, meta, redisOnly: true });
      }
      return NextResponse.json(
        { error: "No matching hotel booking application found." },
        { status: 404 },
      );
    }

    const success = await updateApplicationStatus(application.id, newStatus, {
      changed_by_type: "admin",
      changed_by_id: session.userId,
      changed_by_name: session.email,
      note: `Status changed to ${newStatus} by admin`,
    });
    
    if (!success) {
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

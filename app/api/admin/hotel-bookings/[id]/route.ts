import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-session";
import {
  getHotelBookingMeta,
  mergeHotelBookingMeta,
  type HotelBookingMeta,
} from "@/lib/hotel-booking-meta";

export const runtime = "nodejs";

type Body = { action?: string; repliedEmailNote?: string };

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!token || !verifyAdminSession(token)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const meta = (await getHotelBookingMeta(id)) ?? ({} as HotelBookingMeta);
  return NextResponse.json({ ok: true, meta });
}

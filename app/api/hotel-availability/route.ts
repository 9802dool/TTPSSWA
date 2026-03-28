import { NextResponse } from "next/server";
import { getHotelReservationRecords } from "@/lib/analytics-storage";
import {
  aggregateNightsAvailability,
  HOTEL_NIGHT_CAPACITY,
} from "@/lib/hotel-availability";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NIGHTS = 400;

function nightsBetween(from: string, toExclusive: string): number {
  const t0 = new Date(`${from}T12:00:00`).getTime();
  const t1 = new Date(`${toExclusive}T12:00:00`).getTime();
  return Math.round((t1 - t0) / 86_400_000);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.trim() ?? "";
  const to = searchParams.get("to")?.trim() ?? "";

  if (!DATE_RE.test(from)) {
    return NextResponse.json(
      { error: "Invalid or missing from (use YYYY-MM-DD)." },
      { status: 400 },
    );
  }
  if (!DATE_RE.test(to)) {
    return NextResponse.json(
      { error: "Invalid or missing to (use YYYY-MM-DD, exclusive end)." },
      { status: 400 },
    );
  }
  if (from >= to) {
    return NextResponse.json(
      { error: "from must be before to." },
      { status: 400 },
    );
  }

  const span = nightsBetween(from, to);
  if (span > MAX_NIGHTS) {
    return NextResponse.json(
      { error: `Date range too large (max ${MAX_NIGHTS} nights).` },
      { status: 400 },
    );
  }

  const { storageConfigured, records } = await getHotelReservationRecords();
  const byNight = aggregateNightsAvailability(records, from, to);

  return NextResponse.json({
    storageConfigured,
    capacityPerNight: HOTEL_NIGHT_CAPACITY,
    from,
    to,
    byNight,
  });
}

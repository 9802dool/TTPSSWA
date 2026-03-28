import { NextResponse } from "next/server";
import { getHotelBookingMeta, mergeHotelBookingMeta } from "@/lib/hotel-booking-meta";
import { verifyQuotationOpenToken } from "@/lib/hotel-quotation-open-token";

export const runtime = "nodejs";

/** 1×1 transparent GIF */
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

function pixelResponse(): NextResponse {
  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim() ?? "";
  const sig = searchParams.get("sig")?.trim() ?? "";

  if (!id || !sig || !verifyQuotationOpenToken(id, sig)) {
    return pixelResponse();
  }

  const prev = await getHotelBookingMeta(id);
  if (!prev?.quotationEmailOpenedAt) {
    await mergeHotelBookingMeta(id, {
      quotationEmailOpenedAt: new Date().toISOString(),
    });
  }

  return pixelResponse();
}

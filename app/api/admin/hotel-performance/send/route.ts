import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { getAdminCookieName, verifyAdminSession, hasRole } from "@/lib/admin-auth";
import { loadHotelBookings } from "@/lib/hotel-performance-data";
import {
  calculateComparisonMetrics,
  getWeekRange,
  getMonthRange,
  getTrinidadToday,
} from "@/lib/hotel-performance-metrics";
import { generateEmailHTML } from "@/lib/hotel-performance-email";

export const runtime = "nodejs";

const RATE_LIMIT_KEY = "hotel_performance_send";
const rateLimit = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const timestamps = rateLimit.get(userId) || [];
  const recent = timestamps.filter((t) => now - t < hour);
  
  if (recent.length >= 5) {
    return false;
  }
  
  recent.push(now);
  rateLimit.set(userId, recent);
  return true;
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(session, "super_admin")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  if (!checkRateLimit(session.userId)) {
    return NextResponse.json({ error: "Rate limit exceeded (5 per hour)" }, { status: 429 });
  }

  const emails = process.env.EXEC_REPORT_EMAILS?.trim();
  if (!emails) {
    return NextResponse.json({ error: "EXEC_REPORT_EMAILS not configured" }, { status: 503 });
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (!resendApiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 503 });
  }

  const recipients = emails.split(",").map((e) => e.trim()).filter(Boolean);
  if (recipients.length === 0) {
    return NextResponse.json({ error: "No valid recipients" }, { status: 400 });
  }

  let body: { reportType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const isWeekly = body.reportType === "weekly";
  const today = getTrinidadToday();
  const range = isWeekly ? getWeekRange(today) : getMonthRange(today);

  try {
    const { bookings } = await loadHotelBookings();

    const metrics = calculateComparisonMetrics(
      bookings,
      range.start,
      range.end,
      isWeekly
    );

    const periodLabel = isWeekly
      ? `Week of ${range.start}`
      : new Date(range.start + "T04:00:00Z").toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "America/Port_of_Spain" });

    const emailHTML = generateEmailHTML(metrics, periodLabel, isWeekly);

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.BOOKING_FROM_EMAIL?.trim() || "TTPSSWA Reports <onboarding@resend.dev>";

    await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject: `Hotel Performance Report - ${periodLabel} (Manual)`,
      html: emailHTML,
    });

    return NextResponse.json({
      ok: true,
      sent: recipients.length,
      period: periodLabel,
    });
  } catch (error) {
    console.error("Hotel performance send error:", error);
    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500 }
    );
  }
}

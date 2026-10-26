import { NextResponse } from "next/server";
import { Resend } from "resend";
import { loadHotelBookings } from "@/lib/hotel-performance-data";
import {
  calculateComparisonMetrics,
  getWeekRange,
  getMonthRange,
  getTrinidadToday,
  getPreviousPeriod,
} from "@/lib/hotel-performance-metrics";
import { generateEmailHTML } from "@/lib/hotel-performance-email";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  
  if (!cronSecret) {
    console.error("Hotel performance cron: CRON_SECRET not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 503 });
  }
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error("Hotel performance cron: Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const emails = process.env.EXEC_REPORT_EMAILS?.trim();
  if (!emails) {
    console.log("Hotel performance cron: EXEC_REPORT_EMAILS not set, skipping");
    return NextResponse.json({ message: "EXEC_REPORT_EMAILS not configured, skipped" });
  }
  
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (!resendApiKey) {
    console.error("Hotel performance cron: RESEND_API_KEY not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  
  const recipients = emails.split(",").map(e => e.trim()).filter(Boolean);
  if (recipients.length === 0) {
    console.log("Hotel performance cron: No valid email recipients");
    return NextResponse.json({ message: "No valid recipients" });
  }

  const url = new URL(request.url);
  const reportType = url.searchParams.get("type");
  
  if (reportType !== "weekly" && reportType !== "monthly") {
    return NextResponse.json({ error: "Missing or invalid ?type parameter (weekly or monthly)" }, { status: 400 });
  }
  
  try {
    const { bookings } = await loadHotelBookings();
    const today = getTrinidadToday();
    
    const isWeekly = reportType === "weekly";
    let range: { start: string; end: string };
    
    if (isWeekly) {
      const currentWeekRange = getWeekRange(today);
      range = getPreviousPeriod(currentWeekRange.start, currentWeekRange.end, true);
    } else {
      const currentMonthRange = getMonthRange(today);
      range = getPreviousPeriod(currentMonthRange.start, currentMonthRange.end, false);
    }
    
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
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject: `Hotel Performance Report - ${periodLabel}`,
      html: emailHTML,
    });
    
    console.log("Hotel performance email sent:", result);
    
    return NextResponse.json({ 
      ok: true, 
      sent: recipients.length,
      period: periodLabel,
      isWeekly,
      range,
    });
  } catch (error) {
    console.error("Hotel performance cron error:", error);
    return NextResponse.json({ 
      error: "Internal server error"
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import {
  calculateComparisonMetrics,
  getWeekRange,
  getMonthRange,
  getTrinidadToday,
  type HotelBooking,
} from "@/lib/hotel-performance-metrics";
import { formatTTD } from "@/lib/hotel-pricing";

export const runtime = "nodejs";

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatNumber(value: number): string {
  return value.toFixed(1);
}

async function getHotelBookings(): Promise<HotelBooking[]> {
  const prisma = new PrismaClient();
  try {
    const bookings = await prisma.hotelBooking.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    return bookings.map((b) => ({
      id: b.id,
      guestName: b.guestName,
      serviceNumber: b.serviceNumber,
      email: b.email,
      phone: b.phone,
      roomCategory: b.roomCategory as "PRESIDENTIAL_SUITE" | "SINGLE_OCCUPANCY" | "DOUBLE_OCCUPANCY",
      roomCount: b.roomCount,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guests: b.guests,
      meals: b.meals,
      specialRequests: b.specialRequests,
      status: b.status as "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_OUT",
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching hotel bookings:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

function generateEmailHTML(
  metrics: ReturnType<typeof calculateComparisonMetrics>,
  periodLabel: string,
  isWeekly: boolean
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hotel Performance Report - ${periodLabel}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a365d; border-bottom: 3px solid #3182ce; padding-bottom: 10px; }
    h2 { color: #2c5282; margin-top: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background-color: #f7fafc; font-weight: 600; color: #2d3748; }
    tr:hover { background-color: #f7fafc; }
    .metric-card { background: #f7fafc; border-left: 4px solid #3182ce; padding: 16px; margin: 10px 0; }
    .metric-value { font-size: 28px; font-weight: bold; color: #1a365d; }
    .metric-label { font-size: 14px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
    .comparison { font-size: 14px; font-weight: 600; }
    .positive { color: #22863a; }
    .negative { color: #d73a49; }
    .neutral { color: #6a737d; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px; }
  </style>
</head>
<body>
  <h1>🏨 Hotel Performance Report</h1>
  <p><strong>Period:</strong> ${periodLabel}</p>
  <p><strong>Report Type:</strong> ${isWeekly ? "Weekly" : "Monthly"}</p>
  
  <h2>📊 Revenue Summary</h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
    <div class="metric-card">
      <div class="metric-label">Total Revenue</div>
      <div class="metric-value">${formatTTD(metrics.totalRevenue)}</div>
      <div class="comparison ${metrics.comparison.totalRevenue > 0 ? "positive" : metrics.comparison.totalRevenue < 0 ? "negative" : "neutral"}">
        ${formatPercent(metrics.comparison.totalRevenue)} vs previous period
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Room Revenue</div>
      <div class="metric-value">${formatTTD(metrics.roomRevenue)}</div>
      <div class="comparison ${metrics.comparison.roomRevenue > 0 ? "positive" : metrics.comparison.roomRevenue < 0 ? "negative" : "neutral"}">
        ${formatPercent(metrics.comparison.roomRevenue)}
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Meal Revenue</div>
      <div class="metric-value">${formatTTD(metrics.mealRevenue)}</div>
      <div class="comparison ${metrics.comparison.mealRevenue > 0 ? "positive" : metrics.comparison.mealRevenue < 0 ? "negative" : "neutral"}">
        ${formatPercent(metrics.comparison.mealRevenue)}
      </div>
    </div>
  </div>
  
  <h2>🛏️ Occupancy Metrics</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Value</th>
        <th>Change</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Overall Occupancy</strong></td>
        <td>${formatNumber(metrics.occupancyRate)}%</td>
        <td class="${metrics.comparison.occupancyRate > 0 ? "positive" : metrics.comparison.occupancyRate < 0 ? "negative" : "neutral"}">
          ${metrics.comparison.occupancyRate > 0 ? "↑" : metrics.comparison.occupancyRate < 0 ? "↓" : "–"} ${Math.abs(metrics.comparison.occupancyRate).toFixed(1)}pp
        </td>
      </tr>
      <tr>
        <td>Presidential Suite</td>
        <td>${formatNumber(metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.rate)}% (${metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.booked}/${metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.available} nights)</td>
        <td>—</td>
      </tr>
      <tr>
        <td>Single Occupancy</td>
        <td>${formatNumber(metrics.occupancyByRoomType.SINGLE_OCCUPANCY.rate)}% (${metrics.occupancyByRoomType.SINGLE_OCCUPANCY.booked}/${metrics.occupancyByRoomType.SINGLE_OCCUPANCY.available} nights)</td>
        <td>—</td>
      </tr>
      <tr>
        <td>Double Occupancy</td>
        <td>${formatNumber(metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.rate)}% (${metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.booked}/${metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.available} nights)</td>
        <td>—</td>
      </tr>
    </tbody>
  </table>
  
  <h2>📅 Booking Activity</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Value</th>
        <th>Change</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Requests Received</td>
        <td>${metrics.bookingRequestsReceived}</td>
        <td>—</td>
      </tr>
      <tr>
        <td>Requests Confirmed</td>
        <td>${metrics.bookingRequestsConfirmed}</td>
        <td>—</td>
      </tr>
      <tr>
        <td>Requests Cancelled</td>
        <td>${metrics.bookingRequestsCancelled}</td>
        <td>—</td>
      </tr>
      <tr>
        <td><strong>Confirmation Rate</strong></td>
        <td>${formatNumber(metrics.confirmationRate)}%</td>
        <td class="${metrics.comparison.confirmationRate > 0 ? "positive" : metrics.comparison.confirmationRate < 0 ? "negative" : "neutral"}">
          ${metrics.comparison.confirmationRate > 0 ? "↑" : metrics.comparison.confirmationRate < 0 ? "↓" : "–"} ${Math.abs(metrics.comparison.confirmationRate).toFixed(1)}pp
        </td>
      </tr>
    </tbody>
  </table>
  
  <h2>👥 Guest Profile</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Value</th>
        <th>Change</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Member Bookings</td>
        <td>${metrics.memberBookings}</td>
        <td>—</td>
      </tr>
      <tr>
        <td>Non-Member Bookings</td>
        <td>${metrics.nonMemberBookings}</td>
        <td>—</td>
      </tr>
      <tr>
        <td><strong>Member Split</strong></td>
        <td>${formatNumber(metrics.memberSplit)}%</td>
        <td class="${metrics.comparison.memberSplit > 0 ? "positive" : metrics.comparison.memberSplit < 0 ? "negative" : "neutral"}">
          ${metrics.comparison.memberSplit > 0 ? "↑" : metrics.comparison.memberSplit < 0 ? "↓" : "–"} ${Math.abs(metrics.comparison.memberSplit).toFixed(1)}pp
        </td>
      </tr>
      <tr>
        <td><strong>Avg Length of Stay</strong></td>
        <td>${formatNumber(metrics.averageLengthOfStay)} nights</td>
        <td class="${metrics.comparison.averageLengthOfStay > 0 ? "positive" : metrics.comparison.averageLengthOfStay < 0 ? "negative" : "neutral"}">
          ${formatPercent(metrics.comparison.averageLengthOfStay)}
        </td>
      </tr>
      <tr>
        <td><strong>Avg Lead Time</strong></td>
        <td>${formatNumber(metrics.averageLeadTime)} days</td>
        <td class="${metrics.comparison.averageLeadTime > 0 ? "positive" : metrics.comparison.averageLeadTime < 0 ? "negative" : "neutral"}">
          ${formatPercent(metrics.comparison.averageLeadTime)}
        </td>
      </tr>
    </tbody>
  </table>
  
  <div class="footer">
    <p><strong>TTPSSWA Hotel Performance Report</strong></p>
    <p>Generated: ${new Date().toLocaleString("en-US", { timeZone: "America/Port_of_Spain" })} AST</p>
    <p>This is an automated report. For detailed analysis, visit the admin dashboard.</p>
  </div>
</body>
</html>`;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }
  
  const recipients = emails.split(",").map(e => e.trim()).filter(Boolean);
  if (recipients.length === 0) {
    console.log("Hotel performance cron: No valid email recipients");
    return NextResponse.json({ message: "No valid recipients" });
  }
  
  try {
    const bookings = await getHotelBookings();
    const today = getTrinidadToday();
    const dayOfMonth = today.getDate();
    const dayOfWeek = today.getDay();
    
    const isMonthly = dayOfMonth === 1;
    const isWeekly = dayOfWeek === 1;
    
    if (!isMonthly && !isWeekly) {
      return NextResponse.json({ 
        message: "Not scheduled day (weekly = Monday, monthly = 1st)",
        today: today.toISOString()
      });
    }
    
    const isWeeklyReport = isWeekly && !isMonthly;
    const range = isWeeklyReport ? getWeekRange(today) : getMonthRange(today);
    
    const metrics = calculateComparisonMetrics(
      bookings,
      range.start,
      range.end,
      isWeeklyReport
    );
    
    const periodLabel = isWeeklyReport
      ? `Week of ${range.start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : range.start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    
    const emailHTML = generateEmailHTML(metrics, periodLabel, isWeeklyReport);
    
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
      isWeekly: isWeeklyReport
    });
  } catch (error) {
    console.error("Hotel performance cron error:", error);
    return NextResponse.json({ 
      error: "Failed to send report",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

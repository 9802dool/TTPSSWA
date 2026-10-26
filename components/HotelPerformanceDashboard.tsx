"use client";

import { useState, useMemo } from "react";
import {
  calculateComparisonMetrics,
  calculateTrendData,
  generateCSV,
  getWeekRange,
  getMonthRange,
  getTrinidadToday,
  type HotelBooking,
  type ComparisonMetrics,
  type TrendDataPoint,
} from "@/lib/hotel-performance-metrics";
import { formatTTD } from "@/lib/hotel-pricing";
import type { AdminRole } from "@/lib/admin-auth";

interface Props {
  bookings: HotelBooking[];
  sessionRole: AdminRole;
}

function formatPercent(value: number, includeSign = false): string {
  const sign = includeSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

function ComparisonBadge({ value, suffix = "%" }: { value: number; suffix?: string }) {
  if (Math.abs(value) < 0.1) {
    return <span className="text-xs text-[var(--muted)]">—</span>;
  }
  const isPositive = value > 0;
  const color = isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {isPositive ? "↑" : "↓"} {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}

function MetricCard({
  title,
  value,
  comparison,
  suffix = "",
}: {
  title: string;
  value: string | number;
  comparison: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <dt className="text-sm text-[var(--muted)]">{title}</dt>
      <dd className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums">
          {value}{suffix}
        </span>
        <ComparisonBadge value={comparison} />
      </dd>
    </div>
  );
}

function TrendChart({ data, metric, label }: {
  data: TrendDataPoint[];
  metric: keyof TrendDataPoint;
  label: string;
}) {
  const values = data.map(d => typeof d[metric] === "number" ? d[metric] as number : 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{label}</h3>
      <div className="flex h-48 items-end gap-1">
        {data.map((point, i) => {
          const value = typeof point[metric] === "number" ? point[metric] as number : 0;
          const heightPercent = ((value - min) / range) * 100;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="relative w-full">
                <div
                  className="w-full rounded-t bg-[var(--brand)] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${Math.max(heightPercent * 1.6, 2)}px` }}
                  title={`${point.period}: ${value.toFixed(metric === "period" ? 0 : 1)}`}
                />
              </div>
              <span className="text-[10px] text-[var(--muted)] -rotate-45 origin-top-left mt-4">
                {point.period}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HotelPerformanceDashboard({ bookings, sessionRole }: Props) {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("monthly");
  const [selectedDate, setSelectedDate] = useState(getTrinidadToday());
  const [sendingReport, setSendingReport] = useState(false);
  const [sendReportMessage, setSendReportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { metrics, trendData, periodLabel } = useMemo(() => {
    const isWeekly = viewMode === "weekly";
    const range = isWeekly ? getWeekRange(selectedDate) : getMonthRange(selectedDate);
    
    const metrics = calculateComparisonMetrics(
      bookings,
      range.start,
      range.end,
      isWeekly
    );
    
    const trendData = calculateTrendData(bookings, isWeekly, 12);
    
    const periodLabel = isWeekly
      ? `Week of ${new Date(range.start + "T04:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Port_of_Spain" })}`
      : new Date(range.start + "T04:00:00Z").toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "America/Port_of_Spain" });
    
    return { metrics, trendData, periodLabel };
  }, [bookings, viewMode, selectedDate]);

  const handleExport = () => {
    const csv = generateCSV(metrics, trendData, periodLabel);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hotel-performance-${periodLabel.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigatePeriod = (direction: number) => {
    const range = viewMode === "weekly" ? getWeekRange(selectedDate) : getMonthRange(selectedDate);
    const startDate = new Date(range.start + "T04:00:00Z");
    if (viewMode === "weekly") {
      startDate.setUTCDate(startDate.getUTCDate() + direction * 7);
    } else {
      startDate.setUTCMonth(startDate.getUTCMonth() + direction);
    }
    const year = startDate.getUTCFullYear();
    const month = String(startDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(startDate.getUTCDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const handleSendReport = async () => {
    setSendingReport(true);
    setSendReportMessage(null);
    
    try {
      const response = await fetch("/api/admin/hotel-performance/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedDate,
          reportType: viewMode,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSendReportMessage({ 
          type: "success", 
          text: `Report sent successfully to ${data.sent || 0} recipient(s)` 
        });
      } else {
        setSendReportMessage({ 
          type: "error", 
          text: data.error || "Failed to send report" 
        });
      }
    } catch (error) {
      setSendReportMessage({ 
        type: "error", 
        text: "Network error sending report" 
      });
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
          <button
            onClick={() => setViewMode("weekly")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "weekly"
                ? "bg-[var(--brand)] text-white"
                : "text-[var(--fg)] hover:bg-[var(--bg)]"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "monthly"
                ? "bg-[var(--brand)] text-white"
                : "text-[var(--fg)] hover:bg-[var(--bg)]"
            }`}
          >
            Monthly
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigatePeriod(-1)}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface)]"
          >
            ← Previous
          </button>
          <span className="text-sm font-medium">{periodLabel}</span>
          <button
            onClick={() => navigatePeriod(1)}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface)]"
          >
            Next →
          </button>
          <button
            onClick={() => setSelectedDate(getTrinidadToday())}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface)]"
          >
            Today
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface)]"
          >
            Export CSV
          </button>
          {sessionRole === "super_admin" && (
            <button
              onClick={handleSendReport}
              disabled={sendingReport}
              className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {sendingReport ? "Sending..." : "Send Summary Now"}
            </button>
          )}
        </div>
      </div>

      {sendReportMessage && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            sendReportMessage.type === "success"
              ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-100"
              : "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
          }`}
        >
          {sendReportMessage.text}
        </div>
      )}

      {metrics.skippedLegacyBookings > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <strong>Note:</strong> {metrics.skippedLegacyBookings} legacy booking(s) from before Oct 26, 2026 were skipped (incompatible data format).
        </div>
      )}

      <section>
        <h2 className="mb-4 text-base font-semibold">Revenue</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Room Revenue"
            value={formatTTD(metrics.roomRevenue)}
            comparison={metrics.comparison.roomRevenue}
          />
          <MetricCard
            title="Meal Revenue"
            value={formatTTD(metrics.mealRevenue)}
            comparison={metrics.comparison.mealRevenue}
          />
          <MetricCard
            title="Total Revenue"
            value={formatTTD(metrics.totalRevenue)}
            comparison={metrics.comparison.totalRevenue}
          />
        </dl>
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold">Occupancy</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Overall Occupancy"
            value={formatNumber(metrics.occupancyRate)}
            comparison={metrics.comparison.occupancyRate}
            suffix="%"
          />
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <dt className="text-sm text-[var(--muted)]">Presidential Suite</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">
              {formatNumber(metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.rate)}%
            </dd>
            <dd className="mt-1 text-xs text-[var(--muted)]">
              {metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.booked} / {metrics.occupancyByRoomType.PRESIDENTIAL_SUITE.available} nights
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <dt className="text-sm text-[var(--muted)]">Single Occupancy</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">
              {formatNumber(metrics.occupancyByRoomType.SINGLE_OCCUPANCY.rate)}%
            </dd>
            <dd className="mt-1 text-xs text-[var(--muted)]">
              {metrics.occupancyByRoomType.SINGLE_OCCUPANCY.booked} / {metrics.occupancyByRoomType.SINGLE_OCCUPANCY.available} nights
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <dt className="text-sm text-[var(--muted)]">Double Occupancy</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">
              {formatNumber(metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.rate)}%
            </dd>
            <dd className="mt-1 text-xs text-[var(--muted)]">
              {metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.booked} / {metrics.occupancyByRoomType.DOUBLE_OCCUPANCY.available} nights
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold">Booking Activity</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <dt className="text-sm text-[var(--muted)]">Requests Received</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">
              {metrics.bookingRequestsReceived}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <dt className="text-sm text-[var(--muted)]">Confirmed</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">
              {metrics.bookingRequestsConfirmed}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <dt className="text-sm text-[var(--muted)]">Cancelled</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">
              {metrics.bookingRequestsCancelled}
            </dd>
          </div>
          <MetricCard
            title="Confirmation Rate"
            value={formatNumber(metrics.confirmationRate)}
            comparison={metrics.comparison.confirmationRate}
            suffix="%"
          />
        </dl>
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold">Guest Profile</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <dt className="text-sm text-[var(--muted)]">Member Bookings</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">
              {metrics.memberBookings}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <dt className="text-sm text-[var(--muted)]">Non-Member Bookings</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">
              {metrics.nonMemberBookings}
            </dd>
          </div>
          <MetricCard
            title="Member Split"
            value={formatNumber(metrics.memberSplit)}
            comparison={metrics.comparison.memberSplit}
            suffix="%"
          />
          <MetricCard
            title="Avg Length of Stay"
            value={formatNumber(metrics.averageLengthOfStay)}
            comparison={metrics.comparison.averageLengthOfStay}
            suffix=" nights"
          />
        </dl>
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold">Average Lead Time</h2>
        <dl className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          <MetricCard
            title="Days Between Booking and Check-in"
            value={formatNumber(metrics.averageLeadTime)}
            comparison={metrics.comparison.averageLeadTime}
            suffix=" days"
          />
        </dl>
      </section>

      <section className="space-y-6">
        <h2 className="text-base font-semibold">
          Trends (Last 12 {viewMode === "weekly" ? "Weeks" : "Months"})
        </h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <TrendChart
              data={trendData}
              metric="totalRevenue"
              label="Total Revenue (TTD)"
            />
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <TrendChart
              data={trendData}
              metric="occupancyRate"
              label="Occupancy Rate (%)"
            />
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <TrendChart
              data={trendData}
              metric="roomRevenue"
              label="Room Revenue (TTD)"
            />
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--border)] p-6">
            <TrendChart
              data={trendData}
              metric="confirmationRate"
              label="Confirmation Rate (%)"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

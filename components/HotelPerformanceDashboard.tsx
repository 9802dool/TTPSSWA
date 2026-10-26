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

interface Props {
  bookings: HotelBooking[];
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

export function HotelPerformanceDashboard({ bookings }: Props) {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("monthly");
  const [selectedDate, setSelectedDate] = useState(getTrinidadToday());

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
      ? `Week of ${range.start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : range.start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    
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
    const newDate = new Date(selectedDate);
    if (viewMode === "weekly") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedDate(newDate);
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

        <button
          onClick={handleExport}
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Export CSV
        </button>
      </div>

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

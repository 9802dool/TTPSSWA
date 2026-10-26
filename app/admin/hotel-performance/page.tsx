import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-auth";
import { HotelPerformanceDashboard } from "@/components/HotelPerformanceDashboard";
import { loadHotelBookings } from "@/lib/hotel-performance-data";

export const metadata: Metadata = {
  title: "Hotel Performance | Admin | TTPSSWA",
  description: "Executive hotel performance metrics and analytics.",
};

export default async function AdminHotelPerformancePage() {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;

  if (!session) {
    redirect("/admin/login?next=/admin/hotel-performance");
  }

  const { bookings, skipped } = await loadHotelBookings();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <header className="border-b border-[var(--border)] bg-[var(--surface)] pt-[var(--site-header-stack)]">
        <div className="site-container flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              <Link href="/admin" className="text-[var(--brand)] hover:underline">
                ← Site administration
              </Link>
            </p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight">
              Hotel Performance
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Executive metrics and trends ({bookings.length} booking{bookings.length === 1 ? "" : "s"}{skipped > 0 ? `, ${skipped} legacy skipped` : ""})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/hotel-reservations"
              className="text-sm font-medium text-[var(--brand)] hover:underline"
            >
              Hotel reservations
            </Link>
            <Link href="/admin" className="text-sm text-[var(--brand)] hover:underline">
              Site administration
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="site-container py-10">
        <HotelPerformanceDashboard bookings={bookings} sessionRole={session.role} />
      </main>
    </div>
  );
}

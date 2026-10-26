import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import SiteHeader from "@/components/SiteHeader";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-auth";
import { HotelPerformanceDashboard } from "@/components/HotelPerformanceDashboard";
import { PrismaClient } from "@prisma/client";
import type { HotelBooking } from "@/lib/hotel-performance-metrics";

export const metadata: Metadata = {
  title: "Hotel Performance | Admin | TTPSSWA",
  description: "Executive hotel performance metrics and analytics.",
};

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

export default async function AdminHotelPerformancePage() {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = token ? verifyAdminSession(token) : null;

  if (!session) {
    redirect("/admin/login?next=/admin/hotel-performance");
  }

  const bookings = await getHotelBookings();

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
              Executive metrics and trends ({bookings.length} booking{bookings.length === 1 ? "" : "s"})
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
        <HotelPerformanceDashboard bookings={bookings} />
      </main>
    </div>
  );
}

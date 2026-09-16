import type { Metadata } from "next";
import SimpleBookingForm from "@/components/hotel/SimpleBookingForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Hotel reservations | TTPSSWA",
  description:
    "Book a TTPSSWA guest house room with live category capacity checks.",
};

export default function HotelReservationsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-slate-100 pt-[var(--site-header-stack)]">
        <section className="border-b border-white/10 bg-navy text-white">
          <div className="site-container py-10 text-center sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
              Noel Chase Hotel and Conference Centre
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Guest house reservations
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Eight rooms across three categories: two presidential suites, two
              single-occupancy rooms, and four double-occupancy rooms.
            </p>
          </div>
        </section>
        <section className="site-container px-4 py-6 sm:px-6 sm:py-10">
          <SimpleBookingForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

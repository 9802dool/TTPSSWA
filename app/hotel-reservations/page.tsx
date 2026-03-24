import type { Metadata } from "next";
import HotelReservationForm from "@/components/HotelReservationForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Hotel reservations | TTPSSWA",
  description:
    "Request hotel accommodation: check-in and check-out dates and times — TTPSSWA.",
};

export default function HotelReservationsPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[4.25rem]">
        <section className="relative overflow-hidden border-b border-line bg-navy text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(12 25 41) 0%, rgb(30 58 95) 50%, rgb(30 64 175 / 0.25) 100%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Travel
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Hotel reservations
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              Submit a reservation request with your stay dates, check-in and
              check-out times, and guest details. Confirmation is subject to
              availability.
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-canvas py-14 dark:bg-canvas">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Booking
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
                Request a stay
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Replace placeholder copy and connect this form to your hotel
                partner, PMS, or email automation when ready. Fields marked{" "}
                <span className="text-red-600">*</span> are required.
              </p>
            </div>
            <HotelReservationForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

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
      <main className="pt-[var(--site-header-stack)]">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-navy text-white">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(160deg, rgb(12 25 41) 0%, rgb(30 58 95 / .8) 55%, rgb(30 64 175 / .2) 100%)",
            }}
          />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:py-28">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Accommodation
              </div>
              <h1 className="mt-4 max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]">
                Stay with TTPSSWA
              </h1>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-300">
                8 rooms across three categories. Choose your dates, pick rooms,
                and submit a request — our coordinator confirms rates and
                availability.
              </p>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
                <span className="flex items-center gap-2"><span className="text-lg">🏨</span> 8 rooms</span>
                <span className="flex items-center gap-2"><span className="text-lg">👤</span> Up to 10 guests</span>
                <span className="flex items-center gap-2"><span className="text-lg">📧</span> Email confirmation</span>
              </div>
            </div>
            <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm lg:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                Room types
              </p>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li>2 &times; Presidential suite</li>
                <li>2 &times; Full bed room</li>
                <li>4 &times; Double bed room</li>
              </ul>
              <p className="mt-4 text-xs text-white/40">
                Rooms adjustable on request.
              </p>
            </div>
          </div>
        </section>

        {/* ── Location map ── */}
        <section className="bg-surface py-12 dark:bg-surface lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Our Location
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              Find us on the map below.
            </p>
            <div className="mt-6 overflow-hidden rounded-xl border border-line shadow-corp">
              <iframe
                title="TTPSSWA Hotel Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1962.5!2d-60.82871992401175!3d11.158669870877992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDA5JzMxLjIiTiA2MMKwNDknNDMuNCJX!5e0!3m2!1sen!2stt!4v1700000000000"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* ── Booking form section ── */}
        <section className="bg-canvas py-12 dark:bg-canvas lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <HotelReservationForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

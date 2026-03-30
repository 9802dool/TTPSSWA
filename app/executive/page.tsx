import type { Metadata } from "next";

import SiteFooter from "@/components/SiteFooter";

import SiteHeader from "@/components/SiteHeader";

import { ExecutiveTeamGrid } from "@/components/ExecutiveTeamGrid";



export const metadata: Metadata = {

  title: "OUR EXECUTIVE TEAM | TTPSSWA",

  description: "TTPSSWA executive committee — leadership and representatives.",

};



export default function ExecutivePage() {

  return (

    <>

      <SiteHeader />

      <main className="pt-[var(--site-header-stack)]">

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

            <p className="mb-4 inline-flex rounded-full border border-blue-400/45 bg-blue-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">

              Leadership

            </p>

            <h1 className="text-3xl font-bold tracking-wide sm:text-4xl md:text-5xl">

              OUR EXECUTIVE TEAM

            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">

              Meet the executive committee. Click any portrait photo to read a member

              biography.

            </p>

          </div>

        </section>



        <ExecutiveTeamGrid />

      </main>

      <SiteFooter />

    </>

  );

}


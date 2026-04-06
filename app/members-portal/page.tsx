import type { Metadata } from "next";
import Link from "next/link";
import { MembersLoginForm } from "@/components/MembersLoginForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Members portal | TTPSSWA",
  description: "Sign in to your member account.",
};

export default function MembersPortalPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-navy pt-[var(--site-header-stack)] text-white">
        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-center text-2xl font-bold">Members portal</h1>
          <p className="mt-3 text-center text-sm text-slate-400">
            Sign in with the username or email from your accepted application. New members can{" "}
            <Link href="/login" className="font-semibold text-sky-300 underline underline-offset-2 hover:text-white">
              apply here
            </Link>
            .
          </p>
          <MembersLoginForm variant="dark" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

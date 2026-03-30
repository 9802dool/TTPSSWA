import type { Metadata } from "next";
import { MembersBenefitsBlock } from "@/components/MembersBenefitsBlock";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Members Benefits | TTPSSWA",
  description: "TTPSSWA member benefits — full list of association programs and support.",
};

export default function MembershipServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-var(--site-header-stack))] bg-[#0a0f18] pt-[var(--site-header-stack)] text-white dark:bg-[#050810]">
        <section
          id="members-services"
          className="scroll-mt-24 px-4 py-10 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div id="members-benefits" className="scroll-mt-24">
              <MembersBenefitsBlock variant="dark" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

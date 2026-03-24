import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import MemberLoginForm from "@/components/MemberLoginForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Member sign in | TTPSSWA",
  description: "Sign in to access TTPSSWA membership services.",
};

type Props = { searchParams: Record<string, string | string[] | undefined> };

export default async function LoginPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const callback = searchParams.callbackUrl;
  const callbackUrl =
    typeof callback === "string" ? callback : "/membership-services";
  if (session) {
    redirect(callbackUrl.startsWith("/") ? callbackUrl : "/membership-services");
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-12rem)] bg-canvas pt-[4.25rem] dark:bg-canvas">
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <p className="text-center text-sm text-muted">Loading sign-in…</p>
            }
          >
            <MemberLoginForm />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
